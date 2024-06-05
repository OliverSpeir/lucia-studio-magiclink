import { Resend } from "resend";
import { TimeSpan, createDate } from "oslo";
import { generateIdFromEntropySize } from "lucia";
import { db, EmailVerificationToken, eq } from "astro:db";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const sendEmail = async (userEmail: string, verificationLink: string) => {
  const from = "🧙 <onboarding@resend.dev>";
  const to = userEmail;
  const subject = "Magic Link 🪄";
  const html = `<p>Sign in with this Magic Link: <a href="${verificationLink}"> Sign In </a></p>`;

  const send = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
  
  return send.data;
};

export const createEmailVerificationToken = async (
  userId: string,
  email: string
) => {
  await db
    .delete(EmailVerificationToken)
    .where(eq(EmailVerificationToken.user_id, userId));
  const tokenId = generateIdFromEntropySize(25); // 40 characters long
  await db.insert(EmailVerificationToken).values({
    id: tokenId,
    user_id: userId,
    email,
    expires_at: createDate(new TimeSpan(2, "h")),
  });
  return tokenId;
};
