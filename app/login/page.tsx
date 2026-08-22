"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid login credentials");
        setLoading(false);
        return;
      }

      await refreshUser();

      if (data.mustChangePassword) {
        router.push("/change-password");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
      setLoading(false);
    }
  };

  const setDemoCredentials = (loginId: string, pass: string) => {
    setIdentifier(loginId);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white font-black text-2xl shadow-card mb-3.5">
            D
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Dayflow HRMS
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-medium">
            Enterprise Workforce & Operations Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-border rounded-2xl p-7 shadow-card">
          <h2 className="text-base font-bold text-text-primary mb-1">
            Sign In to your workspace
          </h2>
          <p className="text-xs text-text-secondary mb-5">
            Enter your Login ID or organizational email to continue.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-error-light border border-[#FECACA] rounded-lg text-xs text-error flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                Login ID or Work Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. OIADMI20260001 or name@dayflow.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-background border border-border rounded-lg text-xs font-medium text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <User className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-background border border-border rounded-lg text-xs font-medium text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <Lock className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts Quick-Fill Helper */}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Quick Demo Logins
            </p>
            <div className="grid grid-cols-1 gap-2">
              {/* 1. Admin Card */}
              <button
                type="button"
                onClick={() => setDemoCredentials("OIADMI20260001", "Admin@12345")}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background hover:bg-background/80 border border-border hover:border-primary/40 rounded-xl text-xs text-left transition-all group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-text-primary group-hover:text-primary transition-colors">
                      Krishna
                    </span>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    Email: <span className="font-medium text-text-primary">admin@dayflow.com</span>
                  </div>
                  <div className="text-[11px] text-text-secondary font-mono">
                    ID: <span className="font-semibold text-primary">OIADMI20260001</span>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
                  <span className="text-[10px] text-text-secondary">Password</span>
                  <span className="text-[11px] font-mono font-bold text-text-primary bg-surface px-2 py-0.5 rounded border border-border">
                    Admin@12345
                  </span>
                </div>
              </button>

              {/* 2. Employee Card */}
              <button
                type="button"
                onClick={() => setDemoCredentials("OIAASH20260002", "Employee@123")}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background hover:bg-background/80 border border-border hover:border-primary/40 rounded-xl text-xs text-left transition-all group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-text-primary group-hover:text-primary transition-colors">
                      Aarav Sharma
                    </span>
                    <span className="text-[10px] font-medium text-text-secondary bg-surface px-1.5 py-0.5 rounded border border-border">
                      EMPLOYEE
                    </span>
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    Email: <span className="font-medium text-text-primary">aarav.sharma@dayflow.com</span>
                  </div>
                  <div className="text-[11px] text-text-secondary font-mono">
                    ID: <span className="font-semibold text-primary">OIAASH20260002</span>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
                  <span className="text-[10px] text-text-secondary">Password</span>
                  <span className="text-[11px] font-mono font-bold text-text-primary bg-surface px-2 py-0.5 rounded border border-border">
                    Employee@123
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="text-center mt-6 text-xs text-text-secondary flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-text-secondary" />
          <span>Protected by Dayflow Enterprise Identity Protection</span>
        </div>
      </div>
    </div>
  );
}
