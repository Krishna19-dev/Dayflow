"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Building2, ChevronRight } from "lucide-react";
import { StatusDot, StatusBadge } from "./StatusDot";

export interface EmployeeDirectoryItem {
  id: string;
  loginId: string;
  name: string;
  email: string;
  phone: string;
  role: "EMPLOYEE" | "ADMIN";
  company: string;
  department: string;
  location: string;
  profilePicture?: string | null;
  attendanceStatus: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

interface EmployeeCardProps {
  employee: EmployeeDirectoryItem;
  currentUserId?: string;
  isAdmin?: boolean;
}

export function EmployeeCard({
  employee,
  currentUserId,
  isAdmin,
}: EmployeeCardProps) {
  const isSelf = currentUserId === employee.id;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Link
      href={`/dashboard/employees/${employee.id}`}
      className="group relative bg-surface border border-border hover:border-primary/40 rounded-xl p-5 shadow-card hover:shadow-dropdown transition-all flex flex-col justify-between"
    >
      <div>
        {/* Top: Avatar, Status Dot & Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm">
                {employee.profilePicture ? (
                  <img
                    src={employee.profilePicture}
                    alt={employee.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(employee.name)
                )}
              </div>
              {/* Status indicator dot anchored to bottom right of avatar */}
              <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-surface rounded-full">
                <StatusDot status={employee.attendanceStatus} size="md" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                  {employee.name}
                </h3>
                {isSelf && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.2 rounded">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-text-secondary mt-0.5">
                {employee.department}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center text-[10px] font-medium bg-background text-text-secondary border border-border/80 px-1.5 py-0.5 rounded tracking-wide font-sans">
                  {employee.loginId}
                </span>
              </div>
            </div>
          </div>

          <StatusBadge status={employee.attendanceStatus} />
        </div>

        {/* Info Grid */}
        <div className="mt-4 pt-3.5 border-t border-border/70 space-y-2 text-xs text-text-secondary">
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <Phone className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
            <span>{employee.phone || "Not set"}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
            <span>{employee.location || "Headquarters"}</span>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-text-secondary">
          {employee.role === "ADMIN" ? "Administrator" : "Employee"}
        </span>
        <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          View Profile <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
