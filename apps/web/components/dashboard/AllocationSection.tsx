import { allocationItems } from "../../lib/mock/dashboard";
import { Card } from "../ui/Card";

export function AllocationSection() {
  return (
    <Card title="Allocation">
      <div className="flex h-2.5 overflow-hidden rounded-full sm:h-3">
        {allocationItems.map((item) => (
          <div
            key={item.symbol}
            style={{ width: `${item.percent}%`, backgroundColor: item.color }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 sm:gap-x-6 sm:text-sm">
        {allocationItems.map((item) => (
          <span key={item.symbol} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.symbol} {item.percent}%
          </span>
        ))}
      </div>
    </Card>
  );
}
