"use client";

import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWeekend,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { StatusDot } from "./StatusDot";

interface AttendanceRecord {
  id?: string;
  date: string | Date;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";
  workHours?: number;
}

interface LeaveRequestItem {
  id: string;
  leaveType: "PAID_TIME_OFF" | "SICK_LEAVE" | "UNPAID_LEAVE";
  startDate: string | Date;
  endDate: string | Date;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface CalendarHeatmapProps {
  attendances?: AttendanceRecord[];
  leaves?: LeaveRequestItem[];
}

export function CalendarHeatmap({
  attendances = [],
  leaves = [],
}: CalendarHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getDayStatus = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");

    // Check attendance record
    const att = attendances.find((a) => {
      const aDate = new Date(a.date);
      return format(aDate, "yyyy-MM-dd") === dayStr;
    });

    if (att) return { type: "attendance", status: att.status, record: att };

    // Check if within an approved leave
    const matchingLeave = leaves.find((l) => {
      if (l.status !== "APPROVED") return false;
      const s = new Date(l.startDate);
      const e = new Date(l.endDate);
      const cur = new Date(dayStr);
      return cur >= new Date(format(s, "yyyy-MM-dd")) && cur <= new Date(format(e, "yyyy-MM-dd"));
    });

    if (matchingLeave) {
      return { type: "leave", status: "LEAVE", record: matchingLeave };
    }

    if (isWeekend(day)) {
      return { type: "weekend", status: "WEEKEND" };
    }

    return null;
  };

  const weekHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">
            {format(currentDate, "MMMM yyyy")}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-semibold text-text-secondary hover:text-text-primary border border-border rounded-md hover:bg-background transition-colors"
          >
            Today
          </button>
          <div className="flex items-center border border-border rounded-md bg-background">
            <button
              onClick={prevMonth}
              className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 mt-4 text-center">
        {weekHeaders.map((header) => (
          <div
            key={header}
            className="text-[11px] font-bold text-text-secondary uppercase py-1"
          >
            {header}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 mt-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const statusInfo = getDayStatus(day);
          const weekend = isWeekend(day);

          let bgClass = "bg-background/40 hover:bg-background";
          let borderClass = "border-transparent";

          if (isToday) {
            borderClass = "border-primary font-bold shadow-sm";
          }

          if (statusInfo?.status === "PRESENT") {
            bgClass = "bg-[#DCFCE7]/70 text-[#166534] border-[#BBF7D0]";
          } else if (statusInfo?.status === "LEAVE") {
            bgClass = "bg-[#DBEAFE]/80 text-[#1E40AF] border-[#BFDBFE]";
          } else if (statusInfo?.status === "HALF_DAY") {
            bgClass = "bg-[#FFEDD5]/80 text-[#9A3412] border-[#FED7AA]";
          } else if (statusInfo?.status === "ABSENT") {
            bgClass = "bg-[#FEF9C3]/80 text-[#854D0E] border-[#FEF08A]";
          } else if (weekend) {
            bgClass = "bg-background/80 text-text-secondary/60";
          }

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[52px] p-1.5 rounded-lg border flex flex-col justify-between text-xs transition-all ${
                !isCurrentMonth ? "opacity-30" : ""
              } ${bgClass} ${borderClass}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium">
                  {format(day, "d")}
                </span>
                {statusInfo && statusInfo.status !== "WEEKEND" && (
                  <StatusDot status={statusInfo.status} size="sm" />
                )}
              </div>

              {statusInfo?.status === "PRESENT" && (
                <span className="text-[9px] font-semibold text-[#15803D]">
                  Present
                </span>
              )}
              {statusInfo?.status === "LEAVE" && (
                <span className="text-[9px] font-semibold text-[#1D4ED8]">
                  On Leave ✈️
                </span>
              )}
              {statusInfo?.status === "HALF_DAY" && (
                <span className="text-[9px] font-semibold text-[#C2410C]">
                  Half Day
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] text-text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
          <span>Leave (Approved)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
          <span>Half Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />
          <span>Weekend / Off</span>
        </div>
      </div>
    </div>
  );
}
