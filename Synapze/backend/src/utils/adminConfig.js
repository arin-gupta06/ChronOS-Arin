/**
 * Admin Configuration - Backend
 * Centralized admin user emails and constants
 */

const DEFAULT_ADMIN_EMAILS = [
  "24cd10vi76@mitsgwl.ac.in",
  "24cd10ar15@mitsgwl.ac.in",
  "24cd10kr34@mitsgwl.ac.in",
];

const ENV_ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const DUMMY_ADMIN_EMAIL = (process.env.DUMMY_ADMIN_EMAIL || "")
  .trim()
  .toLowerCase();

export const ADMIN_EMAILS = Array.from(
  new Set([
    ...DEFAULT_ADMIN_EMAILS,
    ...ENV_ADMIN_EMAILS,
    ...(DUMMY_ADMIN_EMAIL ? [DUMMY_ADMIN_EMAIL] : []),
  ]),
);

/**
 * Check if a user email is an admin email
 * @param {string} email - User email to check
 * @returns {boolean} - True if email is in admin list
 */
export const isAdminEmail = (email) => {
  return email && ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

/**
 * Check if a user is an admin based on their email
 * @param {object} user - User object
 * @returns {boolean} - True if user is admin
 */
export const isAdminUser = (user) => {
  return user && isAdminEmail(user.email);
};
