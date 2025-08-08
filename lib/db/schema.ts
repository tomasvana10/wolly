import { integer, macaddr, numeric, pgTable, varchar } from "drizzle-orm/pg-core";

export const machineTable = pgTable("machine", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  mac: macaddr().notNull(),
  nickname: varchar({ length: 50 }).notNull(),
  passkey: numeric().notNull(),
});
