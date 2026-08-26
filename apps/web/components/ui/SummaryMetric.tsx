interface SummaryMetricProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export function SummaryMetric({ label, value, valueClassName = "text-white" }: SummaryMetricProps) {
  return (
    <div>
      <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}
