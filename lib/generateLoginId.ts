import { prisma } from "./prisma";

const DEFAULT_COMPANY_CODE = process.env.COMPANY_CODE || "OI";

/**
 * Generates an employee login ID following the format:
 * [CompanyCode][First2FirstName+First2LastName][JoinYear][SerialNumber]
 * Example: OIJODO20260001
 *
 * @param name Full name of employee (e.g. "John Doe")
 * @param dateOfJoining Date of joining
 * @param companyCode Optional company code (defaults to "OI")
 */
export async function generateLoginId(
  name: string,
  dateOfJoining: Date = new Date(),
  companyCode: string = DEFAULT_COMPANY_CODE
): Promise<string> {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] || "EM";
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "PL";

  // Take first 2 characters (alphanumeric uppercase), pad if shorter
  const f2 = (firstName.replace(/[^a-zA-Z0-9]/g, "").substring(0, 2) || "EM")
    .toUpperCase()
    .padEnd(2, "X");
  const l2 = (lastName.replace(/[^a-zA-Z0-9]/g, "").substring(0, 2) || "PL")
    .toUpperCase()
    .padEnd(2, "X");

  const nameCode = `${f2}${l2}`;
  const year = dateOfJoining.getFullYear();

  // Find all users who joined in the same year to get sequential number
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  const existingCount = await prisma.user.count({
    where: {
      dateOfJoining: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  });

  const serial = String(existingCount + 1).padStart(4, "0");
  const loginId = `${companyCode.toUpperCase()}${nameCode}${year}${serial}`;

  // In the rare case of collision, ensure uniqueness
  const exists = await prisma.user.findUnique({
    where: { loginId },
  });

  if (exists) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${companyCode.toUpperCase()}${nameCode}${year}${randomSuffix}`;
  }

  return loginId;
}
