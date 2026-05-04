import bcrypt from "bcryptjs";
import { User } from "./models/User.js";

/**
 * Creates or updates the superadmin from env (demo convenience).
 * Set SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, optional SUPERADMIN_NAME.
 */
export async function seedSuperadmin() {
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "[auth] SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD not set — login disabled until configured."
    );
    return;
  }
  const name = process.env.SUPERADMIN_NAME?.trim() || "Superadmin";
  const passwordHash = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { email },
    { email, passwordHash, name, role: "superadmin" },
    { upsert: true, new: true }
  );
  console.log(`[auth] Superadmin ready: ${email}`);
}
