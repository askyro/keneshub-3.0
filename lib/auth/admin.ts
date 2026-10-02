export function isAdminSession(value: string | undefined) {
  const expected = process.env.ADMIN_SESSION_SECRET;
  if (!value || !expected || value.length !== expected.length) return false;

  let mismatch = 0;
  for (let index = 0; index < value.length; index += 1) {
    mismatch |= value.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}
