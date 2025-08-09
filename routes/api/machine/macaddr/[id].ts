import { Handlers } from "$fresh/server.ts";
import { machineTable } from "@/lib/db/schema.ts";
import { db } from "@/lib/db/db.ts";
import { eq } from "drizzle-orm";

type MachineSelect = typeof machineTable.$inferSelect;

export const handler: Handlers<MachineSelect | null> = {
  async GET(_req, ctx) {
    const id = ctx.params.id;

    return await db.select().from(machineTable)
      .where(
        eq(machineTable.mac, id),
      )
      .then((values) => new Response(JSON.stringify(values)))
      .catch((
        message,
      ) => new Response(JSON.stringify({ code: 500, message })));
  },
};
