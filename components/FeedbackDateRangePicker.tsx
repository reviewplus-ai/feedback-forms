import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface FeedbackDateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
  popoverProps?: {
    className?: string;
    align?: string;
    sideOffset?: number;
  };
}

export default function FeedbackDateRangePicker({ value, onChange, className, popoverProps }: FeedbackDateRangePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  function handleClickOutside(e: MouseEvent) {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  }
  useEffect(() => {
    if (open) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={`w-full border rounded px-3 py-2 text-left ${className || 'bg-gradient-to-br from-white to-gray-50 border-none shadow-sm'}`}
        onClick={() => setOpen((v) => !v)}
      >
        {range?.from ? (
          <span className="text-black">
            {range.to
              ? `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`
              : format(range.from, "MMM d, yyyy")}
          </span>
        ) : (
          <span className="text-gray-400">Pick a date range</span>
        )}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 bg-white border rounded shadow-lg w-80 min-w-[320px] max-w-[calc(100vw-2rem)] right-0 overflow-x-auto">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={(r) => {
              setRange(r);
              onChange && onChange(r);
            }}
            numberOfMonths={1}
            showOutsideDays
            className="p-2"
            styles={{
              caption: { fontWeight: 500, fontSize: "1rem" },
              day_selected: { background: "#000", color: "#fff" },
              day_range_middle: { background: "#e5e7eb" },
            }}
            captionLayout="dropdown"
          />
          <div className="flex items-center justify-between px-2 pb-2">
            {/* <div className="text-xs text-gray-700">
              {range?.from && format(range.from, "MMM d, yyyy")}
              {range?.to && ` - ${format(range.to, "MMM d, yyyy")}`}
            </div> */}
            <button
              className="text-xs text-blue-500 hover:underline"
              onClick={() => {
                setRange(undefined);
                onChange && onChange(undefined);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 