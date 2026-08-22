"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { StatusBadge } from "@/components/StatusDot";
import {
  CalendarCheck,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  User,
  RefreshCw,
  Loader2,
  TrendingUp,
  Award,
} from "lucide-react";
import { format, addDays, subDays, addMonths, subMonths } from "date-fns";

export default function AttendancePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // Admin View State
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [adminSearch, setAdminSearch] = useState("");
  const [adminData, setAdminData] = useState<any>(null);
  const [adminLoading, setAdminLoading] = useState(true);

  // Employee View State
  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [employeeLoading, setEmployeeLoading] = useState(true);

  // 1. Fetch Admin Attendance
  const fetchAdminAttendance = useCallback(async () => {
    setAdminLoading(true);
    try {
      const params = new URLSearchParams({
        date: selectedDate,
      });
      if (adminSearch) params.set("search", adminSearch);

      const res = await fetch(`/api/attendance?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setAdminData(data);
      }
    } catch (e) {
      console.error("Admin attendance fetch error:", e);
    } finally {
      setAdminLoading(false);
    }
  }, [selectedDate, adminSearch]);

  // 2. Fetch Employee Attendance
  const fetchEmployeeAttendance = useCallback(async () => {
    setEmployeeLoading(true);
    try {
      const monthStr = format(selectedMonthDate, "yyyy-MM");
      const res = await fetch(`/api/attendance/me?month=${monthStr}`);
      const data = await res.json();
      if (res.ok) {
        setEmployeeData(data);
      }
    } catch (e) {
      console.error("Employee attendance fetch error:", e);
    } finally {
      setEmployeeLoading(false);
    }
  }, [selectedMonthDate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminAttendance();
    } else {
      fetchEmployeeAttendance();
    }
  }, [isAdmin, fetchAdminAttendance, fetchEmployeeAttendance]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const cur = new Date(selectedDate);
    setSelectedDate(format(subDays(cur, 1), "yyyy-MM-dd"));
  };

  const handleNextDay = () => {
    const cur = new Date(selectedDate);
    setSelectedDate(format(addDays(cur, 1), "yyyy-MM-dd"));
  };

  const handleToday = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
  };

  const handlePrevMonth = () => {
    setSelectedMonthDate(subMonths(selectedMonthDate, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthDate(addMonths(selectedMonthDate, 1));
  };

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return "—";
    return new Date(timeStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================================
          ADMIN / HR ATTENDANCE VIEW
         ======================================================== */}
      {isAdmin ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" />
                <span>Workforce Attendance Ledger</span>
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Real-time check-ins, work hours, overtime, and leave records.
              </p>
            </div>

            {/* Date Navigator & Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToday}
                className="px-3 py-1.5 bg-surface border border-border text-xs font-semibold text-text-secondary hover:text-text-primary rounded-lg hover:bg-background transition-colors"
              >
                Today
              </button>

              <div className="flex items-center bg-surface border border-border rounded-lg shadow-sm">
                <button
                  onClick={handlePrevDay}
                  title="Previous Day"
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2 py-1 bg-transparent text-xs font-bold text-text-primary focus:outline-none"
                />
                <button
                  onClick={handleNextDay}
                  title="Next Day"
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={fetchAdminAttendance}
                className="p-2 text-text-secondary hover:text-text-primary bg-surface border border-border rounded-lg hover:bg-background transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    adminLoading ? "animate-spin text-primary" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          {adminData?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  Total Staff
                </span>
                <p className="text-2xl font-black text-text-primary mt-1">
                  {adminData.summary.totalEmployees}
                </p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
                <span className="text-[11px] font-bold text-[#166534] uppercase tracking-wider">
                  Present Today
                </span>
                <p className="text-2xl font-black text-[#16A34A] mt-1">
                  {adminData.summary.presentCount}
                </p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
                <span className="text-[11px] font-bold text-[#1E40AF] uppercase tracking-wider">
                  On Leave ✈️
                </span>
                <p className="text-2xl font-black text-[#3B82F6] mt-1">
                  {adminData.summary.leaveCount}
                </p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  Absent / Unrecorded
                </span>
                <p className="text-2xl font-black text-amber-500 mt-1">
                  {adminData.summary.absentCount}
                </p>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="bg-surface border border-border rounded-xl p-3.5 shadow-card">
            <div className="relative">
              <input
                type="text"
                placeholder="Search staff by name, login ID, or department..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-xs font-medium text-text-primary focus:outline-none focus:border-primary"
              />
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary">
                Daily Attendance Logs for{" "}
                <span className="text-primary font-mono">
                  {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                </span>
              </span>
              <span className="text-xs text-text-secondary">
                Standard work day: 8.0 hrs
              </span>
            </div>

            {adminLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-xs text-text-secondary">Loading attendance records...</p>
              </div>
            ) : adminData?.records?.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-secondary">
                No employee records matching query.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background/80 text-text-secondary uppercase text-[11px] font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Check In</th>
                      <th className="py-3 px-4">Check Out</th>
                      <th className="py-3 px-4 text-center">Work Hours</th>
                      <th className="py-3 px-4 text-center">Extra Hours</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {adminData?.records?.map((record: any) => (
                      <tr
                        key={record.employeeId}
                        className="hover:bg-background/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-[11px]">
                              {record.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-text-primary">
                                {record.name}
                              </div>
                              <div className="text-[10px] font-mono text-text-secondary">
                                {record.loginId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-secondary font-medium">
                          {record.department}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-text-primary">
                          {formatTime(record.checkInTime)}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-text-primary">
                          {formatTime(record.checkOutTime)}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-text-primary">
                          {record.workHours > 0 ? `${record.workHours}h` : "—"}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-xs">
                          {record.extraHours > 0 ? (
                            <span className="text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded font-bold">
                              +{record.extraHours}h
                            </span>
                          ) : (
                            <span className="text-text-secondary/60">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <StatusBadge status={record.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================
            EMPLOYEE ATTENDANCE VIEW
           ======================================================== */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" />
                <span>My Attendance History</span>
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Review your monthly logs, work hours, and attendance consistency.
              </p>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-surface border border-border rounded-lg shadow-sm">
                <button
                  onClick={handlePrevMonth}
                  title="Previous Month"
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 py-1 text-xs font-bold text-primary min-w-[120px] text-center font-mono">
                  {format(selectedMonthDate, "MMMM yyyy")}
                </div>
                <button
                  onClick={handleNextMonth}
                  title="Next Month"
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={fetchEmployeeAttendance}
                className="p-2 text-text-secondary hover:text-text-primary bg-surface border border-border rounded-lg hover:bg-background transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    employeeLoading ? "animate-spin text-primary" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Summary Chips / Statistic Cards */}
          {employeeData?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  Total Working Days
                </span>
                <p className="text-2xl font-black text-text-primary mt-1">
                  {employeeData.summary.totalWorkingDays}
                </p>
                <span className="text-[10px] text-text-secondary">Mon-Fri schedule</span>
              </div>

              <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
                <span className="text-[11px] font-bold text-[#166534] uppercase tracking-wider">
                  Days Present
                </span>
                <p className="text-2xl font-black text-[#16A34A] mt-1">
                  {employeeData.summary.daysPresent}
                </p>
                <span className="text-[10px] text-[#15803D]">
                  {employeeData.summary.totalWorkingDays > 0
                    ? `${Math.round(
                        (employeeData.summary.daysPresent /
                          employeeData.summary.totalWorkingDays) *
                          100
                      )}% Attendance rate`
                    : "—"}
                </span>
              </div>

              <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
                <span className="text-[11px] font-bold text-[#1E40AF] uppercase tracking-wider">
                  Leaves Taken
                </span>
                <p className="text-2xl font-black text-[#3B82F6] mt-1">
                  {employeeData.summary.leavesCount}
                </p>
                <span className="text-[10px] text-text-secondary">Approved time off</span>
              </div>

              <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Total Work Hours
                </span>
                <p className="text-2xl font-black text-primary mt-1">
                  {employeeData.summary.totalWorkHours}h
                </p>
                <span className="text-[10px] text-text-secondary">
                  +{employeeData.summary.totalExtraHours}h overtime
                </span>
              </div>
            </div>
          )}

          {/* Daily Records Table */}
          <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary">
                Monthly Breakdown for{" "}
                <span className="text-primary font-mono">
                  {format(selectedMonthDate, "MMMM yyyy")}
                </span>
              </span>
            </div>

            {employeeLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-xs text-text-secondary">Loading monthly records...</p>
              </div>
            ) : employeeData?.attendances?.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-secondary">
                No attendance logs found for this month.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background/80 text-text-secondary uppercase text-[11px] font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Day</th>
                      <th className="py-3 px-4">Check In</th>
                      <th className="py-3 px-4">Check Out</th>
                      <th className="py-3 px-4 text-center">Work Hours</th>
                      <th className="py-3 px-4 text-center">Extra Hours</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {employeeData?.attendances?.map((record: any) => {
                      const recDate = new Date(record.date);
                      return (
                        <tr
                          key={record.id}
                          className="hover:bg-background/30 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-medium text-text-primary">
                            {format(recDate, "dd MMM yyyy")}
                          </td>
                          <td className="py-3 px-4 text-text-secondary font-medium">
                            {format(recDate, "EEEE")}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-text-primary">
                            {formatTime(record.checkInTime)}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-text-primary">
                            {formatTime(record.checkOutTime)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-text-primary">
                            {record.workHours > 0 ? `${record.workHours}h` : "—"}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-xs">
                            {record.extraHours > 0 ? (
                              <span className="text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded font-bold">
                                +{record.extraHours}h
                              </span>
                            ) : (
                              <span className="text-text-secondary/60">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <StatusBadge status={record.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
