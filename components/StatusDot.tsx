import React from "react";

export type AttendanceOrLeaveStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LEAVE"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

interface StatusDotProps {
  status: AttendanceOrLeaveStatus | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusDot({ status, size = "md", className = "" }: StatusDotProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  const getStatusColor = () => {
    switch (status) {
      case "PRESENT":
      case "APPROVED":
        return "bg-[#16A34A]"; // Green
      case "LEAVE":
        return "bg-[#3B82F6]"; // Blue / Leave
      case "HALF_DAY":
        return "bg-[#F97316]"; // Orange
      case "PENDING":
        return "bg-[#F59E0B]"; // Amber
      case "ABSENT":
        return "bg-[#F59E0B]"; // Yellow/Amber per spec: "yellow=absent"
      case "REJECTED":
        return "bg-[#DC2626]"; // Red
      default:
        return "bg-[#94A3B8]";
    }
  };

  return (
    <span
      className={`inline-block rounded-full ${getStatusColor()} ${sizeClasses[size]} ${className}`}
      title={status}
    />
  );
}

interface StatusBadgeProps {
  status: AttendanceOrLeaveStatus | string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getBadgeConfig = () => {
    switch (status) {
      case "PRESENT":
        return {
          bg: "bg-[#DCFCE7]",
          text: "text-[#166534]",
          border: "border-[#BBF7D0]",
          label: "Present",
          dot: "bg-[#16A34A]",
        };
      case "APPROVED":
        return {
          bg: "bg-[#DCFCE7]",
          text: "text-[#166534]",
          border: "border-[#BBF7D0]",
          label: "Approved",
          dot: "bg-[#16A34A]",
        };
      case "LEAVE":
        return {
          bg: "bg-[#DBEAFE]",
          text: "text-[#1E40AF]",
          border: "border-[#BFDBFE]",
          label: "On Leave ✈️",
          dot: "bg-[#3B82F6]",
        };
      case "HALF_DAY":
        return {
          bg: "bg-[#FFEDD5]",
          text: "text-[#9A3412]",
          border: "border-[#FED7AA]",
          label: "Half Day",
          dot: "bg-[#F97316]",
        };
      case "PENDING":
        return {
          bg: "bg-[#FEF3C7]",
          text: "text-[#92400E]",
          border: "border-[#FDE68A]",
          label: "Pending",
          dot: "bg-[#F59E0B]",
        };
      case "ABSENT":
        return {
          bg: "bg-[#FEF9C3]",
          text: "text-[#854D0E]",
          border: "border-[#FEF08A]",
          label: "Absent",
          dot: "bg-[#F59E0B]",
        };
      case "REJECTED":
        return {
          bg: "bg-[#FEE2E2]",
          text: "text-[#991B1B]",
          border: "border-[#FECACA]",
          label: "Rejected",
          dot: "bg-[#DC2626]",
        };
      default:
        return {
          bg: "bg-[#F1F5F9]",
          text: "text-[#475569]",
          border: "border-[#E2E8F0]",
          label: status,
          dot: "bg-[#94A3B8]",
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
