import { Handlers } from "$fresh/server.ts";
import { machineTable } from "@/lib/db/schema.ts";
import { db } from "@/lib/db/db.ts";
import { eq } from "drizzle-orm";

type MachineSelect = typeof machineTable.$inferSelect;

export const handler: Handlers<MachineSelect | null> = {
  async GET(_req, ctx) {
    const { column, value } = ctx.params;

    let result;

    if (column === "id") {
      result = await db.select().from(machineTable)
        .where(eq(machineTable.id, parseInt(value)))
        .then((values) => values)
        .catch((message) =>
          new Response(JSON.stringify({ code: 500, message }))
        );
    } else if (column === "macaddr") {
      result = await db.select().from(machineTable)
        .where(eq(machineTable.mac, value))
        .then((values) => values)
        .catch((message) =>
          new Response(JSON.stringify({ code: 500, message }))
        );
    } else {
      return new Response(
        JSON.stringify({ code: 400, message: "invalid machine column" }),
        { status: 400 },
      );
    }

    if (result instanceof Response) return result;

    if (!result.length) {
      return new Response(
        JSON.stringify({ code: 500, message: "cannot find record" }),
      );
    }

    return new Response(JSON.stringify(result[0]));
  },
};
