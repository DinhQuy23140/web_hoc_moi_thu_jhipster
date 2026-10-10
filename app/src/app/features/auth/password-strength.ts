/** 0..4 heuristic password strength used for the meter on the register / reset forms. */
export function passwordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, score);
}

export const STRENGTH_COLORS = ['bg-line', 'bg-error', 'bg-warning', 'bg-primary', 'bg-success'];
