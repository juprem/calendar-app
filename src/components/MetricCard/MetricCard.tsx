import { Card } from '#/components/Card/Card.tsx';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export function MetricCard({ label, value, subtitle }: MetricCardProps) {
  const isNumeric = typeof value === 'number';

  return (
    <Card>
      <p className="text-xs text-[#78716C] mb-2 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mb-1 ${isNumeric ? 'text-[#92400E]' : 'text-[#1C1917]'}`}>
        {value}
      </p>
      {subtitle && <p className="text-sm text-[#78716C]">{subtitle}</p>}
    </Card>
  );
}
