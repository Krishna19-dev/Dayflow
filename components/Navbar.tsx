"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/navigation";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import {
  Users,
  CalendarCheck,
  Clock,
  LogOut,
  User,
  Shield,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const { user, todayAttendance, checkIn, checkOut, logout, loading } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    const res = await checkIn();
    setActionLoading(false);
    if (!res.success) {
      setActionMessage(res.message || "Failed to check in");
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    const res = await checkOut();
    setActionLoading(false);
    if (!res.success) {
      setActionMessage(res.message || "Failed to check out");
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  const navLinks = [
    {
      name: "Employees",
      href: "/dashboard",
      icon: Users,
      exact: true,
    },
    {
      name: "Attendance",
      href: "/dashboard/attendance",
      icon: CalendarCheck,
      exact: false,
    },
    {
      name: "Time Off",
      href: "/dashboard/timeoff",
      icon: Clock,
      exact: false,
    },
  ];

  const isCheckedIn =
    todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;
  const isCheckedOut = Boolean(todayAttendance?.checkOutTime);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <NextLink
              href="/dashboard"
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-primary-hover transition-colors">
                D
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-primary">
                  DAYFLOW
                </span>
                <span className="hidden sm:inline-block ml-1.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider bg-background px-1.5 py-0.5 rounded">
                  HRMS
                </span>
              </div>
            </NextLink>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <NextLink
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? "text-primary bg-background/80 shadow-sm border border-border"
                        : "text-text-secondary hover:text-text-primary hover:bg-background/40"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-primary" : "text-text-secondary"
                      }`}
                    />
                    {link.name}
                  </NextLink>
                );
              })}
            </nav>
          </div>

          {/* Right: Check-In/Out Status Widget & User Menu */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Check-In / Out Control */}
            {user && (
              <div className="relative">
                {isCheckedIn ? (
                  <div className="flex items-center bg-[#DCFCE7] border border-[#BBF7D0] rounded-lg p-1 pr-2.5">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-[#166534]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
                      </span>
                      <span>Checked In</span>
                      {todayAttendance?.checkInTime && (
                        <span className="text-[11px] font-normal text-[#15803D]">
                          (
                          {new Date(
                            todayAttendance.checkInTime
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          )
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleCheckOut}
                      disabled={actionLoading}
                      className="ml-1 px-2.5 py-1 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Check Out"
                      )}
                    </button>
                  </div>
                ) : isCheckedOut ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-text-secondary">
                    <CheckCircle2 className="w-3.5 h-3.5 text-text-secondary" />
                    <span>
                      Checked Out Since{" "}
                      <span className="font-semibold text-text-primary">
                        {new Date(
                          todayAttendance!.checkOutTime!
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white hover:bg-primary-hover text-xs font-medium rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Check In</span>
                      </>
                    )}
                  </button>
                )}

                {/* Inline feedback alert */}
                {actionMessage && (
                  <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-white border border-border rounded-md shadow-dropdown text-xs text-error flex items-center gap-1.5 z-50 animate-fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{actionMessage}</span>
                  </div>
                )}
              </div>
            )}

            {/* User Avatar & Dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-background border border-transparent hover:border-border transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-xs font-semibold text-text-primary leading-tight flex items-center gap-1">
                      {user.name}
                      {user.role === "ADMIN" && (
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-1 rounded">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      {user.loginId}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-text-secondary hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-dropdown py-1 z-50 animate-fade-in divide-y divide-border">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-semibold text-text-primary truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-text-secondary truncate">
                        {user.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{user.department || "General"}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px] font-semibold text-primary">
                          {user.loginId}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <NextLink
                        href={`/dashboard/employees/${user.id}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-text-primary hover:bg-background hover:text-primary transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-text-secondary" />
                        My Profile
                      </NextLink>
                      <NextLink
                        href="/change-password"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-text-primary hover:bg-background hover:text-primary transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-text-secondary" />
                        Security & Password
                      </NextLink>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-error hover:bg-error-light transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-border/60">
          {navLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <NextLink
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium ${
                  isActive ? "text-primary font-bold" : "text-text-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </NextLink>
            );
          })}
        </div>
      </div>
    </header>
  );
}
