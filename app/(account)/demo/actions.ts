"use server";

import { z } from "zod";
import { createLead, queueMail } from "@/lib/db";
import { adminEmails } from "@/lib/auth/roles";

/**
 * "Book a demo": a restaurant asking to talk. It goes to the admin panel's
 * inquiries, and a note goes to the outbox for each platform admin.
 */

export interface DemoState {
  error?: string;
  fieldErrors?: Record<string, string>;
  done?: boolean;
}

const schema = z.object({
  name: z.string().trim().min(2, "Your name, please").max(80),
  email: z.string().trim().email("That does not look like an email").max(160),
  phone: z.string().trim().max(30).optional().default(""),
  restaurantName: z.string().trim().min(2, "The name of your place").max(120),
  city: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
});

export async function requestDemoAction(_previous: DemoState, formData: FormData): Promise<DemoState> {
  // A field people never see. Bots fill everything in; anything here is one.
  if (String(formData.get("website") ?? "").trim()) return { done: true };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const lead = await createLead({ source: "demo", ...parsed.data });

  for (const to of adminEmails()) {
    await queueMail({
      to,
      subject: `Demo request: ${lead.restaurantName}`,
      body: [
        `${lead.name} (${lead.email}${lead.phone ? `, ${lead.phone}` : ""}) asked for a demo.`,
        `${lead.restaurantName}${lead.city ? `, ${lead.city}` : ""}`,
        "",
        lead.message || "(no message)",
        "",
        "Open it in the admin panel under Inquiries.",
      ].join("\n"),
    });
  }
  return { done: true };
}
