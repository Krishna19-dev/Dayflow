import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Generates a random secure temporary password (8-10 characters, mixed case + numbers)
 */
export function generateTemporaryPassword(length: number = 9): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%";
  const all = upper + lower + digits + special;

  let pwd = "";
  // Ensure at least one of each class
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += special[Math.floor(Math.random() * special.length)];

  for (let i = pwd.length; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle characters
  return pwd
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

/**
 * Hashes a plaintext password using bcrypt
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compares a plaintext password with a bcrypt hash
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
