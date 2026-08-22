"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { calculateSalaryBreakdown, formatCurrency } from "@/lib/calculateSalary";
import {
  Calculator,
  Save,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  DollarSign,
  Briefcase,
  Layers,
  HelpCircle,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  RefreshCw,
} from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

interface SalaryInfoData {
  id?: string;
  wageType?: string;
  monthlyWage: number;
  yearlyWage: number;
  workingDaysPerWeek: number;
  breakTimeHours: number;
  basicSalaryPercent: number;
  hraPercent: number;
  standardAllowancePercent: number;
  performanceBonusPercent: number;
  leaveTravelAllowancePercent: number;
  fixedAllowancePercent: number;
  employeePfPercent: number;
  employerPfPercent: number;
  professionalTax: number;
}

interface SalaryComponentsEditorProps {
  employeeId: string;
  initialData?: Partial<SalaryInfoData>;
  onSaved?: () => void;
  readOnly?: boolean;
}

export function SalaryComponentsEditor({
  employeeId,
  initialData,
  onSaved,
  readOnly = false,
}: SalaryComponentsEditorProps) {
  const [formData, setFormData] = useState<SalaryInfoData>({
    wageType: initialData?.wageType || "FIXED",
    monthlyWage: initialData?.monthlyWage ?? 100000,
    yearlyWage: initialData?.yearlyWage ?? (initialData?.monthlyWage ? initialData.monthlyWage * 12 : 1200000),
    workingDaysPerWeek: initialData?.workingDaysPerWeek ?? 5,
    breakTimeHours: initialData?.breakTimeHours ?? 1.0,
    basicSalaryPercent: initialData?.basicSalaryPercent ?? 50.0,
    hraPercent: initialData?.hraPercent ?? 20.0,
    standardAllowancePercent: initialData?.standardAllowancePercent ?? 10.0,
    performanceBonusPercent: initialData?.performanceBonusPercent ?? 10.0,
    leaveTravelAllowancePercent: initialData?.leaveTravelAllowancePercent ?? 5.0,
    fixedAllowancePercent: initialData?.fixedAllowancePercent ?? 5.0,
    employeePfPercent: initialData?.employeePfPercent ?? 12.0,
    employerPfPercent: initialData?.employerPfPercent ?? 12.0,
    professionalTax: initialData?.professionalTax ?? 200.0,
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payable Days State (Admin informational calculation)
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date());
  const [payableData, setPayableData] = useState<any>(null);
  const [payableLoading, setPayableLoading] = useState<boolean>(true);

  const fetchPayableDays = useCallback(async () => {
    if (!employeeId) return;
    setPayableLoading(true);
    try {
      const monthStr = format(selectedMonthDate, "yyyy-MM");
      const res = await fetch(`/api/payroll/${employeeId}/payable-days?month=${monthStr}`);
      if (res.ok) {
        const data = await res.json();
        setPayableData(data);
      }
    } catch (e) {
      console.error("Fetch payable days error:", e);
    } finally {
      setPayableLoading(false);
    }
  }, [employeeId, selectedMonthDate]);

  useEffect(() => {
    fetchPayableDays();
  }, [fetchPayableDays]);

  const handlePrevMonth = () => setSelectedMonthDate(subMonths(selectedMonthDate, 1));
  const handleNextMonth = () => setSelectedMonthDate(addMonths(selectedMonthDate, 1));

  // Live breakdown calculation
  const breakdown = useMemo(() => {
    return calculateSalaryBreakdown(formData);
  }, [formData]);

  const handleMonthlyWageChange = (value: number) => {
    const wage = Math.max(0, value);
    setFormData((prev) => ({
      ...prev,
      monthlyWage: wage,
      yearlyWage: wage * 12,
    }));
  };

  const handlePercentChange = (key: keyof SalaryInfoData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, value)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    if (!breakdown.isPercentageValid) {
      setError(`Total percentage (${breakdown.totalComponentPercent}%) exceeds 100%. Please adjust before saving.`);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/employees/${employeeId}/salary`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update salary details");
        setSaving(false);
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onSaved) onSaved();
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Alerts */}
      {error && (
        <div className="p-3 bg-error-light border border-[#FECACA] rounded-lg text-xs text-error flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 bg-[#DCFCE7] border border-[#BBF7D0] rounded-lg text-xs text-[#166534] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Salary structure and compensation parameters saved successfully!</span>
        </div>
      )}

      {!breakdown.isPercentageValid && (
        <div className="p-3 bg-[#FEF2F2] border border-[#F87171] rounded-lg text-xs text-error flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Warning:</strong> Total allocated percentage is{" "}
            <strong>{breakdown.totalComponentPercent}%</strong>. Component sum must be ≤ 100%. (Exceeds by +
            {(breakdown.totalComponentPercent - 100).toFixed(2)}%)
          </span>
        </div>
      )}

      {/* Informational Attendance & Payroll Payable Days Card (Admin Reference) */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Attendance ↔ Payroll Ledger (Payable Days)
              </h3>
              <p className="text-[11px] text-text-secondary">
                Informational live working days calculation for payroll processing.
              </p>
            </div>
          </div>

          {/* Month Selector Controls */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <div className="flex items-center bg-background border border-border rounded-lg shadow-sm">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 py-1 text-xs font-bold text-primary font-mono min-w-[100px] text-center">
                {format(selectedMonthDate, "MMM yyyy")}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={fetchPayableDays}
              title="Refresh attendance records"
              className="p-1.5 text-text-secondary hover:text-text-primary bg-background border border-border rounded-lg transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  payableLoading ? "animate-spin text-primary" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {payableLoading ? (
          <div className="py-4 text-center">
            <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto mb-1" />
            <span className="text-[11px] text-text-secondary">
              Calculating monthly payable days...
            </span>
          </div>
        ) : payableData ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-primary font-mono">
                  {payableData.payableDays} / {payableData.totalWorkingDays}
                </span>
                <span className="text-xs font-bold text-text-primary">
                  payable days this month
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-text-secondary">
                  Schedule: {payableData.workingDaysPerWeek} days/week
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                  {payableData.attendanceRate}% Payable Credit
                </span>
              </div>
            </div>

            {/* Breakdown Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-background/80 border border-border rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#166534] block">
                    Present
                  </span>
                  <span className="text-sm font-bold text-text-primary font-mono">
                    {payableData.presentDays} days
                  </span>
                </div>
                <span className="text-[10px] text-text-secondary">(+1.0/day)</span>
              </div>

              <div className="bg-background/80 border border-border rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">
                    Half Days
                  </span>
                  <span className="text-sm font-bold text-text-primary font-mono">
                    {payableData.halfDays} days
                  </span>
                </div>
                <span className="text-[10px] text-text-secondary">
                  (+{(payableData.halfDays * 0.5).toFixed(1)})
                </span>
              </div>

              <div className="bg-background/80 border border-border rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#1E40AF] block">
                    Paid Leaves
                  </span>
                  <span className="text-sm font-bold text-text-primary font-mono">
                    {payableData.paidLeaveDays} days
                  </span>
                </div>
                <span className="text-[10px] text-text-secondary">(+1.0/day)</span>
              </div>

              <div className="bg-background/80 border border-border rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-error block">
                    Unpaid / Absent
                  </span>
                  <span className="text-sm font-bold text-text-primary font-mono">
                    {payableData.unpaidDays} days
                  </span>
                </div>
                <span className="text-[10px] text-text-secondary">(0 credit)</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary bg-background/50 px-2.5 py-1.5 rounded-lg border border-border/60">
              <Info className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>
                Read-only figure referencing actual monthly attendance & approved leaves. Stored salary allocation percentages remain intact.
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Top Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly / Yearly Wage */}
        <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
            Monthly Base Wage
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-2.5 text-text-secondary font-semibold text-xs">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="1000"
              disabled={readOnly}
              value={formData.monthlyWage}
              onChange={(e) => handleMonthlyWageChange(Number(e.target.value))}
              className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-sm font-bold text-text-primary focus:outline-none focus:border-primary disabled:opacity-60"
            />
          </div>
          <p className="text-[11px] text-text-secondary mt-1.5 font-medium">
            Annual: {formatCurrency(formData.yearlyWage)}
          </p>
        </div>

        {/* Working Days & Break Time */}
        <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Days / Week
              </label>
              <input
                type="number"
                min="1"
                max="7"
                disabled={readOnly}
                value={formData.workingDaysPerWeek}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    workingDaysPerWeek: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-bold text-text-primary focus:outline-none focus:border-primary disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Break (Hours)
              </label>
              <input
                type="number"
                min="0"
                max="4"
                step="0.5"
                disabled={readOnly}
                value={formData.breakTimeHours}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    breakTimeHours: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-bold text-text-primary focus:outline-none focus:border-primary disabled:opacity-60"
              />
            </div>
          </div>
          <p className="text-[11px] text-text-secondary mt-1.5">
            Standard Daily Schedule: 8h working + {formData.breakTimeHours}h break
          </p>
        </div>

        {/* Live Net Take-Home Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Estimated Monthly Take-Home
            </span>
            <div className="text-xl font-extrabold text-primary mt-1">
              {formatCurrency(breakdown.netTakeHomeMonthly)}
            </div>
          </div>
          <div className="text-[11px] text-text-secondary pt-2 border-t border-primary/10 flex justify-between">
            <span>Gross: {formatCurrency(breakdown.grossMonthlyEarnings)}</span>
            <span>Deductions: {formatCurrency(breakdown.deductions.totalDeductionsMonthly)}</span>
          </div>
        </div>
      </div>

      {/* Components Percentage & Live Calculation Table */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">
              Salary Components Breakdown
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-secondary">Total Allocated:</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded ${
                breakdown.isPercentageValid
                  ? "bg-[#DCFCE7] text-[#166534]"
                  : "bg-error-light text-error"
              }`}
            >
              {breakdown.totalComponentPercent}%
            </span>
            {breakdown.unallocatedPercent > 0 && (
              <span className="text-[11px] text-text-secondary">
                ({breakdown.unallocatedPercent}% unallocated)
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background/80 text-text-secondary uppercase text-[11px] font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Component Name</th>
                <th className="py-3 px-4 w-36">Allocation (%)</th>
                <th className="py-3 px-4 text-right">Monthly Amount</th>
                <th className="py-3 px-4 text-right">Annual Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {breakdown.components.map((comp) => (
                <tr key={comp.key} className="hover:bg-background/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-text-primary">
                    {comp.name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        disabled={readOnly}
                        value={formData[comp.key as keyof SalaryInfoData] as number}
                        onChange={(e) =>
                          handlePercentChange(
                            comp.key as keyof SalaryInfoData,
                            Number(e.target.value)
                          )
                        }
                        className="w-20 px-2 py-1 bg-background border border-border rounded text-xs font-semibold text-text-primary text-right focus:outline-none focus:border-primary disabled:opacity-60"
                      />
                      <span className="text-text-secondary font-bold">%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-text-primary">
                    {formatCurrency(comp.monthlyAmount)}
                  </td>
                  <td className="py-3 px-4 text-right text-text-secondary font-mono">
                    {formatCurrency(comp.yearlyAmount)}
                  </td>
                </tr>
              ))}

              {/* Total Gross Row */}
              <tr className="bg-background/50 font-bold border-t-2 border-border">
                <td className="py-3 px-4 text-text-primary">Gross Earnings</td>
                <td className="py-3 px-4 text-primary">
                  {breakdown.totalComponentPercent}%
                </td>
                <td className="py-3 px-4 text-right text-primary text-sm">
                  {formatCurrency(breakdown.grossMonthlyEarnings)}
                </td>
                <td className="py-3 px-4 text-right text-primary font-mono text-sm">
                  {formatCurrency(breakdown.grossYearlyEarnings)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Statutory Deductions & Contributions */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-card space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">
            Statutory Deductions & Contributions
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-text-primary mb-1">
              Employee PF Contribution (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="25"
                step="0.5"
                disabled={readOnly}
                value={formData.employeePfPercent}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    employeePfPercent: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-primary focus:outline-none focus:border-primary disabled:opacity-60"
              />
              <span className="text-text-secondary font-bold">%</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Monthly: {formatCurrency(breakdown.deductions.employeePfMonthly)}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1">
              Employer PF Contribution (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="25"
                step="0.5"
                disabled={readOnly}
                value={formData.employerPfPercent}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    employerPfPercent: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-primary focus:outline-none focus:border-primary disabled:opacity-60"
              />
              <span className="text-text-secondary font-bold">%</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Monthly: {formatCurrency(breakdown.deductions.employerPfMonthly)}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-1">
              Professional Tax (Monthly ₹)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="50"
                disabled={readOnly}
                value={formData.professionalTax}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    professionalTax: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-primary focus:outline-none focus:border-primary disabled:opacity-60"
              />
              <span className="text-text-secondary font-bold">₹</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Annual: {formatCurrency(breakdown.deductions.professionalTaxYearly)}
            </p>
          </div>
        </div>
      </div>

      {/* Save Action for Admin */}
      {!readOnly && (
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !breakdown.isPercentageValid}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white hover:bg-primary-hover font-semibold text-xs rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Structure...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Save Salary Configuration
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
