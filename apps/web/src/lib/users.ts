/** Display label for a user row — name preferred over raw id. */
export function userDisplayName(user: {
  user_name: string | null;
  user_email: string | null;
  user_id: string;
}): string {
  if (user.user_name?.trim()) return user.user_name.trim();
  if (user.user_email?.trim()) return user.user_email.trim();
  return user.user_id;
}
