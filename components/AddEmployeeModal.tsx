"use client";

import React, { useState } from "react";
import {
  X,
  UserPlus,
  Copy,
  Check,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Building,
  Mail,
  Phone,
  Calendar,
  DollarSign,
} from "lucide-react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeCreated: () => void;
}

export function AddEmployeeModal({
  isOpen,
  onClose,
  onEmployeeCreated,
}: AddEmployeeModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [role, setRole] = useState<"EMPLOYEE" | "ADMIN">("EMPLOYEE");
  const [location, setLocation] = useState("Bangalore HQ");
  const [company, setCompany] = useState("Dayflow Technologies");
  const [dateOfJoining, setDateOfJoining] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [monthlyWage, setMonthlyWage] = useState<number>(75000);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Result state after creation
  const [createdCredentials, setCreatedCredentials] = useState<{
    loginId: string;
    email: string;
    temporaryPassword: string;
    name: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          department,
          role,
          location,
          company,
          dateOfJoining,
          monthlyWage: Number(monthlyWage),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create employee");
        setLoading(false);
        return;
      }

      setCreatedCredentials({
        loginId: data.credentials.loginId,
        email: data.credentials.email,
        temporaryPassword: data.credentials.temporaryPassword,
        name: data.employee.name,
      });

      onEmployeeCreated();
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Dayflow HRMS Credentials for ${createdCredentials.name}:\nLogin ID: ${createdCredentials.loginId}\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporaryPassword}\nLogin Portal: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setCreatedCredentials(null);
    setName("");
    setEmail("");
    setPhone("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-text-primary/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-modal max-w-xl w-full p-6 animate-fade-in relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {createdCredentials ? "Employee Created Successfully" : "Add New Employee"}
              </h2>
              <p className="text-xs text-text-secondary">
                {createdCredentials
                  ? "Share these temporary credentials with the employee."
                  : "Provision a new employee record and auto-generate credentials."}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {createdCredentials ? (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-[#DCFCE7] border border-[#BBF7D0] rounded-lg">
              <div className="flex items-center gap-2 text-[#166534] font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Account provisioned for {createdCredentials.name}</span>
              </div>
              <p className="text-xs text-[#15803D] mt-1">
                The employee will be required to change their temporary password on first login.
              </p>
            </div>

            <div className="p-4 bg-background border border-border rounded-lg space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-text-secondary">Login ID:</span>
                <span className="font-bold text-primary text-sm">
                  {createdCredentials.loginId}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-text-secondary">Work Email:</span>
                <span className="font-semibold text-text-primary">
                  {createdCredentials.email}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary">Temporary Password:</span>
                <span className="font-bold text-error bg-surface px-2 py-1 rounded border border-border text-sm">
                  {createdCredentials.temporaryPassword}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Login Credentials
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 bg-surface border border-border text-text-secondary hover:text-text-primary text-xs font-semibold rounded-lg hover:bg-background transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="p-3 bg-error-light border border-[#FECACA] rounded-lg text-xs text-error flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@dayflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product Design">Product Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "EMPLOYEE" | "ADMIN")}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin / HR Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Bangalore HQ"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Date of Joining *
                </label>
                <input
                  type="date"
                  required
                  value={dateOfJoining}
                  onChange={(e) => setDateOfJoining(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Monthly Wage (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={monthlyWage}
                  onChange={(e) => setMonthlyWage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-surface border border-border text-text-secondary hover:text-text-primary text-xs font-semibold rounded-lg hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-white hover:bg-primary-hover text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Provisioning...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" /> Create Employee
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
