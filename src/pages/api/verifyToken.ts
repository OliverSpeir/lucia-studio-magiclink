import type { APIRoute } from "astro";
import { db, User, EmailVerificationToken, eq } from "astro:db";
import { lucia } from "../../lib/auth";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const token = url.searchParams.get("token")!;
  if (!token) return redirect("/error");

  const tokenDataArray = await db
    .select()
    .from(EmailVerificationToken)
    .where(eq(EmailVerificationToken.id, token));

  const tokenData = tokenDataArray[0];

  // Check if the token is valid and has not expired
  if (!tokenData || new Date() > new Date(tokenData.expires_at)) {
    return redirect("/error");
  }

  const userArray = await db
    .select()
    .from(User)
    .where(eq(User.id, tokenData.user_id));
  const user = userArray[0];

  if (!user) {
    return redirect("/error");
  }

  if (!user.email_verified) {
    await db
      .update(User)
      .set({
        email_verified: true,
      })
      .where(eq(User.id, tokenData.user_id));
  }

  await lucia.invalidateUserSessions(tokenData.user_id);

  const session = await lucia.createSession(tokenData.user_id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  await db
    .delete(EmailVerificationToken)
    .where(eq(EmailVerificationToken.id, token));

  return redirect("/", 303);
};
