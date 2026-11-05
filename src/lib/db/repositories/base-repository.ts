import type Database from "better-sqlite3";
import db, { prepare } from "@/lib/db/db";
import { logger } from "@/lib/core/logger";

/**
 * Base repository providing common CRUD operations against a single table.
 * Subclasses define the table name and row type.
 *
 * All SQL uses parameterized queries — never string interpolation — to
 * prevent injection. Methods return raw snake_case rows; callers are
 * responsible for mapping to canonical domain models.
 */
export abstract class BaseRepository<TRow extends object> {
  protected readonly table: string;

  protected constructor(table: string) {
    this.table = table;
  }

  /** Find a single row by primary key. */
  findById(id: number | string): TRow | undefined {
    try {
      return prepare(
        `SELECT * FROM ${this.table} WHERE id = ?`
      ).get(id) as TRow | undefined;
    } catch (error) {
      logger.error(`Repository.findById failed on ${this.table}`, { error, id });
      throw error;
    }
  }

  /** Find all rows, optionally with WHERE, ORDER BY, LIMIT, OFFSET. */
  findAll(options?: {
    where?: string;
    whereParams?: unknown[];
    orderBy?: string;
    limit?: number;
    offset?: number;
  }): TRow[] {
    try {
      let sql = `SELECT * FROM ${this.table}`;
      const params: unknown[] = [];

      if (options?.where) {
        sql += ` WHERE ${options.where}`;
        params.push(...(options.whereParams ?? []));
      }
      if (options?.orderBy) {
        sql += ` ORDER BY ${options.orderBy}`;
      }
      if (options?.limit !== undefined) {
        sql += ` LIMIT ?`;
        params.push(options.limit);
      }
      if (options?.offset !== undefined) {
        sql += ` OFFSET ?`;
        params.push(options.offset);
      }

      return prepare(sql).all(...params) as TRow[];
    } catch (error) {
      logger.error(`Repository.findAll failed on ${this.table}`, { error, options });
      throw error;
    }
  }

  /** Insert a row and return the new row. */
  create(data: Record<string, unknown>): TRow {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => "?").join(", ");

      const result = db
        .prepare(
          `INSERT INTO ${this.table} (${keys.join(", ")}) VALUES (${placeholders})`
        )
        .run(...values);

      const created = prepare(`SELECT * FROM ${this.table} WHERE id = ?`).get(
        result.lastInsertRowid
      ) as TRow | undefined;

      if (!created) {
        throw new Error(`Failed to retrieve created row in ${this.table}`);
      }

      return created;
    } catch (error) {
      logger.error(`Repository.create failed on ${this.table}`, { error, data });
      throw error;
    }
  }

  /** Update a row by primary key. Returns the updated row or undefined. */
  update(id: number | string, data: Record<string, unknown>): TRow | undefined {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((k) => `${k} = ?`).join(", ");

      const result = db
        .prepare(
          `UPDATE ${this.table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        )
        .run(...values, id);

      if (result.changes === 0) return undefined;

      return this.findById(id);
    } catch (error) {
      logger.error(`Repository.update failed on ${this.table}`, { error, id, data });
      throw error;
    }
  }

  /** Delete a row by primary key. Returns true if a row was deleted. */
  delete(id: number | string): boolean {
    try {
      const result = db
        .prepare(`DELETE FROM ${this.table} WHERE id = ?`)
        .run(id);
      return result.changes > 0;
    } catch (error) {
      logger.error(`Repository.delete failed on ${this.table}`, { error, id });
      throw error;
    }
  }

  /** Count rows, optionally with WHERE. */
  count(options?: { where?: string; whereParams?: unknown[] }): number {
    try {
      let sql = `SELECT COUNT(*) as count FROM ${this.table}`;
      const params: unknown[] = [];

      if (options?.where) {
        sql += ` WHERE ${options.where}`;
        params.push(...(options.whereParams ?? []));
      }

      const row = prepare(sql).get(...params) as { count: number };
      return Number(row.count);
    } catch (error) {
      logger.error(`Repository.count failed on ${this.table}`, { error, options });
      throw error;
    }
  }

  /** Execute raw SQL (for complex queries not covered by CRUD methods). */
  exec(sql: string): void {
    try {
      db.exec(sql);
    } catch (error) {
      logger.error(`Repository.exec failed on ${this.table}`, { error, sql });
      throw error;
    }
  }

  /** Prepare a raw statement (for complex queries). */
  prepareStmt(sql: string): Database.Statement {
    return prepare(sql);
  }
}