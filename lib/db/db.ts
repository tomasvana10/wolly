import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.ts";

export const db = drizzle(Deno.env.get("DATABASE_URL")!, { schema });
