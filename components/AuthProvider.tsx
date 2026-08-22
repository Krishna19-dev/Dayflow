"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface CurrentUser {
  id: string;
  loginId: string;
  name: string;
  email: string;
  phone?: string;
  role: "EMPLOYEE" | "ADMIN";
  department?: string;
  company?: string;
  location?: string;
  profilePicture?: string | null;
  mustChangePassword?: boolean;
}

export interface TodayAttendance {
  id?: string;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";
  checkInTime?: string | null;
  checkOutTime?: string | null;
  workHours?: number;
  extraHours?: number;
}

interface AuthContextType {
  user: CurrentUser | null;
  loading: boolean;
  todayAttendance: TodayAttendance | null;
  refreshUser: () => Promise<void>;
  refreshAttendance: () => Promise<void>;
  checkIn: () => Promise<{ success: boolean; message?: string }>;
  checkOut: () => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAttendance = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.todayRecord) {
          setTodayAttendance(data.todayRecord);
        } else {
          setTodayAttendance({ status: "ABSENT" });
        }
      }
    } catch {
      setTodayAttendance(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      refreshAttendance();
    }
  }, [user, refreshAttendance]);

  const checkIn = async () => {
    try {
      const res = await fetch("/api/attendance/checkin", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Failed to check in" };
      }
      setTodayAttendance(data.attendance);
      return { success: true, message: "Checked in successfully" };
    } catch {
      return { success: false, message: "Network error during check-in" };
    }
  };

  const checkOut = async () => {
    try {
      const res = await fetch("/api/attendance/checkout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Failed to check out" };
      }
      setTodayAttendance(data.attendance);
      return { success: true, message: "Checked out successfully" };
    } catch {
      return { success: false, message: "Network error during check-out" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setTodayAttendance(null);
      router.push("/login");
    } catch (e) {
      console.error("Logout error:", e);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        todayAttendance,
        refreshUser,
        refreshAttendance,
        checkIn,
        checkOut,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
