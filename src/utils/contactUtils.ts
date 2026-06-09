export interface ContactNameInput {
  civility?: string | null;
  firstname: string;
  lastname: string;
}

/**
 * Format a contact's display name.
 * Default: includes civility prefix ("Dr. Jane Smith").
 * short: true — omits civility, for compact calendar blocks.
 */
export const formatContactName = (
  contact: ContactNameInput,
  opts?: { short?: boolean },
): string => {
  const prefix = !opts?.short && contact.civility ? `${contact.civility} ` : '';
  return `${prefix}${contact.firstname} ${contact.lastname}`;
};
