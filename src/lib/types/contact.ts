/**
 * Contact domain types.
 *
 * `ContactMessageRow` mirrors the SQLite columns; `ContactMessage` is the
 * canonical model.
 */

/** Raw `contact_messages` table row. */
export interface ContactMessageRow {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

/** Canonical contact message model. */
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

/** Payload for creating a new contact message. */
export interface NewContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}