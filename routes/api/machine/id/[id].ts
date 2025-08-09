import { Handlers } from "$fresh/server.ts";
import { machineTable } from "@/lib/db/schema.ts";
import { db } from "@/lib/db/db.ts";
import { eq } from "drizzle-orm";

type MachineSelect = typeof machineTable.$inferSelect;

export const handler: Handlers<MachineSelect | null> = {
  async GET(_req, ctx) {
    const id = ctx.params.id;

    const result = await db.select().from(machineTable)
      .where(
        eq(machineTable.id, parseInt(id)),
      )
      .then((values) => values)
      .catch((
        message,
      ) => new Response(JSON.stringify({ code: 500, message })));

    if (result instanceof Response) return result;

    if (!result.length) {
      return new Response(
        JSON.stringify({ code: 500, message: "cannot find record" }),
      );
    }

    return new Response(JSON.stringify(result[0]));
  },
};
