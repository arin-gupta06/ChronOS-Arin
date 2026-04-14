import User from "../models/User.js";
import logger from "../config/logger.js";

const asBool = (value) => value === "true";

export const ensureDummyAdmin = async () => {
  const enabled = asBool(process.env.ENABLE_DUMMY_ADMIN);
  if (!enabled) return;

  const email = (process.env.DUMMY_ADMIN_EMAIL || "admin@synapze.dev")
    .trim()
    .toLowerCase();
  const password = process.env.DUMMY_ADMIN_PASSWORD || "Admin@123456";
  const name = process.env.DUMMY_ADMIN_NAME || "Synapze Admin";

  if (!email || !password || password.length < 8) {
    logger.warn("Dummy admin setup skipped due to invalid configuration", {
      hasEmail: Boolean(email),
      passwordLength: password?.length || 0,
    });
    return;
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    let changed = false;
    if (existingUser.role !== "admin") {
      existingUser.role = "admin";
      changed = true;
    }
    if (existingUser.authProvider !== "local") {
      existingUser.authProvider = "local";
      changed = true;
    }

    if (changed) {
      await existingUser.save({ validateBeforeSave: false });
      logger.info("Updated existing user as dummy admin", { email });
    } else {
      logger.info("Dummy admin already present", { email });
    }
    return;
  }

  await User.create({
    name,
    email,
    password,
    role: "admin",
    authProvider: "local",
    skills: [],
  });

  logger.warn("Created dummy admin user for temporary access", {
    email,
    note: "Disable ENABLE_DUMMY_ADMIN after setup.",
  });
};

export default ensureDummyAdmin;
