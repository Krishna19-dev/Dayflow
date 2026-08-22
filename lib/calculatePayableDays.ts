import { prisma } from "@/lib/prisma";
import { AttendanceStatus, LeaveStatus, LeaveType } from "@prisma/client";

export interface PayableDayDetail {
  date: string; // "YYYY-MM-DD"
  dayOfWeek: number; // 0-6
  dayName: string; // "Monday", etc.
  isWorkingDay: boolean;
  status: "PRESENT" | "HALF_DAY" | "PAID_LEAVE" | "UNPAID_LEAVE" | "ABSENT" | "MISSING" | "WEEKEND";
  payableCredit: number; // 1.0, 0.5, or 0.0
  leaveType?: LeaveType | null;
  attendanceStatus?: AttendanceStatus | null;
  note?: string;
}

export interface PayableDaysResult {
  employeeId: string;
  employeeName?: string;
  month: string; // "YYYY-MM"
  year: number;
  monthNumber: number; // 1-12
  totalDaysInMonth: number;
  totalWorkingDays: number;
  payableDays: number;
  unpaidDays: number;
  presentDays: number;
  halfDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  missingDays: number;
  workingDaysPerWeek: number;
  attendanceRate: number; // 0 - 100 (%)
  summaryText: string; // e.g. "22 / 26 payable days this month"
  dailyBreakdown: PayableDayDetail[];
}

/**
 * Normalizes a date to YYYY-MM-DD string in local/UTC date parts
 */
function toDateKey(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Calculates payable days for an employee in a given month.
 *
 * Rules:
 * - totalWorkingDays: all scheduled workdays in the month (e.g. Mon-Fri for 5 days/week schedule)
 * - PRESENT: +1.0 payable
 * - HALF_DAY: +0.5 payable
 * - APPROVED PAID_TIME_OFF or SICK_LEAVE: +1.0 payable
 * - ABSENT: 0 payable
 * - UNPAID_LEAVE: 0 payable
 * - Missing/no-record working days: 0 payable
 * - Weekends: excluded from working days calculation
 */
export async function calculatePayableDays(
  employeeId: string,
  monthParam?: string | number,
  yearParam?: number
): Promise<PayableDaysResult> {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed

  if (monthParam !== undefined && monthParam !== null) {
    if (typeof monthParam === "string" && monthParam.includes("-")) {
      const parts = monthParam.split("-");
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
    } else {
      const parsedMonth = parseInt(String(monthParam), 10);
      if (!isNaN(parsedMonth)) {
        // If 1-indexed (1-12) vs 0-indexed
        month = parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth - 1 : parsedMonth;
      }
    }
  }

  if (yearParam !== undefined && yearParam !== null) {
    const parsedYear = parseInt(String(yearParam), 10);
    if (!isNaN(parsedYear)) {
      year = parsedYear;
    }
  }

  const monthString = `${year}-${String(month + 1).padStart(2, "0")}`;

  // Start & End of Month
  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // 1. Fetch User & Salary Info to get workingDaysPerWeek
  const user = await prisma.user.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      name: true,
      salaryInfo: {
        select: {
          workingDaysPerWeek: true,
        },
      },
    },
  });

  const workingDaysPerWeek = user?.salaryInfo?.workingDaysPerWeek ?? 5;

  // 2. Fetch Attendance Records for the entire month
  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Map attendances by YYYY-MM-DD
  const attendanceMap = new Map<string, (typeof attendances)[0]>();
  for (const att of attendances) {
    const key = toDateKey(new Date(att.date));
    attendanceMap.set(key, att);
  }

  // 3. Fetch Approved Leave Requests overlapping the month
  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: {
      employeeId,
      status: LeaveStatus.APPROVED,
      OR: [
        {
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      ],
    },
  });

  // Helper to find approved leave for a specific date
  const getApprovedLeaveForDate = (dateObj: Date) => {
    const dateKey = toDateKey(dateObj);
    return approvedLeaves.find((leave) => {
      const startKey = toDateKey(new Date(leave.startDate));
      const endKey = toDateKey(new Date(leave.endDate));
      return dateKey >= startKey && dateKey <= endKey;
    });
  };

  let totalWorkingDays = 0;
  let payableDays = 0;
  let presentDays = 0;
  let halfDays = 0;
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  let absentDays = 0;
  let missingDays = 0;

  const dailyBreakdown: PayableDayDetail[] = [];

  // Iterate each day of the month (1 to totalDaysInMonth)
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const curDate = new Date(Date.UTC(year, month, day));
    const dayOfWeek = curDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dateKey = toDateKey(curDate);
    const dayName = DAY_NAMES[dayOfWeek];

    // Determine if it's a scheduled working day based on workingDaysPerWeek
    // 5 days: Mon(1) - Fri(5)
    // 6 days: Mon(1) - Sat(6)
    // 7 days: Sun(0) - Sat(6)
    let isWorkingDay = false;
    if (workingDaysPerWeek === 5) {
      isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 5;
    } else if (workingDaysPerWeek === 6) {
      isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 6;
    } else {
      isWorkingDay = true;
    }

    if (!isWorkingDay) {
      dailyBreakdown.push({
        date: dateKey,
        dayOfWeek,
        dayName,
        isWorkingDay: false,
        status: "WEEKEND",
        payableCredit: 0,
        note: "Non-working / Weekend day",
      });
      continue;
    }

    totalWorkingDays++;

    const att = attendanceMap.get(dateKey);
    const approvedLeave = getApprovedLeaveForDate(curDate);

    if (att) {
      if (att.status === AttendanceStatus.PRESENT) {
        payableDays += 1.0;
        presentDays++;
        dailyBreakdown.push({
          date: dateKey,
          dayOfWeek,
          dayName,
          isWorkingDay: true,
          status: "PRESENT",
          payableCredit: 1.0,
          attendanceStatus: att.status,
          note: `Present (${att.workHours || 8}h worked)`,
        });
      } else if (att.status === AttendanceStatus.HALF_DAY) {
        payableDays += 0.5;
        halfDays++;
        dailyBreakdown.push({
          date: dateKey,
          dayOfWeek,
          dayName,
          isWorkingDay: true,
          status: "HALF_DAY",
          payableCredit: 0.5,
          attendanceStatus: att.status,
          note: "Half day (0.5 payable credit)",
        });
      } else if (att.status === AttendanceStatus.LEAVE) {
        // Attendance marked as LEAVE
        if (approvedLeave && approvedLeave.leaveType === LeaveType.UNPAID_LEAVE) {
          unpaidLeaveDays++;
          dailyBreakdown.push({
            date: dateKey,
            dayOfWeek,
            dayName,
            isWorkingDay: true,
            status: "UNPAID_LEAVE",
            payableCredit: 0,
            leaveType: approvedLeave.leaveType,
            attendanceStatus: att.status,
            note: "Approved Unpaid Leave (0 credit)",
          });
        } else {
          // Default paid leave (PAID_TIME_OFF or SICK_LEAVE or general approved leave)
          payableDays += 1.0;
          paidLeaveDays++;
          dailyBreakdown.push({
            date: dateKey,
            dayOfWeek,
            dayName,
            isWorkingDay: true,
            status: "PAID_LEAVE",
            payableCredit: 1.0,
            leaveType: approvedLeave?.leaveType || LeaveType.PAID_TIME_OFF,
            attendanceStatus: att.status,
            note: `Approved Paid Leave (${approvedLeave?.leaveType || "Paid Time Off"})`,
          });
        }
      } else if (att.status === AttendanceStatus.ABSENT) {
        absentDays++;
        dailyBreakdown.push({
          date: dateKey,
          dayOfWeek,
          dayName,
          isWorkingDay: true,
          status: "ABSENT",
          payableCredit: 0,
          attendanceStatus: att.status,
          note: "Recorded as Absent",
        });
      }
    } else {
      // No attendance record found for this working day
      if (approvedLeave) {
        if (approvedLeave.leaveType === LeaveType.UNPAID_LEAVE) {
          unpaidLeaveDays++;
          dailyBreakdown.push({
            date: dateKey,
            dayOfWeek,
            dayName,
            isWorkingDay: true,
            status: "UNPAID_LEAVE",
            payableCredit: 0,
            leaveType: approvedLeave.leaveType,
            note: "Approved Unpaid Leave (No attendance record)",
          });
        } else {
          payableDays += 1.0;
          paidLeaveDays++;
          dailyBreakdown.push({
            date: dateKey,
            dayOfWeek,
            dayName,
            isWorkingDay: true,
            status: "PAID_LEAVE",
            payableCredit: 1.0,
            leaveType: approvedLeave.leaveType,
            note: `Approved ${approvedLeave.leaveType} (No attendance record)`,
          });
        }
      } else {
        // Missing attendance record on a working day
        missingDays++;
        dailyBreakdown.push({
          date: dateKey,
          dayOfWeek,
          dayName,
          isWorkingDay: true,
          status: "MISSING",
          payableCredit: 0,
          note: "Missing / No attendance logged",
        });
      }
    }
  }

  const unpaidDays = +(totalWorkingDays - payableDays).toFixed(1);
  const attendanceRate = totalWorkingDays > 0 
    ? +((payableDays / totalWorkingDays) * 100).toFixed(1) 
    : 0;

  // e.g. "22 / 26 payable days this month"
  const formattedPayable = payableDays % 1 === 0 ? payableDays.toString() : payableDays.toFixed(1);
  const summaryText = `${formattedPayable} / ${totalWorkingDays} payable days this month`;

  return {
    employeeId,
    employeeName: user?.name,
    month: monthString,
    year,
    monthNumber: month + 1,
    totalDaysInMonth,
    totalWorkingDays,
    payableDays: +payableDays.toFixed(1),
    unpaidDays,
    presentDays,
    halfDays,
    paidLeaveDays,
    unpaidLeaveDays,
    absentDays,
    missingDays,
    workingDaysPerWeek,
    attendanceRate,
    summaryText,
    dailyBreakdown,
  };
}
