import type { APIRoute } from "astro";
import { db, User, eq } from "astro:db";
import { createEmailVerificationToken, sendEmail } from "../../lib/utils";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString()!;
  const origin = request.headers.get("origin")!;

  const userArray = await db.select().from(User).where(eq(User.email, email));
  const user = userArray[0];
  if (!user) return redirect("/error");

  const tokenId = await createEmailVerificationToken(user.id, email);
  const verificationLink = new URL(
    `/api/verifyToken?token=${tokenId}`,
    origin
  ).toString();

  await sendEmail(email, verificationLink);
  return redirect("/");
};
