"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { SalaryComponentsEditor } from "@/components/SalaryComponentsEditor";
import { StatusBadge } from "@/components/StatusDot";
import {
  User,
  FileText,
  Lock,
  DollarSign,
  Shield,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  Layers,
  Award,
} from "lucide-react";

export default function EmployeeProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "resume" | "private" | "salary" | "security"
  >("resume");

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Editable Basic Info State
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [basicForm, setBasicForm] = useState({
    name: "",
    phone: "",
    department: "",
    location: "",
    company: "",
  });

  // Resume State
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [resumeForm, setResumeForm] = useState({
    about: "",
    skills: [] as string[],
    certifications: [] as string[],
    interestsAndHobbies: "",
  });
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newCertInput, setNewCertInput] = useState("");

  // Private Info State
  const [isEditingPrivate, setIsEditingPrivate] = useState(false);
  const [privateForm, setPrivateForm] = useState({
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    residingAddress: "",
    nationality: "Indian",
    personalEmail: "",
    panNo: "",
    uanNo: "",
    expCode: "",
    bankAccountNumber: "",
    bankName: "",
    ifscCode: "",
  });

  // Security (Password) Form State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [securityLoading, setSecurityLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employees/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load employee profile");
        setLoading(false);
        return;
      }

      const emp = data.employee;
      setEmployee(emp);

      // Populate basic info
      setBasicForm({
        name: emp.name || "",
        phone: emp.phone || "",
        department: emp.department || "",
        location: emp.location || "",
        company: emp.company || "",
      });

      // Populate resume info
      if (emp.resume) {
        setResumeForm({
          about: emp.resume.about || "",
          skills: emp.resume.skills || [],
          certifications: emp.resume.certifications || [],
          interestsAndHobbies: emp.resume.interestsAndHobbies || "",
        });
      }

      // Populate private info
      if (emp.privateInfo) {
        setPrivateForm({
          dateOfBirth: emp.privateInfo.dateOfBirth
            ? new Date(emp.privateInfo.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: emp.privateInfo.gender || "",
          maritalStatus: emp.privateInfo.maritalStatus || "",
          residingAddress: emp.privateInfo.residingAddress || "",
          nationality: emp.privateInfo.nationality || "Indian",
          personalEmail: emp.privateInfo.personalEmail || "",
          panNo: emp.privateInfo.panNo || "",
          uanNo: emp.privateInfo.uanNo || "",
          expCode: emp.privateInfo.expCode || "",
          bankAccountNumber: emp.privateInfo.bankAccountNumber || "",
          bankName: emp.privateInfo.bankName || "",
          ifscCode: emp.privateInfo.ifscCode || "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id, fetchProfile]);

  const isSelf = currentUser?.id === id;
  const isAdmin = currentUser?.role === "ADMIN";
  const canEdit = isSelf || isAdmin;

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // 1. Save Basic Details
  const handleSaveBasic = async () => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basicForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setIsEditingBasic(false);
      fetchProfile();
      showNotification("Basic employee details updated successfully!");
    } catch (e: any) {
      setError(e.message);
    }
  };

  // 2. Save Resume Details
  const handleSaveResume = async () => {
    try {
      const res = await fetch(`/api/employees/${id}/resume`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update resume");
      setIsEditingResume(false);
      fetchProfile();
      showNotification("Resume details saved successfully!");
    } catch (e: any) {
      setError(e.message);
    }
  };

  // 3. Save Private Info Details
  const handleSavePrivate = async () => {
    try {
      const res = await fetch(`/api/employees/${id}/private-info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(privateForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update private info");
      setIsEditingPrivate(false);
      fetchProfile();
      showNotification("Private information updated successfully!");
    } catch (e: any) {
      setError(e.message);
    }
  };

  // 4. Update Password (Security tab)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityLoading(true);
    setError(null);

    if (securityForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSecurityLoading(false);
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setError("New passwords do not match.");
      setSecurityLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword || undefined,
          newPassword: securityForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showNotification("Password updated securely!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employee || !isAdmin || isSelf) return;
    setDeleteLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete employee");

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to delete employee");
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Skill tag add/remove
  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !resumeForm.skills.includes(trimmed)) {
      setResumeForm((p) => ({ ...p, skills: [...p.skills, trimmed] }));
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setResumeForm((p) => ({
      ...p,
      skills: p.skills.filter((s) => s !== skill),
    }));
  };

  // Certification tag add/remove
  const handleAddCert = () => {
    const trimmed = newCertInput.trim();
    if (trimmed && !resumeForm.certifications.includes(trimmed)) {
      setResumeForm((p) => ({
        ...p,
        certifications: [...p.certifications, trimmed],
      }));
      setNewCertInput("");
    }
  };

  const handleRemoveCert = (cert: string) => {
    setResumeForm((p) => ({
      ...p,
      certifications: p.certifications.filter((c) => c !== cert),
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-text-secondary mt-2">Loading profile...</p>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center max-w-md mx-auto shadow-card">
        <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
        <h3 className="text-base font-bold text-text-primary">Profile Not Found</h3>
        <p className="text-xs text-text-secondary mt-1">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return (name || "EM")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employee Directory
        </button>

        {isSelf && (
          <span className="text-xs font-medium text-text-secondary bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
            Viewing Your Own Profile
          </span>
        )}
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-3 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl text-xs text-[#166534] flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-sm">
              {employee.profilePicture ? (
                <img
                  src={employee.profilePicture}
                  alt={employee.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                getInitials(employee.name)
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold text-text-primary">
                  {employee.name}
                </h1>
                <span className="font-mono text-xs font-semibold bg-background px-2.5 py-0.5 rounded border border-border text-primary">
                  {employee.loginId}
                </span>
                <span className="text-[11px] font-semibold uppercase bg-primary text-white px-2 py-0.5 rounded">
                  {employee.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <Building className="w-3.5 h-3.5 text-text-secondary" />
                  {employee.department} • {employee.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-text-secondary" />
                  {employee.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                  Joined{" "}
                  {new Date(employee.dateOfJoining).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-text-secondary" />
                  {employee.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-text-secondary" />
                  {employee.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Self or Admin) */}
          <div className="flex items-center gap-2">
            {isAdmin && !isSelf && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error hover:bg-error hover:text-white border border-error/30 rounded-lg text-xs font-semibold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Employee
              </button>
            )}

            {canEdit && (
              <div>
                {isEditingBasic ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveBasic}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white hover:bg-primary-hover text-xs font-semibold rounded-lg shadow-sm transition-all"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={() => setIsEditingBasic(false)}
                      className="p-1.5 text-text-secondary hover:text-text-primary bg-background rounded-lg border border-border transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingBasic(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-background hover:bg-background/80 border border-border rounded-lg text-xs font-semibold text-text-primary transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-text-secondary" /> Edit Basic Details
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Basic Details Inline Edit Form */}
        {isEditingBasic && (
          <div className="mt-6 pt-5 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3.5 animate-fade-in text-xs">
            <div>
              <label className="block font-semibold text-text-primary mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={basicForm.name}
                onChange={(e) =>
                  setBasicForm({ ...basicForm, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-text-primary mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={basicForm.phone}
                onChange={(e) =>
                  setBasicForm({ ...basicForm, phone: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            {isAdmin && (
              <>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={basicForm.department}
                    onChange={(e) =>
                      setBasicForm({ ...basicForm, department: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={basicForm.location}
                    onChange={(e) =>
                      setBasicForm({ ...basicForm, location: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={basicForm.company}
                    onChange={(e) =>
                      setBasicForm({ ...basicForm, company: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab("resume")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "resume"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume & Skills</span>
        </button>

        <button
          onClick={() => setActiveTab("private")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "private"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Private Information</span>
        </button>

        {/* Salary Tab: ADMIN or OWN PROFILE (Employee read-only, Admin editable) */}
        {(isAdmin || isSelf) && (
          <button
            onClick={() => setActiveTab("salary")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "salary"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Salary Information</span>
            {isAdmin && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono">
                ADMIN
              </span>
            )}
          </button>
        )}

        {/* Security Tab: Own Profile Only */}
        {isSelf && (
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "security"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </button>
        )}
      </div>

      {/* ========================================================
          TAB 1: RESUME & SKILLS
         ======================================================== */}
      {activeTab === "resume" && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-card space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Professional Background & Skills
            </h2>
            {canEdit && (
              <div>
                {isEditingResume ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveResume}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white hover:bg-primary-hover text-xs font-semibold rounded-lg shadow-sm transition-all"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Resume
                    </button>
                    <button
                      onClick={() => setIsEditingResume(false)}
                      className="p-1.5 text-text-secondary hover:text-text-primary bg-background rounded-lg border border-border transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingResume(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-background hover:bg-background/80 border border-border rounded-lg text-xs font-semibold text-text-primary transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-text-secondary" /> Edit Resume
                  </button>
                )}
              </div>
            )}
          </div>

          {/* About Section */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              About
            </label>
            {isEditingResume ? (
              <textarea
                rows={3}
                value={resumeForm.about}
                onChange={(e) =>
                  setResumeForm({ ...resumeForm, about: e.target.value })
                }
                placeholder="Write a brief professional summary..."
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary"
              />
            ) : (
              <p className="text-xs text-text-primary leading-relaxed bg-background/50 p-4 rounded-xl border border-border/60">
                {resumeForm.about || "No summary provided yet."}
              </p>
            )}
          </div>

          {/* Skills Section */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Skills & Expertise
            </label>
            {isEditingResume ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter skill name (e.g. TypeScript, React, Docker)"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeForm.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-background border border-border rounded-lg text-xs font-medium text-text-primary"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-text-secondary hover:text-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {resumeForm.skills.length > 0 ? (
                  resumeForm.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-background border border-border rounded-lg text-xs font-medium text-text-primary"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-text-secondary italic">
                    No skills added yet.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Certifications Section */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Certifications & Credentials
            </label>
            {isEditingResume ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter credential or certification name"
                    value={newCertInput}
                    onChange={(e) => setNewCertInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCert())}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddCert}
                    className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeForm.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-background border border-border rounded-lg text-xs font-medium text-text-primary"
                    >
                      <Award className="w-3.5 h-3.5 text-primary" />
                      {cert}
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(cert)}
                        className="text-text-secondary hover:text-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {resumeForm.certifications.length > 0 ? (
                  resumeForm.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-background border border-border rounded-lg text-xs font-medium text-text-primary"
                    >
                      <Award className="w-3.5 h-3.5 text-primary" />
                      {cert}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-text-secondary italic">
                    No certifications added yet.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Interests and Hobbies Section */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Interests & Hobbies
            </label>
            {isEditingResume ? (
              <textarea
                rows={2}
                value={resumeForm.interestsAndHobbies}
                onChange={(e) =>
                  setResumeForm({
                    ...resumeForm,
                    interestsAndHobbies: e.target.value,
                  })
                }
                placeholder="Personal interests, reading, outdoor activities..."
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary"
              />
            ) : (
              <p className="text-xs text-text-primary leading-relaxed bg-background/50 p-4 rounded-xl border border-border/60">
                {resumeForm.interestsAndHobbies || "No interests added yet."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: PRIVATE INFORMATION
         ======================================================== */}
      {activeTab === "private" && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-card space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Personal & Statutory Records
            </h2>
            {canEdit && (
              <div>
                {isEditingPrivate ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSavePrivate}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white hover:bg-primary-hover text-xs font-semibold rounded-lg shadow-sm transition-all"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Private Info
                    </button>
                    <button
                      onClick={() => setIsEditingPrivate(false)}
                      className="p-1.5 text-text-secondary hover:text-text-primary bg-background rounded-lg border border-border transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingPrivate(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-background hover:bg-background/80 border border-border rounded-lg text-xs font-semibold text-text-primary transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-text-secondary" /> Edit Private Details
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* Personal Details */}
            <div className="space-y-3.5">
              <h3 className="font-bold text-text-secondary uppercase tracking-wider text-[11px] pb-1 border-b border-border">
                Personal Info
              </h3>
              <div>
                <label className="block text-text-secondary font-medium mb-1">
                  Date of Birth
                </label>
                {isEditingPrivate ? (
                  <input
                    type="date"
                    value={privateForm.dateOfBirth}
                    onChange={(e) =>
                      setPrivateForm({ ...privateForm, dateOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                  />
                ) : (
                  <p className="font-semibold text-text-primary">
                    {privateForm.dateOfBirth || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-1">
                  Gender
                </label>
                {isEditingPrivate ? (
                  <select
                    value={privateForm.gender}
                    onChange={(e) =>
                      setPrivateForm({ ...privateForm, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="font-semibold text-text-primary">
                    {privateForm.gender || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-1">
                  Marital Status
                </label>
                {isEditingPrivate ? (
                  <select
                    value={privateForm.maritalStatus}
                    onChange={(e) =>
                      setPrivateForm({
                        ...privateForm,
                        maritalStatus: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                ) : (
                  <p className="font-semibold text-text-primary">
                    {privateForm.maritalStatus || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-1">
                  Nationality
                </label>
                {isEditingPrivate ? (
                  <input
                    type="text"
                    value={privateForm.nationality}
                    onChange={(e) =>
                      setPrivateForm({
                        ...privateForm,
                        nationality: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                  />
                ) : (
                  <p className="font-semibold text-text-primary">
                    {privateForm.nationality || "Indian"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-1">
                  Personal Email
                </label>
                {isEditingPrivate ? (
                  <input
                    type="email"
                    value={privateForm.personalEmail}
                    onChange={(e) =>
                      setPrivateForm({
                        ...privateForm,
                        personalEmail: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                  />
                ) : (
                  <p className="font-semibold text-text-primary">
                    {privateForm.personalEmail || "Not specified"}
                  </p>
                )}
              </div>
            </div>

            {/* Address & Identifiers */}
            <div className="space-y-3.5">
              <h3 className="font-bold text-text-secondary uppercase tracking-wider text-[11px] pb-1 border-b border-border">
                Statutory Identifiers
              </h3>
              <div>
                <label className="block text-text-secondary font-medium mb-1">
                  PAN Number
                </label>
                {isEditingPrivate ? (
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    value={privateForm.panNo}
                    onChange={(e) =>
                      setPrivateForm({ ...privateForm, panNo: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary uppercase"
                  />
                ) : (
                  <p className="font-mono font-semibold text-text-primary">
                    {privateForm.panNo || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-1">
                  UAN (PF Number)
                </label>
                {isEditingPrivate ? (
                  <input
                    type="text"
                    placeholder="100XXXXXXXXX"
                    value={privateForm.uanNo}
                    onChange={(e) =>
                      setPrivateForm({ ...privateForm, uanNo: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                  />
                ) : (
                  <p className="font-mono font-semibold text-text-primary">
                    {privateForm.uanNo || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-1">
                  Experience / Badge Code
                </label>
                {isEditingPrivate ? (
                  <input
                    type="text"
                    placeholder="EXP-ENG-001"
                    value={privateForm.expCode}
                    onChange={(e) =>
                      setPrivateForm({ ...privateForm, expCode: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                  />
                ) : (
                  <p className="font-mono font-semibold text-text-primary">
                    {privateForm.expCode || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-1">
                  Residential Address
                </label>
                {isEditingPrivate ? (
                  <textarea
                    rows={2}
                    value={privateForm.residingAddress}
                    onChange={(e) =>
                      setPrivateForm({
                        ...privateForm,
                        residingAddress: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                  />
                ) : (
                  <p className="font-medium text-text-primary leading-relaxed">
                    {privateForm.residingAddress || "Not specified"}
                  </p>
                )}
              </div>
            </div>

            {/* Bank Information */}
            <div className="space-y-3.5">
              <h3 className="font-bold text-text-secondary uppercase tracking-wider text-[11px] pb-1 border-b border-border">
                Bank Account Details
              </h3>
              <div>
                <label className="block text-text-secondary font-medium mb-1">
                  Bank Name
                </label>
                {isEditingPrivate ? (
                  <input
                    type="text"
                    placeholder="HDFC Bank"
                    value={privateForm.bankName}
                    onChange={(e) =>
                      setPrivateForm({ ...privateForm, bankName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                  />
                ) : (
                  <p className="font-semibold text-text-primary">
                    {privateForm.bankName || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-1">
                  Account Number
                </label>
                {isEditingPrivate ? (
                  <input
                    type="text"
                    placeholder="XXXXXXXXXXXX"
                    value={privateForm.bankAccountNumber}
                    onChange={(e) =>
                      setPrivateForm({
                        ...privateForm,
                        bankAccountNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                  />
                ) : (
                  <p className="font-mono font-semibold text-text-primary">
                    {privateForm.bankAccountNumber || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-1">
                  IFSC Code
                </label>
                {isEditingPrivate ? (
                  <input
                    type="text"
                    placeholder="HDFC0001234"
                    value={privateForm.ifscCode}
                    onChange={(e) =>
                      setPrivateForm({
                        ...privateForm,
                        ifscCode: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary uppercase"
                  />
                ) : (
                  <p className="font-mono font-semibold text-text-primary">
                    {privateForm.ifscCode || "Not specified"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: SALARY INFORMATION (ADMIN EDITABLE, EMPLOYEE READ-ONLY)
         ======================================================== */}
      {activeTab === "salary" && (isAdmin || isSelf) && (
        <SalaryComponentsEditor
          employeeId={id}
          initialData={employee.salaryInfo}
          onSaved={fetchProfile}
          readOnly={!isAdmin}
        />
      )}

      {/* ========================================================
          TAB 4: SECURITY (OWN PROFILE ONLY)
         ======================================================== */}
      {activeTab === "security" && isSelf && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-card max-w-lg animate-fade-in">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">
                Change Password
              </h2>
              <p className="text-xs text-text-secondary">
                Update your account password.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-text-primary mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={securityForm.currentPassword}
                onChange={(e) =>
                  setSecurityForm({
                    ...securityForm,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={securityForm.newPassword}
                onChange={(e) =>
                  setSecurityForm({
                    ...securityForm,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Re-type new password"
                value={securityForm.confirmPassword}
                onChange={(e) =>
                  setSecurityForm({
                    ...securityForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={securityLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white hover:bg-primary-hover font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {securityLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" /> Update Password
                </>
              )}
            </button>
          </form>
        </div>
      )}
      {/* ========================================================
          DELETE CONFIRMATION MODAL (ADMIN ONLY)
         ======================================================== */}
      {isDeleteModalOpen && employee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div
            className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-10 h-10 rounded-xl bg-error-light text-error flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Delete Employee Account
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Permanent removal of workforce member.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-error space-y-2">
              <p className="font-semibold">
                Are you sure you want to permanently delete this employee?
              </p>
              <div className="bg-surface p-2 rounded-lg text-text-primary font-mono text-[11px] border border-error/20 space-y-1">
                <div>
                  <span className="text-text-secondary">Name: </span>
                  <span className="font-bold">{employee.name}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Login ID: </span>
                  <span className="font-bold text-primary">{employee.loginId}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Email: </span>
                  <span>{employee.email}</span>
                </div>
              </div>
              <p className="text-[11px] text-error">
                ⚠️ All associated attendance ledgers, leave records, salary parameters, and private KYC data will be permanently deleted. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary bg-background border border-border rounded-xl hover:bg-background/80 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployee}
                disabled={deleteLoading}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-error hover:bg-red-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Yes, Delete Employee
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
