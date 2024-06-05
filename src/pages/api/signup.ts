import type { APIRoute } from "astro";
import { db, User, eq } from "astro:db";
import { createEmailVerificationToken, sendEmail } from "../../lib/utils";
import { generateIdFromEntropySize } from "lucia";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString()!;
  const origin = request.headers.get("origin")!;

  const existingUserArray = await db
    .select()
    .from(User)
    .where(eq(User.email, email));
  const existingUser = existingUserArray[0];

  // an example usecase of signups being split out
  //   const whistListed = await db.select(WhiteListedEmails.email).where(eq(WhiteListedEmail.email, email))
  //   if (!whistListed) return redirect("/error")

  if (existingUser) {
    if (existingUser.email_verified) return redirect("/"); // signed up and now needs to sign in

    if (!existingUser.email_verified) {
      // User exists but is not verified, resend the magic link
      // Could check if first magic link hasn't expired yet and reuse
      const tokenId = await createEmailVerificationToken(
        existingUser.id,
        email
      );
      const verificationLink = new URL(
        `/api/verifyToken?token=${tokenId}`,
        origin
      ).toString();

      await sendEmail(email, verificationLink);
      return redirect("/");
    }
  }

  const userId = generateIdFromEntropySize(10);
  await db.insert(User).values({
    id: userId,
    email: email,
    email_verified: false,
  });

  const tokenId = await createEmailVerificationToken(userId, email);
  const verificationLink = new URL(
    `/api/verifyToken?token=${tokenId}`,
    origin
  ).toString();

  await sendEmail(email, verificationLink);
  return redirect("/");
};
