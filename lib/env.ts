export function getServerEnv() {
  return {
    timezone: process.env.APP_TIMEZONE || "Asia/Kolkata",
  };
}
