"use server";

import { z } from "zod";
import { resend, DEFAULT_FROM } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(150),
  message: z.string().min(10).max(5000),
});

export type ContactFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof schema>, string>>;
};

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof z.infer<typeof schema>;
      fieldErrors[field] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  const { name, email, subject, message } = parsed.data;

  const { error } = await resend.emails.send({
    from: DEFAULT_FROM,
    to: process.env.RESEND_FROM_EMAIL ?? "contact@gate-olympiad.org",
    replyTo: email,
    subject: `Contact: ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <hr />
      <p style="white-space:pre-wrap">${message}</p>
    `,
  });

  if (error) {
    return { success: false, error: "Failed to send message. Please try again." };
  }

  return { success: true };
}
