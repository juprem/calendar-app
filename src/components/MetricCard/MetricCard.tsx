interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export function MetricCard({ label, value, subtitle }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="text-slate-600 dark:text-slate-400 text-sm mb-2">{label}</div>
      <div className="text-3xl font-semibold text-slate-900 dark:text-white mb-1">{value}</div>
      {subtitle && <div className="text-slate-700 dark:text-slate-300 text-sm">{subtitle}</div>}
    </div>
  );
}

