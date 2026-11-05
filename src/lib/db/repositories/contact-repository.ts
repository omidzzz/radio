import type { ContactMessageRow } from "@/lib/types";
import { BaseRepository } from "@/lib/db/repositories/base-repository";
import { logger } from "@/lib/core/logger";

/**
 * Repository for the contact_messages table.
 */
export class ContactRepository extends BaseRepository<ContactMessageRow> {
  constructor() {
    super("contact_messages");
  }

  /** Create a contact message. */
  create(data: Record<string, unknown>): ContactMessageRow {
    try {
      const result = this.prepareStmt(
        `INSERT INTO contact_messages (name, email, subject, message)
         VALUES (?, ?, ?, ?)`
      ).run(data.name, data.email, data.subject, data.message);

      const message = this.prepareStmt(
        "SELECT * FROM contact_messages WHERE id = ?"
      ).get(result.lastInsertRowid) as ContactMessageRow | undefined;

      if (!message) throw new Error("Failed to retrieve created message");

      return message;
    } catch (error) {
      logger.error("ContactRepository.create failed", { error, data });
      throw error;
    }
  }

  /** List all contact messages (admin). */
  listAll(): ContactMessageRow[] {
    return this.prepareStmt(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    ).all() as ContactMessageRow[];
  }

  /** Delete a contact message. */
  delete(id: number): boolean {
    const result = super.delete(id);
    if (!result) {
      throw new Error(`Contact message ${id} not found`);
    }
    return result;
  }
}

export const contactRepository = new ContactRepository();