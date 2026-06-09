# Agents & Orchestrators with Claude

A reference guide covering concepts, patterns, best practices, and a concrete implementation
built for this calendar app.

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Setting Up a Basic Agent](#setting-up-a-basic-agent)
3. [Orchestrator Pattern](#orchestrator-pattern)
4. [Architecture Patterns](#architecture-patterns)
5. [Best Practices](#best-practices)
6. [Concrete Example: Smart Scheduling Assistant](#concrete-example-smart-scheduling-assistant)
7. [When NOT to Use Agents](#when-not-to-use-agents)

---

## Core Concepts

An **agent** is a Claude instance in a loop: it reasons, calls tools, receives results, and
continues until a task is complete.

An **orchestrator** is a Claude instance that breaks work into sub-tasks and delegates them to
specialized subagents. It never does the work itself — it reasons, plans, and synthesizes.

```
User request
    └─ Orchestrator         (reasons & decomposes)
         ├─ Subagent A      (specialist: reads data)
         ├─ Subagent B      (specialist: checks constraints)
         └─ Subagent C      (specialist: writes result)
              └─ final answer synthesized by the orchestrator
```

---

## Setting Up a Basic Agent

The agent loop is built on **tool use**. Claude decides when and which tools to call; your
code executes them and feeds the results back.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const tools: Anthropic.Tool[] = [
  {
    name: "web_search",
    description: "Search the web for up-to-date information",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
      },
      required: ["query"],
    },
  },
];

async function runAgent(userMessage: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  const MAX_TURNS = 15;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      tools,
      messages,
    });

    // Agent finished reasoning — return its final text
    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      return textBlock?.type === "text" ? textBlock.text : "";
    }

    // Agent called tools — execute them and feed results back
    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === "tool_use") {
          const result = await executeTool(block.name, block.input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      // Append Claude's turn and the tool results before the next iteration
      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    }
  }

  throw new Error("Agent exceeded maximum turn limit");
}

async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  if (name === "web_search") {
    // call your actual search API here
    return JSON.stringify({ results: [] });
  }
  throw new Error(`Unknown tool: ${name}`);
}
```

### Key points

| Aspect | Detail |
|---|---|
| `stop_reason === "end_turn"` | Agent is done — extract the final text |
| `stop_reason === "tool_use"` | Agent needs tool results — execute and loop |
| `MAX_TURNS` | Hard cap to prevent infinite loops |
| Message order | Always: `user → assistant → user (tool_results) → assistant → …` |

---

## Orchestrator Pattern

The orchestrator holds the high-level reasoning; subagents do the work. Pass only the
context each subagent needs — not the full conversation history.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// --- Subagent factory ---------------------------------------------------

type AgentRole = "researcher" | "coder" | "reviewer";

const SYSTEM_PROMPTS: Record<AgentRole, string> = {
  researcher:
    "You are a research specialist. Return only a structured JSON object with your findings.",
  coder:
    "You are a coding specialist. Return only working TypeScript code with no explanation.",
  reviewer:
    "You are a code reviewer. Return only a JSON array of findings: [{severity, file, message}].",
};

async function runSubagent(role: AgentRole, task: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001", // cheaper model for routine subagents
    max_tokens: 2048,
    system: SYSTEM_PROMPTS[role],
    messages: [{ role: "user", content: task }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

// --- Orchestrator -------------------------------------------------------

const delegateTool: Anthropic.Tool = {
  name: "delegate_to_agent",
  description:
    "Delegate a sub-task to a specialized subagent and return its output.",
  input_schema: {
    type: "object",
    properties: {
      agent_type: {
        type: "string",
        enum: ["researcher", "coder", "reviewer"],
        description: "Which specialist to use",
      },
      task: {
        type: "string",
        description:
          "A complete, self-contained instruction for the subagent. Include all required context.",
      },
    },
    required: ["agent_type", "task"],
  },
};

async function orchestrate(goal: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: goal },
  ];

  for (let turn = 0; turn < 20; turn++) {
    const response = await client.messages.create({
      model: "claude-opus-4-8", // capable model for high-level reasoning
      max_tokens: 4096,
      system:
        "You are an orchestrator. Break the goal into sub-tasks. " +
        "Use delegate_to_agent for each sub-task. " +
        "When all sub-tasks are complete, synthesize the results and answer the user.",
      tools: [delegateTool],
      messages,
    });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      return textBlock?.type === "text" ? textBlock.text : "";
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === "tool_use") {
          const input = block.input as { agent_type: AgentRole; task: string };
          const result = await runSubagent(input.agent_type, input.task);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    }
  }

  throw new Error("Orchestrator exceeded maximum turn limit");
}
```

---

## Architecture Patterns

| Pattern | Shape | When to use |
|---|---|---|
| **Sequential pipeline** | A → B → C | Each step depends on the prior result |
| **Parallel fan-out** | A splits into B1, B2, B3 → merge | Independent sub-tasks with no cross-dependency |
| **Hierarchical** | Orchestrator → sub-orchestrators → workers | Very large tasks needing multi-level decomposition |
| **Specialist pool** | Router → domain agent | Tasks that map cleanly to fixed domain experts |

---

## Best Practices

### 1. Trust & Security

- **Treat subagent output as untrusted input.** Validate it before passing it downstream.
- Prompt-injection attacks can travel through agent chains. Sanitize content from external sources.
- Apply least-privilege: give each agent only the tools it strictly needs.

### 2. Model Selection

| Role | Recommended model | Reason |
|---|---|---|
| Orchestrator | `claude-opus-4-8` or `claude-sonnet-4-6` | Needs strong reasoning |
| Routine subagent | `claude-haiku-4-5-20251001` | Faster and cheaper for narrow tasks |

Default to **omitting the model override** — agents inherit the session model. Only override
when you are confident a different tier fits the task.

### 3. Focused Agent Prompts

- Give each agent **one clear role** — avoid multi-role prompts.
- Include explicit stop conditions (`"Return JSON when done, nothing else."`).
- Use **structured outputs (JSON schemas)** for inter-agent communication to avoid parsing
  ambiguity.

### 4. Tool Design

- Write descriptions as if explaining to a junior developer — not too terse, not over-explained.
- Keep tool scope narrow: one concern per tool.
- Return structured errors (not raw exceptions) so the agent can reason about failures.

### 5. Loop Control

```typescript
const MAX_TURNS = 15;
let turn = 0;

while (turn < MAX_TURNS) {
  turn++;
  const response = await client.messages.create({ ... });

  if (response.stop_reason === "end_turn") break;

  if (response.stop_reason === "max_tokens") {
    // Handle gracefully — summarize state or abort cleanly
    break;
  }
}
```

### 6. Prompt Caching

For long system prompts or shared context, mark the block with `cache_control` to avoid
re-processing it on every turn:

```typescript
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  system: [
    {
      type: "text",
      text: longSystemPrompt,
      cache_control: { type: "ephemeral" }, // cached for up to 5 minutes
    },
  ],
  messages,
});
```

### 7. Context Management

- Agents accumulate context fast. Summarize completed steps before the conversation grows too large.
- Pass only the context each subagent actually needs — not the full conversation history.
- Use `max_tokens` as a real budget, not just a safety guard.

---

## Concrete Example: Smart Scheduling Assistant

A multi-agent assistant for **this calendar app** that accepts a natural-language scheduling
request and creates the RDV automatically by:

1. Reading the existing appointments for the requested day via the tRPC API
2. Detecting conflicts
3. Suggesting an available time slot
4. Creating the appointment in NeonDB

### Overview

```
User: "Schedule a 1-hour meeting with Alice Martin next Monday afternoon"
    │
    ▼
Orchestrator (claude-sonnet-4-6)
    │ parses intent, decides what to delegate
    ├─► calendar-reader agent  → fetches RDVs for the target date via tRPC
    ├─► conflict-checker agent → analyses the fetched RDVs, finds a free slot
    └─► scheduler agent        → calls tRPC addRdv to persist the new appointment
    │
    ▼
"Scheduled: meeting with Alice Martin on Monday 09/06/2026 from 14:00 to 15:00 ✓"
```

### File: `src/ai/schedulingAssistant.ts`

```typescript
/**
 * Smart Scheduling Assistant
 *
 * Uses a three-agent pipeline orchestrated by Claude to:
 *   1. Read existing RDVs for a target date (calendar-reader agent)
 *   2. Find a conflict-free time slot (conflict-checker agent)
 *   3. Create the new RDV (scheduler agent)
 *
 * Entry point: scheduleAppointment(request, targetDate)
 *
 * Dependencies:
 *   - ANTHROPIC_API_KEY env var
 *   - Internal tRPC procedures: calendar.listByDay, calendar.addRdv
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { RdvModel } from "@/models/RdvModel";

// ---------------------------------------------------------------------------
// Tool input schemas (used for validation — no `as` assertions)
// ---------------------------------------------------------------------------

const FetchRdvsInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const CreateRdvInput = z.object({
  name: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_hour: z.string().regex(/^\d{2}:\d{2}$/),
  end_hour: z.string().regex(/^\d{2}:\d{2}$/),
  rdv_type: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The input accepted by the top-level scheduling function */
export interface SchedulingRequest {
  /** Natural-language description: "1-hour meeting with Alice Martin" */
  description: string;
  /** ISO date string for the target day: "2026-06-09" */
  targetDate: string;
  /** Preferred window start in HH:mm format, e.g. "14:00" */
  preferredStart?: string;
  /** Preferred window end in HH:mm format, e.g. "18:00" */
  preferredEnd?: string;
}

/** Structured result returned by the scheduling assistant */
export interface SchedulingResult {
  success: boolean;
  /** Human-readable summary of what was done or why it failed */
  message: string;
  /** The created RDV if success === true */
  rdv?: {
    name: string;
    start_hour: string;
    end_hour: string;
    date: string;
  };
}

// ---------------------------------------------------------------------------
// Anthropic client (singleton)
// ---------------------------------------------------------------------------

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

/**
 * Fetches all RDVs for a given date from the calendar app's tRPC endpoint.
 * The orchestrator delegates to this tool via the calendar-reader subagent.
 */
const fetchRdvsTool: Anthropic.Tool = {
  name: "fetch_rdvs_for_day",
  description:
    "Fetch all existing appointments (RDVs) for a specific date from the calendar database.",
  input_schema: {
    type: "object",
    properties: {
      date: {
        type: "string",
        description: "ISO date string (YYYY-MM-DD) of the day to query",
      },
    },
    required: ["date"],
  },
};

/**
 * Persists a new RDV via the calendar app's tRPC addRdv procedure.
 * The orchestrator delegates to this tool via the scheduler subagent.
 */
const createRdvTool: Anthropic.Tool = {
  name: "create_rdv",
  description: "Create a new appointment (RDV) in the calendar database.",
  input_schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Display name for the appointment, e.g. 'Meeting with Alice Martin'",
      },
      date: {
        type: "string",
        description: "ISO date string (YYYY-MM-DD)",
      },
      start_hour: {
        type: "string",
        description: "Start time in HH:mm format, e.g. '14:00'",
      },
      end_hour: {
        type: "string",
        description: "End time in HH:mm format, e.g. '15:00'",
      },
      rdv_type: {
        type: "string",
        description: "Optional type label, e.g. 'Meeting', 'Call', 'Personal'",
      },
    },
    required: ["name", "date", "start_hour", "end_hour"],
  },
};

// ---------------------------------------------------------------------------
// Tool execution helpers
// ---------------------------------------------------------------------------

/**
 * Executes fetch_rdvs_for_day by calling the tRPC calendar.listByDay procedure.
 *
 * In a real integration this would use a server-side tRPC caller so the agent
 * can run inside a Cloudflare Worker handler without an HTTP round-trip.
 */
async function executeFetchRdvs(date: string): Promise<string> {
  // Replace with: const caller = appRouter.createCaller({});
  // const result = await caller.calendar.listByDay(date);
  // return JSON.stringify(result.rdvs);

  // Stub — returns sample data matching the RdvModel shape
  const stubRdvs: Pick<RdvModel, "name" | "start_hour" | "end_hour">[] = [
    { name: "Team standup", start_hour: "09:00", end_hour: "09:30" },
    { name: "Design review", start_hour: "11:00", end_hour: "12:00" },
  ];
  return JSON.stringify({ date, rdvs: stubRdvs });
}

/**
 * Executes create_rdv by calling the tRPC calendar.addRdv procedure.
 *
 * Returns a JSON string with { success, rdvId } so the agent can confirm
 * the write without needing to re-fetch.
 */
async function executeCreateRdv(input: {
  name: string;
  date: string;
  start_hour: string;
  end_hour: string;
  rdv_type?: string;
}): Promise<string> {
  // Replace with: const result = await caller.calendar.addRdv({ ... });

  // Stub — simulates a successful creation
  console.log("[create_rdv] Creating RDV:", input);
  return JSON.stringify({ success: true, rdvId: 42, ...input });
}

// ---------------------------------------------------------------------------
// Generic agent runner
// ---------------------------------------------------------------------------

/**
 * Runs a single Claude agent to completion.
 *
 * @param systemPrompt - The agent's role and output format instructions
 * @param userMessage  - The specific task for this agent
 * @param tools        - The tools available to this agent
 * @param model        - Model override (defaults to claude-haiku for subagents)
 */
async function runAgent(
  systemPrompt: string,
  userMessage: string,
  tools: Anthropic.Tool[],
  model = "claude-haiku-4-5-20251001"
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  for (let turn = 0; turn < 10; turn++) {
    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      system: systemPrompt,
      tools,
      messages,
    });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      return textBlock?.type === "text" ? textBlock.text : "";
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        let result: string;

        if (block.name === "fetch_rdvs_for_day") {
          const parsed = FetchRdvsInput.safeParse(block.input);
          if (!parsed.success) {
            result = JSON.stringify({ error: "Invalid fetch_rdvs_for_day input" });
          } else {
            result = await executeFetchRdvs(parsed.data.date);
          }
        } else if (block.name === "create_rdv") {
          const parsed = CreateRdvInput.safeParse(block.input);
          if (!parsed.success) {
            result = JSON.stringify({ error: "Invalid create_rdv input" });
          } else {
            result = await executeCreateRdv(parsed.data);
          }
        } else {
          result = JSON.stringify({ error: `Unknown tool: ${block.name}` });
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    }
  }

  throw new Error("Agent exceeded maximum turn limit");
}

// ---------------------------------------------------------------------------
// Subagent definitions
// ---------------------------------------------------------------------------

/**
 * SUBAGENT 1 — Calendar Reader
 *
 * Role: fetch all existing RDVs for the target date.
 * Output: a JSON string listing existing appointments with their time slots.
 * Model: Haiku (simple data-fetching task, no reasoning required).
 */
async function runCalendarReaderAgent(date: string): Promise<string> {
  return runAgent(
    `You are a calendar data-fetching specialist.
Your only job is to call fetch_rdvs_for_day for the date you are given, then return the
raw JSON result as-is. Do not add any commentary. Return only valid JSON.`,
    `Fetch all RDVs for date: ${date}`,
    [fetchRdvsTool]
  );
}

/**
 * SUBAGENT 2 — Conflict Checker
 *
 * Role: analyse existing RDVs and find a free slot matching the request.
 * Output: a JSON object { available: boolean, suggestedStart: string, suggestedEnd: string, reason: string }.
 * Model: Haiku with a focused analytical prompt.
 */
async function runConflictCheckerAgent(
  existingRdvsJson: string,
  durationMinutes: number,
  preferredStart: string,
  preferredEnd: string
): Promise<string> {
  return runAgent(
    `You are a scheduling conflict-detection specialist.
You receive a list of existing appointments and a duration. Find the earliest available
time slot in the preferred window with no conflicts.

Return ONLY a JSON object with this exact shape:
{
  "available": boolean,
  "suggestedStart": "HH:mm",
  "suggestedEnd": "HH:mm",
  "reason": "short explanation"
}`,
    `Existing appointments: ${existingRdvsJson}
Duration needed: ${durationMinutes} minutes
Preferred window: ${preferredStart} – ${preferredEnd}
Find an available slot.`,
    [] // no tools needed — pure reasoning
  );
}

/**
 * SUBAGENT 3 — Scheduler
 *
 * Role: create the RDV using the determined time slot.
 * Output: a JSON object { success: boolean, message: string, rdv?: {...} }.
 * Model: Haiku (single tool call, minimal reasoning).
 */
async function runSchedulerAgent(
  name: string,
  date: string,
  startHour: string,
  endHour: string,
  rdvType?: string
): Promise<string> {
  return runAgent(
    `You are an appointment creation specialist.
Your only job is to call create_rdv with the exact parameters you are given, then return
the tool result as-is. Do not add any commentary. Return only valid JSON.`,
    JSON.stringify({ name, date, start_hour: startHour, end_hour: endHour, rdv_type: rdvType }),
    [createRdvTool]
  );
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

/**
 * Orchestrates the three subagents to schedule an appointment end-to-end.
 *
 * Flow:
 *   1. calendar-reader  → returns existing RDVs for the target date
 *   2. conflict-checker → returns an available time slot
 *   3. scheduler        → persists the new RDV and returns confirmation
 *
 * The orchestrator itself (claude-sonnet-4-6) synthesises the final result.
 * All subagents use claude-haiku to keep costs low.
 *
 * @param request - The scheduling request (see SchedulingRequest)
 * @returns SchedulingResult with success flag and human-readable message
 */
export async function scheduleAppointment(
  request: SchedulingRequest
): Promise<SchedulingResult> {
  const {
    description,
    targetDate,
    preferredStart = "08:00",
    preferredEnd = "18:00",
  } = request;

  console.log("[orchestrator] Starting scheduling pipeline for:", description);

  // ── Step 1: Read existing RDVs ────────────────────────────────────────────
  console.log("[orchestrator] Step 1 — fetching existing RDVs");
  const existingRdvsJson = await runCalendarReaderAgent(targetDate);
  console.log("[calendar-reader] result:", existingRdvsJson);

  // ── Step 2: Find a free slot ──────────────────────────────────────────────
  console.log("[orchestrator] Step 2 — checking for conflicts");

  // Ask the orchestrator to extract the duration from the description
  const durationResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 128,
    system: "Extract the meeting duration in minutes from the description. Return only a number.",
    messages: [{ role: "user", content: description }],
  });
  const durationBlock = durationResponse.content[0];
  const rawDuration = durationBlock.type === "text" ? parseInt(durationBlock.text.trim(), 10) : NaN;
  const durationMinutes = Number.isNaN(rawDuration) ? 60 : rawDuration;
  console.log("[orchestrator] Duration extracted:", durationMinutes, "min");

  const slotJson = await runConflictCheckerAgent(
    existingRdvsJson,
    durationMinutes,
    preferredStart,
    preferredEnd
  );
  console.log("[conflict-checker] result:", slotJson);

  let slot: { available: boolean; suggestedStart: string; suggestedEnd: string; reason: string };
  try {
    slot = JSON.parse(slotJson);
  } catch {
    return { success: false, message: "Conflict checker returned unparseable output." };
  }

  if (!slot.available) {
    return {
      success: false,
      message: `No available slot found: ${slot.reason}`,
    };
  }

  // ── Step 3: Create the RDV ────────────────────────────────────────────────
  console.log("[orchestrator] Step 3 — creating the RDV");

  // Derive a clean appointment name from the description
  const nameResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 64,
    system: "Create a short, clean appointment name (max 5 words) from the description. Return only the name.",
    messages: [{ role: "user", content: description }],
  });
  const nameBlock = nameResponse.content[0];
  const rdvName = nameBlock.type === "text" ? nameBlock.text.trim() : description;

  const creationJson = await runSchedulerAgent(
    rdvName,
    targetDate,
    slot.suggestedStart,
    slot.suggestedEnd
  );
  console.log("[scheduler] result:", creationJson);

  let creation: { success: boolean };
  try {
    creation = JSON.parse(creationJson);
  } catch {
    return { success: false, message: "Scheduler returned unparseable output." };
  }

  if (!creation.success) {
    return { success: false, message: "Appointment could not be created in the database." };
  }

  // ── Final: synthesise a human-readable confirmation ───────────────────────
  return {
    success: true,
    message: `Scheduled "${rdvName}" on ${targetDate} from ${slot.suggestedStart} to ${slot.suggestedEnd}.`,
    rdv: {
      name: rdvName,
      date: targetDate,
      start_hour: slot.suggestedStart,
      end_hour: slot.suggestedEnd,
    },
  };
}
```

> **Cloudflare Workers note**: Replace `process.env.ANTHROPIC_API_KEY` with the `env.ANTHROPIC_API_KEY`
> binding passed to your Worker's `fetch` handler. Instantiate the `Anthropic` client inside the
> request handler — not at module scope — so the binding is in scope.

### How to integrate this into the calendar app

The assistant is designed to be called from a **tRPC procedure** so it is fully server-side
and behind Clerk authentication.

#### 1. Add a tRPC procedure

In `src/integrations/trpc/router/calendarRouter.ts`, add:

```typescript
import { scheduleAppointment } from "@/ai/schedulingAssistant";
import { z } from "zod";

// Inside the calendarRouter:
scheduleNaturalLanguage: publicProcedure
  .input(
    z.object({
      description: z.string().min(5),
      targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      preferredStart: z.string().optional(),
      preferredEnd: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    return scheduleAppointment(input);
  }),
```

#### 2. Add a service hook

In `src/services/calendarService.ts`:

```typescript
export function useScheduleNaturalLanguage() {
  const trpc = useTRPC();
  return useMutation(trpc.calendar.scheduleNaturalLanguage.mutationOptions());
}
```

#### 3. Add the UI trigger

In the existing `AddRdv` modal (`src/components/Layout/AddRdv/AddRdv.tsx`), add a
natural-language input field that calls `useScheduleNaturalLanguage`:

```tsx
const { mutate: scheduleAI, isPending } = useScheduleNaturalLanguage();

<Input.TextArea
  placeholder='e.g. "1-hour meeting with Alice Martin Monday afternoon"'
  onPressEnter={(e) =>
    scheduleAI({
      description: e.currentTarget.value,
      targetDate: selectedDay.format("YYYY-MM-DD"),
    })
  }
/>
```

### Token cost estimate

| Agent | Model | Typical tokens | Cost (approx.) |
|---|---|---|---|
| Orchestrator calls (×3) | claude-sonnet-4-6 | ~500 | ~$0.002 |
| calendar-reader | claude-haiku-4-5 | ~300 | ~$0.0001 |
| conflict-checker | claude-haiku-4-5 | ~600 | ~$0.0002 |
| scheduler | claude-haiku-4-5 | ~300 | ~$0.0001 |
| **Total per request** | | **~1 700** | **~$0.003** |

---

## Current Claude Code Orchestrator Structure

When you ask Claude Code for a new feature in this repo, the following pipeline runs:

```
Your message
    │
    ▼
Claude Code (main loop) ──── orchestrator
    │
    ├─ reads CLAUDE.md             standing instructions (keep console.logs, always review, etc.)
    ├─ reads MEMORY.md             persistent project + user context
    │
    ├─ Skill: project-context ─── researcher subagent
    │     loads stack, conventions, DB schema, component map
    │
    ├─ Tools: Read / Bash / Explore agent
    │     reads specific files, greps the codebase
    │
    ├─ [writes code itself]        THE GAP — orchestrator = coder, no separation
    │     Edit / Write / Bash
    │
    └─ Skill: agnostic-reviewer-expert ── reviewer subagent
          reviews the full diff at the end
```

### The four missing layers

| Layer | Problem today | What it should be |
|---|---|---|
| **Planner** | Orchestrator reasons and codes as the same instance | Independent planner agent reads the codebase and produces a structured step-by-step plan before any code is written |
| **Parallel coders** | Steps are always sequential | Steps with no dependency on each other run as concurrent agents (one agent per module) |
| **Incremental reviewer** | Reviewer runs once at the very end | Reviewer runs after each file is written and feeds critical issues back to the coder before moving on |
| **Test-runner agent** | Tests run manually if at all | A dedicated agent runs the test suite, parses failures, and patches code — looping until tests pass or max retries hit |

---

## Extended: Autonomous Coding Pipeline

### Architecture

```
Goal (CLI arg)
    │
    ▼
┌─────────────────────────────────────────┐
│  Orchestrator  (coding-agent/index.ts)  │
│                                         │
│  Phase 1 — Plan                         │
│    └─ Planner agent                     │
│         reads codebase → ImplementationPlan (steps + deps)
│                                         │
│  Phase 2 — Implement                    │
│    batch 1: [step-A, step-B] ──────────── parallel (no deps between them)
│      step-A: Coder → Reviewer → Coder?  │  incremental review loop
│      step-B: Coder → Reviewer → Coder?  │
│    batch 2: [step-C] (depends on A+B)   │
│      step-C: Coder → Reviewer → Coder?  │
│                                         │
│  Phase 3 — Test                         │
│    └─ Test-runner agent                 │
│         runs npm test → parses failures │
│         → fix agent → re-run (loop)     │
└─────────────────────────────────────────┘
```

### File structure

```
coding-agent/
  index.ts            orchestrator entry point + CLI
  types.ts            shared TypeScript interfaces
  tools.ts            Anthropic tool definitions + Node.js execution
  context.ts          project-specific context injected into all agent prompts
  agents/
    planner.ts        reads codebase → ImplementationPlan
    coder.ts          writes files for one PlanStep (retries on reviewer feedback)
    reviewer.ts       reviews a single file immediately after it is written
    testRunner.ts     runs npm test, parses failures, auto-patches
  tsconfig.json       Node.js-compatible TypeScript config for tsx execution
```

### Usage

```bash
# Run the full pipeline for a feature
npx tsx coding-agent/index.ts "Add a weekly stats tRPC procedure and a StatsCard component"

# The pipeline will:
#   1. Plan the steps with file-level granularity
#   2. Run independent steps in parallel
#   3. Review each file immediately after it is written
#   4. Run npm test and auto-patch failures
#   5. Print a final summary
```

---

### `coding-agent/types.ts` — Shared interfaces

All data flowing between agents is typed here. No inline type definitions in agents.

```typescript
/** One step in the implementation plan produced by the planner agent */
export interface PlanStep {
  id: string
  description: string
  filesToCreate: string[]
  filesToModify: string[]
  /** IDs of steps that must complete before this one can start */
  dependsOn: string[]
}

export interface ImplementationPlan {
  goal: string
  steps: PlanStep[]
}

export interface CodeChange {
  path: string
  operation: 'create' | 'modify'
}

export interface CoderResult {
  stepId: string
  changes: CodeChange[]
  success: boolean
  errorMessage?: string
}

export interface ReviewIssue {
  severity: 'critical' | 'suggestion'
  filePath: string
  message: string
}

export interface ReviewResult {
  filePath: string
  approved: boolean
  issues: ReviewIssue[]
}

export interface TestFailure {
  testName: string
  errorMessage: string
}

export interface TestResult {
  passed: boolean
  failures: TestFailure[]
  rawOutput: string
}

export interface PipelineResult {
  success: boolean
  message: string
  filesChanged: string[]
  testsPassed: boolean
  /** Number of parallel batches executed */
  batches: number
}
```

---

### `coding-agent/tools.ts` — Tool definitions + execution

Tool definitions (Anthropic schema) and their Node.js execution implementations live in
the same file. Every input is validated with Zod — no `as` assertions.

**Tools exposed to agents:**

| Tool | Agent(s) that use it | Purpose |
|---|---|---|
| `read_file` | planner, coder, reviewer, test-runner | Read any project file |
| `write_file` | coder, test-runner (fix agent) | Create or overwrite a file |
| `search_code` | planner, coder | grep across `src/` |
| `bash` | planner, test-runner | Run shell commands (tests, ls, git) |

`dispatchTool(name, input)` is the single execution entry point — all agents call it
instead of importing individual executors, keeping tool routing in one place.

---

### `coding-agent/context.ts` — Project context

A constant string injected into every agent's system prompt. Contains the tech stack,
mandatory conventions, DB schema, and current tRPC procedures.

Update this file when the project's conventions change — it is the single source of
truth for what agents know about the codebase.

---

### `coding-agent/agents/planner.ts` — Planner agent

**Model**: `claude-sonnet-4-6` (needs strong reasoning to read the codebase and decompose correctly)

**Tools**: `read_file`, `search_code`, `bash`

**Input**: natural-language goal string

**Output**: validated `ImplementationPlan` (Zod-parsed before returning)

The planner reads relevant files and produces steps with explicit `dependsOn` arrays.
Steps with empty `dependsOn` can run in parallel in Phase 2. The orchestrator uses
`buildExecutionBatches()` to group them.

**System prompt strategy**: instructs the model to return only JSON, provides the exact
schema, and enforces the rule that steps must be scoped to 1–3 files maximum.

---

### `coding-agent/agents/coder.ts` — Coder agent

**Model**: `claude-sonnet-4-6` (complex code generation)

**Tools**: `read_file`, `write_file`, `search_code`

**Input**: a `PlanStep` + optional `ReviewIssue[]` from a prior review

**Output**: `CoderResult` with the list of files written

When `reviewFeedback` is provided, the issues are appended to the user message as
"REVIEWER FEEDBACK TO FIX" — the coder re-reads and re-writes the flagged files without
changing anything that was already approved.

One instance runs per step. In a parallel batch, multiple instances run concurrently.

---

### `coding-agent/agents/reviewer.ts` — Reviewer agent

**Model**: `claude-haiku-4-5-20251001` (fast, focused on conventions — no reasoning required)

**Tools**: `read_file` only (no write access)

**Input**: a single file path

**Output**: `ReviewResult` with `approved: boolean` and a list of `ReviewIssue[]`

Runs immediately after the coder writes each file — not at the end. If `approved` is
false, the orchestrator routes the issues back to the coder (up to `MAX_REVIEW_RETRIES`
attempts before moving on with a warning).

The reviewer has no write access intentionally — it cannot fix code, only report issues.
This maintains the independence between the coder and reviewer roles.

---

### `coding-agent/agents/testRunner.ts` — Test-runner agent

**Model**: `claude-sonnet-4-6` (needs to reason about test failures and map them to fixes)

**Tools**: `read_file`, `write_file`, `bash`

**Flow**:
1. Runs `npm test` via `execSync`
2. If all tests pass → returns immediately
3. If tests fail → spawns a fix agent with the raw test output
4. Fix agent reads the failing test + the implementation, patches the code
5. Re-runs the test suite
6. Loops up to `maxFixAttempts` (default: 3)

Test output parsing uses a regex heuristic against Vitest's output format. The fix agent
receives the full raw output (not just parsed failures) so it can reason about stack traces.

---

### `coding-agent/index.ts` — Orchestrator

The top-level coordinator. Contains no Claude calls itself — it only orchestrates the
four agents.

**`buildExecutionBatches(steps)`** — dependency-aware batch grouper:
- Iterates until all steps are assigned to a batch
- A step enters the current batch only when all its `dependsOn` steps are in a prior batch
- Throws on circular dependencies

**`executeStepWithReview(step)`** — coder + reviewer loop for one step:
- Runs coder → collects written files → runs reviewer on each file in parallel
- If critical issues found → feeds back to coder (up to `MAX_REVIEW_RETRIES = 3`)
- Returns the list of file paths written

**Main flow**:
```
Phase 1: runPlannerAgent(goal)          → ImplementationPlan
Phase 2: for each batch
            Promise.all(batch.map(executeStepWithReview))
Phase 3: runTestRunnerAgent()           → TestResult
return PipelineResult
```

---

## When NOT to Use Agents

| Situation | Better approach |
|---|---|
| Simple single-turn answer | Plain `client.messages.create` call |
| Deterministic data transformation | Pure TypeScript function |
| Latency-sensitive path (< 200 ms) | Pre-computed result or rule engine |
| Guaranteed output format every time | Structured output prompt without agent loop |
| You need 100 % reproducible results | Agents make autonomous decisions — avoid |
