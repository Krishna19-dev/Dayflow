"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { StatusBadge } from "@/components/StatusDot";
import { LeaveRequestModal } from "@/components/LeaveRequestModal";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import {
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Layers,
  HeartPulse,
  Sun,
  ShieldAlert,
  X,
  MessageSquare,
  User,
} from "lucide-react";
import { format } from "date-fns";

export default function TimeOffPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // Sub-tabs: "timeoff" or "allocation"
  const [subTab, setSubTab] = useState<"timeoff" | "allocation">("timeoff");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Review Confirmation Dialog State (Admin Center Window)
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    leaveRequest: any | null;
    action: "APPROVED" | "REJECTED" | null;
    comment: string;
  }>({
    isOpen: false,
    leaveRequest: null,
    action: null,
    comment: "",
  });

  // Common State
  const [allocations, setAllocations] = useState<any[]>([]);
  const [employeeLeaves, setEmployeeLeaves] = useState<any[]>([]);
  const [employeeAttendances, setEmployeeAttendances] = useState<any[]>([]);

  // Admin State
  const [adminLeaves, setAdminLeaves] = useState<any[]>([]);
  const [adminStatusFilter, setAdminStatusFilter] = useState("ALL");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminLoading, setAdminLoading] = useState(true);
  const [reviewActionLoading, setReviewActionLoading] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Fetch Employee Data (Allocations + Requests + Attendance for Heatmap)
  const fetchEmployeeData = useCallback(async () => {
    setLoading(true);
    try {
      const [allocRes, leavesRes, attRes] = await Promise.all([
        fetch("/api/leaves/allocations/me"),
        fetch("/api/leaves/me"),
        fetch("/api/attendance/me"),
      ]);

      if (allocRes.ok) {
        const allocData = await allocRes.json();
        setAllocations(allocData.allocations || []);
      }
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setEmployeeLeaves(leavesData.leaves || []);
      }
      if (attRes.ok) {
        const attData = await attRes.json();
        setEmployeeAttendances(attData.attendances || []);
      }
    } catch (e) {
      console.error("Employee leaves fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Admin Leaves List
  const fetchAdminData = useCallback(async () => {
    setAdminLoading(true);
    try {
      const params = new URLSearchParams();
      if (adminStatusFilter !== "ALL") params.set("status", adminStatusFilter);
      if (adminSearch) params.set("search", adminSearch);

      const res = await fetch(`/api/leaves?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setAdminLeaves(data.leaves || []);
      }
    } catch (e) {
      console.error("Admin leaves fetch error:", e);
    } finally {
      setAdminLoading(false);
    }
  }, [adminStatusFilter, adminSearch]);

  useEffect(() => {
    fetchEmployeeData();
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, fetchEmployeeData, fetchAdminData]);

  // Admin Review Modal Handlers
  const handleOpenReviewModal = (
    leaveRequest: any,
    action: "APPROVED" | "REJECTED"
  ) => {
    setReviewModal({
      isOpen: true,
      leaveRequest,
      action,
      comment: "",
    });
  };

  const handleCloseReviewModal = () => {
    setReviewModal({
      isOpen: false,
      leaveRequest: null,
      action: null,
      comment: "",
    });
  };

  const handleConfirmReviewLeave = async () => {
    if (!reviewModal.leaveRequest || !reviewModal.action) return;
    const leaveId = reviewModal.leaveRequest.id;
    const status = reviewModal.action;
    const comment = reviewModal.comment.trim();

    setReviewActionLoading(leaveId);
    setError(null);
    try {
      const res = await fetch(`/api/leaves/${leaveId}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewComment: comment || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${status.toLowerCase()} leave`);
      }

      setSuccessMsg(`Leave request successfully ${status.toLowerCase()}!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      handleCloseReviewModal();
      fetchAdminData();
      fetchEmployeeData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReviewActionLoading(null);
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case "PAID_TIME_OFF":
        return "Paid Time Off";
      case "SICK_LEAVE":
        return "Sick Leave";
      case "UNPAID_LEAVE":
        return "Unpaid Leave";
      default:
        return type;
    }
  };

  const paidAllocation = allocations.find((a) => a.leaveType === "PAID_TIME_OFF");
  const sickAllocation = allocations.find((a) => a.leaveType === "SICK_LEAVE");
  const unpaidAllocation = allocations.find((a) => a.leaveType === "UNPAID_LEAVE");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>Time Off & Leave Management</span>
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage leave balances, submit time off requests, and review approvals.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              fetchEmployeeData();
              if (isAdmin) fetchAdminData();
            }}
            className="p-2 text-text-secondary hover:text-text-primary bg-surface border border-border rounded-lg hover:bg-background transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white hover:bg-primary-hover font-semibold text-xs rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>NEW Request</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-error-light border border-[#FECACA] rounded-xl text-xs text-error flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl text-xs text-[#166534] flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Balance Summary Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Paid Time Off */}
        <div className="bg-surface border border-border rounded-xl p-4 shadow-card flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Paid Time Off (PTO)</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-text-primary">
                {paidAllocation?.remaining ?? 24}
              </span>
              <span className="text-xs text-text-secondary">
                days remaining / {paidAllocation?.totalAllocated ?? 24} total
              </span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Used: {paidAllocation?.used ?? 0} days
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded">
            Allocated
          </span>
        </div>

        {/* Sick Leave */}
        <div className="bg-surface border border-border rounded-xl p-4 shadow-card flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Sick Leave (Medical)</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-text-primary">
                {sickAllocation?.remaining ?? 7}
              </span>
              <span className="text-xs text-text-secondary">
                days remaining / {sickAllocation?.totalAllocated ?? 7} total
              </span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Used: {sickAllocation?.used ?? 0} days
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded">
            Medical
          </span>
        </div>

        {/* Unpaid Leave */}
        <div className="bg-surface border border-border rounded-xl p-4 shadow-card flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
              <Layers className="w-4 h-4 text-text-secondary" />
              <span>Unpaid Leave</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-text-primary">
                {unpaidAllocation?.used ?? 0}
              </span>
              <span className="text-xs text-text-secondary">days taken</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Subject to approval
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase bg-background text-text-secondary px-2 py-0.5 rounded border border-border">
            Flex
          </span>
        </div>
      </div>

      {/* ========================================================
          ADMIN VIEW: PENDING REVIEWS & REQUESTS TABLE
         ======================================================== */}
      {isAdmin && (
        <div className="space-y-4">
          <div className="flex border-b border-border space-x-2">
            <button
              onClick={() => setSubTab("timeoff")}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                subTab === "timeoff"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Leave Approvals & Records</span>
            </button>
            <button
              onClick={() => setSubTab("allocation")}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                subTab === "allocation"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar Heatmap & Balances</span>
            </button>
          </div>

          {subTab === "timeoff" ? (
            <div className="space-y-4">
              {/* Search & Status Filter Bar */}
              <div className="bg-surface border border-border rounded-xl p-3.5 shadow-card flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Search requests by employee name, login ID, or department..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-xs font-medium text-text-primary focus:outline-none focus:border-primary"
                  />
                  <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
                    Status:
                  </span>
                  <select
                    value={adminStatusFilter}
                    onChange={(e) => setAdminStatusFilter(e.target.value)}
                    className="flex-1 sm:w-36 px-3 py-2 bg-background border border-border rounded-lg text-xs font-medium text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Requests Table */}
              <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-xs font-bold text-text-primary">
                    All Workforce Time Off Submissions
                  </h3>
                  <span className="text-xs text-text-secondary">
                    {adminLeaves.length} records found
                  </span>
                </div>

                {adminLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-text-secondary">Loading requests...</p>
                  </div>
                ) : adminLeaves.length === 0 ? (
                  <div className="p-12 text-center text-xs text-text-secondary">
                    No leave requests found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-background/80 text-text-secondary uppercase text-[11px] font-semibold border-b border-border">
                        <tr>
                          <th className="py-3 px-4">Employee</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Dates</th>
                          <th className="py-3 px-4 text-center">Duration</th>
                          <th className="py-3 px-4">Attachment</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {adminLeaves.map((req: any) => {
                          const startDate = new Date(req.startDate);
                          const endDate = new Date(req.endDate);

                          return (
                            <tr
                              key={req.id}
                              className="hover:bg-background/30 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="font-semibold text-text-primary">
                                  {req.employee?.name}
                                </div>
                                <div className="text-[10px] font-mono text-text-secondary">
                                  {req.employee?.loginId} • {req.employee?.department}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-medium text-text-primary">
                                {getLeaveTypeLabel(req.leaveType)}
                              </td>
                              <td className="py-3 px-4 font-mono text-text-primary">
                                {format(startDate, "dd MMM yyyy")}
                                {req.startDate !== req.endDate &&
                                  ` → ${format(endDate, "dd MMM yyyy")}`}
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-text-primary">
                                {req.allocationDays} {req.allocationDays === 1 ? "day" : "days"}
                              </td>
                              <td className="py-3 px-4">
                                {req.attachmentUrl ? (
                                  <a
                                    href={req.attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-[11px]"
                                  >
                                    <FileText className="w-3.5 h-3.5" /> View Doc
                                  </a>
                                ) : (
                                  <span className="text-text-secondary/60 text-[11px]">
                                    None
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <StatusBadge status={req.status} />
                              </td>
                              <td className="py-3 px-4 text-right">
                                {req.status === "PENDING" ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() =>
                                        handleOpenReviewModal(req, "APPROVED")
                                      }
                                      disabled={reviewActionLoading === req.id}
                                      className="px-2.5 py-1 bg-[#16A34A] text-white text-[11px] font-semibold rounded hover:bg-[#15803D] transition-colors disabled:opacity-50"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleOpenReviewModal(req, "REJECTED")
                                      }
                                      disabled={reviewActionLoading === req.id}
                                      className="px-2.5 py-1 bg-error text-white text-[11px] font-semibold rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-text-secondary italic">
                                    Reviewed
                                    {req.reviewComment && ` ("${req.reviewComment}")`}
                                  </span>
                                )}
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
          ) : (
            /* Calendar Heatmap in Allocation subtab */
            <CalendarHeatmap
              attendances={employeeAttendances}
              leaves={employeeLeaves}
            />
          )}
        </div>
      )}

      {/* ========================================================
          EMPLOYEE VIEW: CALENDAR HEATMAP & REQUEST HISTORY
         ======================================================== */}
      {!isAdmin && (
        <div className="space-y-6">
          {/* Heatmap */}
          <div>
            <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Attendance & Leave Visual Heatmap
            </h2>
            <CalendarHeatmap
              attendances={employeeAttendances}
              leaves={employeeLeaves}
            />
          </div>

          {/* Own Leave History Table */}
          <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary">
                My Time Off History
              </h3>
              <span className="text-xs text-text-secondary">
                {employeeLeaves.length} submitted requests
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-xs text-text-secondary">Loading history...</p>
              </div>
            ) : employeeLeaves.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-secondary">
                You have not submitted any time off requests yet. Click "NEW Request" above to apply.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background/80 text-text-secondary uppercase text-[11px] font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Date Range</th>
                      <th className="py-3 px-4 text-center">Duration</th>
                      <th className="py-3 px-4">Applied On</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Reviewer Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {employeeLeaves.map((req: any) => {
                      const start = new Date(req.startDate);
                      const end = new Date(req.endDate);
                      const created = new Date(req.createdAt);

                      return (
                        <tr
                          key={req.id}
                          className="hover:bg-background/30 transition-colors"
                        >
                          <td className="py-3 px-4 font-semibold text-text-primary">
                            {getLeaveTypeLabel(req.leaveType)}
                          </td>
                          <td className="py-3 px-4 font-mono text-text-primary">
                            {format(start, "dd MMM yyyy")}
                            {req.startDate !== req.endDate &&
                              ` → ${format(end, "dd MMM yyyy")}`}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-text-primary">
                            {req.allocationDays} {req.allocationDays === 1 ? "day" : "days"}
                          </td>
                          <td className="py-3 px-4 font-mono text-text-secondary">
                            {format(created, "dd MMM yyyy")}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="py-3 px-4 text-text-secondary">
                            {req.reviewComment || "—"}
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

      {/* Leave Request Submission Modal */}
      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestSubmitted={() => {
          fetchEmployeeData();
          if (isAdmin) fetchAdminData();
          setSuccessMsg("Leave request submitted successfully!");
          setTimeout(() => setSuccessMsg(null), 3000);
        }}
        allocations={allocations}
      />

      {/* Admin Review Confirmation Dialog (Center Window Modal) */}
      {reviewModal.isOpen && reviewModal.leaveRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div
            className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    reviewModal.action === "APPROVED"
                      ? "bg-[#DCFCE7] text-[#166534]"
                      : "bg-error-light text-error"
                  }`}
                >
                  {reviewModal.action === "APPROVED" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    {reviewModal.action === "APPROVED"
                      ? "Approve Time Off Request"
                      : "Reject Time Off Request"}
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Review and confirm decision for this employee submission.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseReviewModal}
                disabled={Boolean(reviewActionLoading)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Request Summary Box */}
            <div className="bg-background/80 border border-border rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-medium">Employee:</span>
                <span className="font-bold text-text-primary">
                  {reviewModal.leaveRequest.employee?.name} (
                  <span className="font-mono text-primary">
                    {reviewModal.leaveRequest.employee?.loginId}
                  </span>
                  )
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-medium">Leave Type:</span>
                <span className="font-semibold text-text-primary">
                  {getLeaveTypeLabel(reviewModal.leaveRequest.leaveType)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-medium">Requested Dates:</span>
                <span className="font-mono font-medium text-text-primary">
                  {format(
                    new Date(reviewModal.leaveRequest.startDate),
                    "dd MMM yyyy"
                  )}
                  {reviewModal.leaveRequest.startDate !==
                    reviewModal.leaveRequest.endDate &&
                    ` → ${format(
                      new Date(reviewModal.leaveRequest.endDate),
                      "dd MMM yyyy"
                    )}`}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-border pt-1.5">
                <span className="text-text-secondary font-medium">Duration:</span>
                <span className="font-bold text-primary font-mono">
                  {reviewModal.leaveRequest.allocationDays}{" "}
                  {reviewModal.leaveRequest.allocationDays === 1 ? "day" : "days"}
                </span>
              </div>
            </div>

            {/* Warning / Informational Alert Box */}
            {reviewModal.action === "APPROVED" ? (
              <div className="p-3 bg-[#DCFCE7]/70 border border-[#BBF7D0] rounded-xl text-xs text-[#166534] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Approval Impact:</strong> This will deduct{" "}
                  <strong>{reviewModal.leaveRequest.allocationDays} day(s)</strong>{" "}
                  from the employee&apos;s balance and automatically log{" "}
                  <span className="font-mono font-bold">LEAVE</span> in their attendance ledger.
                </span>
              </div>
            ) : (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-error flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Rejection Warning:</strong> The request will be marked as rejected. No leave days will be deducted from the employee&apos;s quota.
                </span>
              </div>
            )}

            {/* Decision Comments Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-text-secondary" />
                <span>Reviewer Note / Decision Comment (Optional)</span>
              </label>
              <textarea
                rows={2}
                value={reviewModal.comment}
                onChange={(e) =>
                  setReviewModal((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                placeholder={
                  reviewModal.action === "APPROVED"
                    ? "e.g. Approved. Please coordinate handover before leaving."
                    : "e.g. Due to urgent project deadlines during these dates..."
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleCloseReviewModal}
                disabled={Boolean(reviewActionLoading)}
                className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary bg-background border border-border rounded-xl hover:bg-background/80 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmReviewLeave}
                disabled={Boolean(reviewActionLoading)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all disabled:opacity-50 ${
                  reviewModal.action === "APPROVED"
                    ? "bg-[#16A34A] hover:bg-[#15803D]"
                    : "bg-error hover:bg-red-700"
                }`}
              >
                {reviewActionLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                  </>
                ) : reviewModal.action === "APPROVED" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Approval
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
