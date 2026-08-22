"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { EmployeeCard, EmployeeDirectoryItem } from "@/components/EmployeeCard";
import { AddEmployeeModal } from "@/components/AddEmployeeModal";
import {
  Search,
  Plus,
  Filter,
  Users,
  Building2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function DirectoryPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (selectedDept !== "All") params.set("department", selectedDept);

      const res = await fetch(`/api/employees?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load directory");
      } else {
        setEmployees(data.employees || []);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedDept]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Departments list for filter
  const departments = [
    "All",
    "Engineering",
    "Product Design",
    "Human Resources",
    "Marketing",
    "Sales",
    "Operations",
    "Finance",
  ];

  // Local status filtering
  const filteredEmployees = employees.filter((emp) => {
    if (selectedStatus === "All") return true;
    return emp.attendanceStatus === selectedStatus;
  });

  const isAdmin = user?.role === "ADMIN";

  // Summary counts
  const totalCount = employees.length;
  const presentCount = employees.filter(
    (e) => e.attendanceStatus === "PRESENT" || e.attendanceStatus === "HALF_DAY"
  ).length;
  const leaveCount = employees.filter((e) => e.attendanceStatus === "LEAVE").length;

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Employee Directory</span>
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            {totalCount} Total Employees • {presentCount} Present Today • {leaveCount} On Leave
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchEmployees}
            title="Refresh Directory"
            className="p-2 text-text-secondary hover:text-text-primary bg-surface border border-border rounded-lg hover:bg-background transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>

          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white hover:bg-primary-hover font-semibold text-xs rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>NEW Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-card flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by name, login ID, email, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-xs font-medium text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-text-secondary font-medium whitespace-nowrap">
            <Building2 className="w-3.5 h-3.5" />
            <span>Dept:</span>
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="flex-1 md:w-44 px-3 py-2 bg-background border border-border rounded-lg text-xs font-medium text-text-primary focus:outline-none focus:border-primary"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Attendance Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-text-secondary font-medium whitespace-nowrap">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 md:w-36 px-3 py-2 bg-background border border-border rounded-lg text-xs font-medium text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="All">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="LEAVE">On Leave</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-error-light border border-[#FECACA] rounded-xl text-xs text-error flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 bg-surface border border-border rounded-xl p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-background" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-background rounded w-3/4" />
                  <div className="h-2.5 bg-background rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-background rounded w-full" />
                <div className="h-2 bg-background rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        /* Empty State */
        <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-card">
          <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mx-auto text-text-secondary mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">
            No employees found
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
            {searchTerm || selectedDept !== "All" || selectedStatus !== "All"
              ? "Try adjusting your search criteria or clear your filters."
              : "Start by provisioning your organization's first employee."}
          </p>
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-semibold text-xs rounded-lg hover:bg-primary-hover shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add Employee
            </button>
          )}
        </div>
      ) : (
        /* Employee Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              currentUserId={user?.id}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Add Employee Modal for Admin */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onEmployeeCreated={fetchEmployees}
      />
    </div>
  );
}
