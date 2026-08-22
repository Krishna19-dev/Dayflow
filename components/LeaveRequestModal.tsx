"use client";

import React, { useState } from "react";
import { X, Calendar, FileText, AlertCircle, Loader2, Send } from "lucide-react";

interface LeaveAllocationItem {
  id: string;
  leaveType: "PAID_TIME_OFF" | "SICK_LEAVE" | "UNPAID_LEAVE";
  totalAllocated: number;
  used: number;
  remaining: number;
}

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted: () => void;
  allocations: LeaveAllocationItem[];
}

export function LeaveRequestModal({
  isOpen,
  onClose,
  onRequestSubmitted,
  allocations,
}: LeaveRequestModalProps) {
  const [leaveType, setLeaveType] = useState<
    "PAID_TIME_OFF" | "SICK_LEAVE" | "UNPAID_LEAVE"
  >("PAID_TIME_OFF");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [allocationDays, setAllocationDays] = useState<number>(1);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAllocation = allocations.find((a) => a.leaveType === leaveType);
  const remainingDays = currentAllocation?.remaining ?? 0;

  // Auto calculate business days when dates change
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    calculateDays(val, endDate);
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    calculateDays(startDate, val);
  };

  const calculateDays = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (end < start) {
      setAllocationDays(0);
      return;
    }

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    setAllocationDays(Math.max(1, count));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (allocationDays <= 0) {
      setError("Please select a valid date range containing at least one working day.");
      setLoading(false);
      return;
    }

    if (leaveType !== "UNPAID_LEAVE" && allocationDays > remainingDays) {
      setError(
        `Insufficient balance. You have ${remainingDays} days remaining, but requested ${allocationDays} days.`
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveType,
          startDate,
          endDate,
          allocationDays: Number(allocationDays),
          attachmentUrl: attachmentUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit leave request");
        setLoading(false);
        return;
      }

      onRequestSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-text-primary/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-modal max-w-lg w-full p-6 animate-fade-in relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Request Time Off
              </h2>
              <p className="text-xs text-text-secondary">
                Submit a leave request for administrative review.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 bg-error-light border border-[#FECACA] rounded-lg text-xs text-error flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Leave Type Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-text-primary">
                Time Off Type *
              </label>
              {leaveType !== "UNPAID_LEAVE" && (
                <span className="text-[11px] font-medium text-text-secondary">
                  Available:{" "}
                  <strong className="text-primary font-bold">
                    {remainingDays} days
                  </strong>
                </span>
              )}
            </div>
            <select
              value={leaveType}
              onChange={(e) =>
                setLeaveType(
                  e.target.value as "PAID_TIME_OFF" | "SICK_LEAVE" | "UNPAID_LEAVE"
                )
              }
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="PAID_TIME_OFF">
                Paid Time Off (PTO / Vacation)
              </option>
              <option value="SICK_LEAVE">Sick Leave (Medical)</option>
              <option value="UNPAID_LEAVE">Unpaid Leave</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Allocation Days */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Duration (Working Days)
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              required
              value={allocationDays}
              onChange={(e) => setAllocationDays(Number(e.target.value))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Optional Attachment (for Sick Leave certificate or docs) */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Attachment URL (Optional / Medical Certificate)
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://..."
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <FileText className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface border border-border text-text-secondary hover:text-text-primary text-xs font-semibold rounded-lg hover:bg-background transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white hover:bg-primary-hover text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
