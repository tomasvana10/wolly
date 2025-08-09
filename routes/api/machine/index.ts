import { db } from "@/lib/db/db.ts";
import { machineTable } from "@/lib/db/schema.ts";
import { Handlers } from "$fresh/server.ts";

type MachineInsert = typeof machineTable.$inferInsert;

export const handler: Handlers<MachineInsert> = {
  async POST(req, _ctx) {
    const machine = (await req.json()) as MachineInsert;

    return await db.insert(machineTable).values(machine)
      .then(() => new Response(JSON.stringify(machine)))
      .catch((message) => new Response(JSON.stringify({ code: 500, message })));
  },
};
