export interface SalaryInput {
  monthlyWage: number;
  yearlyWage?: number;
  workingDaysPerWeek?: number;
  breakTimeHours?: number;
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

export interface SalaryComponentItem {
  name: string;
  key: string;
  percent: number;
  monthlyAmount: number;
  yearlyAmount: number;
}

export interface SalaryBreakdownResult {
  monthlyWage: number;
  yearlyWage: number;
  workingDaysPerWeek: number;
  breakTimeHours: number;
  components: SalaryComponentItem[];
  totalComponentPercent: number;
  isPercentageValid: boolean;
  unallocatedPercent: number;
  grossMonthlyEarnings: number;
  grossYearlyEarnings: number;
  deductions: {
    employeePfMonthly: number;
    employeePfYearly: number;
    employerPfMonthly: number;
    employerPfYearly: number;
    professionalTaxMonthly: number;
    professionalTaxYearly: number;
    totalDeductionsMonthly: number;
    totalDeductionsYearly: number;
  };
  netTakeHomeMonthly: number;
  netTakeHomeYearly: number;
}

/**
 * Calculates complete salary breakdown from wage and component percentages.
 * Dynamic calculation ensures numbers are never stale.
 */
export function calculateSalaryBreakdown(input: Partial<SalaryInput>): SalaryBreakdownResult {
  const monthlyWage = Math.max(0, Number(input.monthlyWage) || 0);
  const yearlyWage = input.yearlyWage && input.yearlyWage > 0 
    ? Number(input.yearlyWage) 
    : monthlyWage * 12;

  const workingDaysPerWeek = Number(input.workingDaysPerWeek) || 5;
  const breakTimeHours = Number(input.breakTimeHours) || 1.0;

  const basicPercent = Number(input.basicSalaryPercent) || 0;
  const hraPercent = Number(input.hraPercent) || 0;
  const standardAllowancePercent = Number(input.standardAllowancePercent) || 0;
  const performanceBonusPercent = Number(input.performanceBonusPercent) || 0;
  const ltaPercent = Number(input.leaveTravelAllowancePercent) || 0;
  const fixedAllowancePercent = Number(input.fixedAllowancePercent) || 0;

  const employeePfPercent = Number(input.employeePfPercent) ?? 12.0;
  const employerPfPercent = Number(input.employerPfPercent) ?? 12.0;
  const professionalTax = Number(input.professionalTax) ?? 200.0;

  const totalComponentPercent = +(
    basicPercent +
    hraPercent +
    standardAllowancePercent +
    performanceBonusPercent +
    ltaPercent +
    fixedAllowancePercent
  ).toFixed(2);

  const isPercentageValid = totalComponentPercent <= 100.001;
  const unallocatedPercent = Math.max(0, +(100 - totalComponentPercent).toFixed(2));

  const calcAmount = (percent: number) => +(monthlyWage * (percent / 100)).toFixed(2);

  const basicAmount = calcAmount(basicPercent);
  const hraAmount = calcAmount(hraPercent);
  const standardAllowanceAmount = calcAmount(standardAllowancePercent);
  const performanceBonusAmount = calcAmount(performanceBonusPercent);
  const ltaAmount = calcAmount(ltaPercent);
  const fixedAllowanceAmount = calcAmount(fixedAllowancePercent);

  const components: SalaryComponentItem[] = [
    {
      name: "Basic Salary",
      key: "basicSalaryPercent",
      percent: basicPercent,
      monthlyAmount: basicAmount,
      yearlyAmount: +(basicAmount * 12).toFixed(2),
    },
    {
      name: "House Rent Allowance (HRA)",
      key: "hraPercent",
      percent: hraPercent,
      monthlyAmount: hraAmount,
      yearlyAmount: +(hraAmount * 12).toFixed(2),
    },
    {
      name: "Standard Allowance",
      key: "standardAllowancePercent",
      percent: standardAllowancePercent,
      monthlyAmount: standardAllowanceAmount,
      yearlyAmount: +(standardAllowanceAmount * 12).toFixed(2),
    },
    {
      name: "Performance Bonus",
      key: "performanceBonusPercent",
      percent: performanceBonusPercent,
      monthlyAmount: performanceBonusAmount,
      yearlyAmount: +(performanceBonusAmount * 12).toFixed(2),
    },
    {
      name: "Leave Travel Allowance (LTA)",
      key: "leaveTravelAllowancePercent",
      percent: ltaPercent,
      monthlyAmount: ltaAmount,
      yearlyAmount: +(ltaAmount * 12).toFixed(2),
    },
    {
      name: "Fixed Allowance",
      key: "fixedAllowancePercent",
      percent: fixedAllowancePercent,
      monthlyAmount: fixedAllowanceAmount,
      yearlyAmount: +(fixedAllowanceAmount * 12).toFixed(2),
    },
  ];

  const grossMonthlyEarnings = +(
    basicAmount +
    hraAmount +
    standardAllowanceAmount +
    performanceBonusAmount +
    ltaAmount +
    fixedAllowanceAmount
  ).toFixed(2);

  const grossYearlyEarnings = +(grossMonthlyEarnings * 12).toFixed(2);

  // Provident fund standardly calculated on Basic Salary (or whole wage if Basic is 0)
  const pfBase = basicAmount > 0 ? basicAmount : monthlyWage;
  const employeePfMonthly = +(pfBase * (employeePfPercent / 100)).toFixed(2);
  const employeePfYearly = +(employeePfMonthly * 12).toFixed(2);

  const employerPfMonthly = +(pfBase * (employerPfPercent / 100)).toFixed(2);
  const employerPfYearly = +(employerPfMonthly * 12).toFixed(2);

  const professionalTaxMonthly = +(professionalTax).toFixed(2);
  const professionalTaxYearly = +(professionalTaxMonthly * 12).toFixed(2);

  const totalDeductionsMonthly = +(employeePfMonthly + professionalTaxMonthly).toFixed(2);
  const totalDeductionsYearly = +(totalDeductionsMonthly * 12).toFixed(2);

  const netTakeHomeMonthly = Math.max(0, +(grossMonthlyEarnings - totalDeductionsMonthly).toFixed(2));
  const netTakeHomeYearly = +(netTakeHomeMonthly * 12).toFixed(2);

  return {
    monthlyWage,
    yearlyWage,
    workingDaysPerWeek,
    breakTimeHours,
    components,
    totalComponentPercent,
    isPercentageValid,
    unallocatedPercent,
    grossMonthlyEarnings,
    grossYearlyEarnings,
    deductions: {
      employeePfMonthly,
      employeePfYearly,
      employerPfMonthly,
      employerPfYearly,
      professionalTaxMonthly,
      professionalTaxYearly,
      totalDeductionsMonthly,
      totalDeductionsYearly,
    },
    netTakeHomeMonthly,
    netTakeHomeYearly,
  };
}

/**
 * Currency formatter for INR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
