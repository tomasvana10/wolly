import type { Handlers } from "$fresh/server.ts";
import { db } from "@/lib/db/db.ts";
import { machineTable } from "@/lib/db/schema.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    await db.insert(machineTable).values({
      mac: "ff:ff:ff:ff:ff:ff",
      nickname: "test pc",
      passkey: "1234",
    });
    const values = await db.query.machineTable.findMany()
    return new Response(JSON.stringify(values));
  },
};
