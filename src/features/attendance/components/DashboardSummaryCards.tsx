import { FaUser } from "react-icons/fa";
import { BiUserCheck, BiUserMinus, BiUserX } from "react-icons/bi";
import { LuClock3 } from "react-icons/lu";

import type { DashboardSummary } from "../types/dashboard.types";

interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
}

const cards = [
  {
    key: "totalEmployees",
    label: "Total Employees",
    icon: FaUser,
  },
  {
    key: "present",
    label: "Present",
    icon: BiUserCheck,
  },
  {
    key: "late",
    label: "Late",
    icon: LuClock3,
  },
  {
    key: "absent",
    label: "Absent",
    icon: BiUserX,
  },
  {
    key: "notCheckedIn",
    label: "Not Checked In",
    icon: BiUserMinus,
  },
] as const;

export default function DashboardSummaryCards({
  summary,
}: DashboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key];

        return (
          <div
            key={card.key}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition duration-200 hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-medium text-slate-500">
                {card.label}
              </p>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#F40026]">
                <Icon size={18} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums text-[#030708]">
              {value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
