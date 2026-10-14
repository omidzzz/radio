import db from "@/lib/db";
import { ContactFormValues } from "@/lib/validation/contact";
import { ApiError } from "@/lib/api-error";

export function createContactMessage(input: ContactFormValues) {
  const result = db
    .prepare(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES (?, ?, ?, ?)`
    )
    .run(input.name, input.email, input.subject, input.message);

  const message = db
    .prepare("SELECT * FROM contact_messages WHERE id = ?")
    .get(result.lastInsertRowid);

  if (!message) {
    throw ApiError.internal("Failed to retrieve created message");
  }

  return message;
}

export function getContactMessages() {
  return db
    .prepare("SELECT * FROM contact_messages ORDER BY created_at DESC")
    .all();
}

export function deleteContactMessage(id: number) {
  const result = db.prepare("DELETE FROM contact_messages WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw ApiError.notFound("Message not found");
  }
  return result;
}