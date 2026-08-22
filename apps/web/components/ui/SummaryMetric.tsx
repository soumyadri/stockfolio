interface SummaryMetricProps {
  label: string;
  value: string;
}

export function SummaryMetric({ label, value }: SummaryMetricProps) {
  return (
    <div>
      <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
        {value}
      </p>
    </div>
  );
}
