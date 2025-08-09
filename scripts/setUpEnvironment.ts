import * as yaml from "jsr:@std/yaml";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "https://deno.land/std@v0.224.0/path/mod.ts";
import { promptSecret } from "jsr:@std/cli@^1.0.21";
import chalk from "npm:chalk";
import { randomBytes } from "node:crypto";
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import * as dotenv from "https://deno.land/std@v0.224.0/dotenv/mod.ts";

const parsePostgresCredentials = (creds: string) => {
  const match = creds.match(/^([^@\/\s]+)@([^@\/\s]+)\/([^@\/\s]+)$/);
  if (!match) return null;
  const [_, user, password, dbName] = match;
  return { user, password, dbName };
};

//#region Acquire prefs
console.log(
  chalk.yellowBright(
    "WARNING: You must complete all inputs for your preferences to be saved.",
  ),
);
const webProdHostPort = prompt(
  `[${chalk.magentaBright("Web Server->Production")}]: Host port (${
    chalk.italic("default is 6767")
  }):`,
) || 6767;
const webProdContainerPort = prompt(
  `[${chalk.magentaBright("Web Server->Production")}]: Container port (${
    chalk.italic("default is host port")
  }):`,
) || webProdHostPort;
console.log(
  `[${chalk.magentaBright("Web Server->Production")}]: ${
    chalk.green(
      `Port mapping set to ${webProdHostPort}:${webProdContainerPort}`,
    )
  }`,
);

const webUseSamePorts = prompt(
  `Would you like to have the same host port for the development web server (not dockerised)? ${
    chalk.underline("[Y/n]")
  }:`,
) || "y";
const webUseSamePortsParsed = webUseSamePorts.toLowerCase().trim();
let webDevHostPort = webProdHostPort;
if (webUseSamePortsParsed === "n") {
  webDevHostPort = prompt(
    `[${chalk.magenta("Web Server->Dev")}]: Host port (${
      chalk.italic("default is 6767")
    }):`,
  ) || 6767;
}

console.log(
  `[${chalk.magenta("Web Server->Dev")}]: ${
    chalk.green(`Port set to ${webDevHostPort}`)
  }`,
);

const pgProdHostPort = prompt(
  `[${chalk.blueBright("Postgres->Production")}]: Host port (${
    chalk.italic("default is 6769")
  }):`,
) || 6769;
console.log(
  `[${chalk.blueBright("Postgres->Production")}]: ${
    chalk.green(`Port mapping set to ${pgProdHostPort}:5432`)
  }`,
);

let pgProdCreds;
let pgProdCredsParsed;
while (true) {
  pgProdCreds = prompt(
    `[${chalk.blueBright("Postgres->Production")}]: Credentials (${
      chalk.italic("<user>@<password>/<dbName>")
    }):`,
  );
  pgProdCredsParsed = parsePostgresCredentials(pgProdCreds ?? "");
  if (!pgProdCredsParsed) {
    console.error(
      `[${chalk.blueBright("Postgres->Production")}]: ${
        chalk.red("Invalid credential format")
      }`,
    );
  } else {
    break;
  }
}
console.log(
  `[${chalk.blueBright("Postgres->Production")}]: ${
    chalk.green(`Credentials set to ${pgProdCreds}`)
  }`,
);

const pgUseSameDevCreds = prompt(
  `Would you like to have the same settings for the development postgres server? ${
    chalk.underline("[Y/n]")
  }:`,
) || "y";
const pgUseSameDevCredsParsed = pgUseSameDevCreds.toLowerCase().trim();
let pgDevCreds;
let pgDevCredsParsed;
let pgDevHostPort;
if (pgUseSameDevCredsParsed === "n") {
  while (true) {
    pgDevHostPort = prompt(
      `[${chalk.blue("Postgres->Dev")}]: Host port (${
        chalk.italic("default is 6769")
      }):`,
    ) || 6769;
    pgDevCreds = prompt(
      `[${chalk.blue("Postgres->Dev")}]: Credentials (${
        chalk.italic("<user>@<password>/<dbName>")
      }):`,
    );
    pgDevCredsParsed = parsePostgresCredentials(pgDevCreds ?? "");
    if (!pgDevCredsParsed) {
      console.error(
        `[${chalk.blue("Postgres->Dev")}]: Invalid credential format`,
      );
    } else {
      break;
    }
  }
} else {
  pgDevHostPort = pgProdHostPort;
  pgDevCreds = pgProdCreds;
  pgDevCredsParsed = structuredClone(pgProdCredsParsed);
}
console.log(
  `[${chalk.blue("Postgres->Dev")}]: ${
    chalk.green(`Port mapping set to ${pgDevHostPort}:5432`)
  }`,
);
console.log(
  `[${chalk.blue("Postgres->Dev")}]: ${
    chalk.green(`Credentials set to ${pgDevCreds}`)
  }`,
);

const createJWTSecret = prompt(
  `Would you like to create a JWT secret? If not, you must do it manually ${
    chalk.underline("[Y/n]")
  }:`,
) || "y";
const createJWTSecretParsed = createJWTSecret.toLocaleLowerCase().trim();
const jwtSecret = createJWTSecretParsed === "y"
  ? randomBytes(32).toString("hex")
  : "";

let webUsername;
let webPassword;
while (true) {
  webUsername = prompt(
    "Enter a username for your web server. Must be at least 3 characters:",
  ) ?? "";
  webPassword = promptSecret(
    "Enter a password for your web server. Must be at least 8 characters:",
  ) ?? "";
  const webPasswordConfirmation = promptSecret(
    "Confirm your password:",
  ) ?? "";
  if (webUsername.length < 3 || webPassword.length < 8) {
    console.error(chalk.red("Invalid credential lengths provided"));
  } else if (webPassword !== webPasswordConfirmation) {
    console.error(chalk.red("Passwords do not match!"))
  } else {
    break;
  }
}
console.log(
  chalk.green(
    `Set web credentials to ${webUsername}:${"*".repeat(webPassword.length)}`,
  ),
);
const passwordHash = await hash(webPassword);
//#end-region

//#region Apply prefs
const parentDir = join(dirname(new URL(import.meta.url).pathname), "..");
const dockerComposeFile = join(parentDir, "compose.yml");
const envFile = join(parentDir, ".env");

// short for docker compose file
const dcf = yaml.parse(readFileSync(dockerComposeFile).toString()) as Record<
  string,
  //deno-lint-ignore no-explicit-any
  any
>;

dcf.services.wolly.ports = [`${webProdHostPort}:${webProdContainerPort}`];
dcf.services.wolly.environment = {
  DATABASE_URL:
    `postgresql://${pgProdCredsParsed.user}:${pgProdCredsParsed.password}@postgres:5432/${pgProdCredsParsed.dbName}`,
  DENO_ENV: "production",
  PORT: `${webProdContainerPort}`,
};

dcf.services.postgres.ports = [`${pgProdHostPort}:5432`];
dcf.services.postgres.environment = {
  POSTGRES_USER: pgProdCredsParsed.user,
  POSTGRES_PASSWORD: pgProdCredsParsed.password,
  POSTGRES_DB: pgProdCredsParsed.dbName,
};

dcf.services["postgres-dev"].ports = [`${pgDevHostPort}:5432`];
dcf.services["postgres-dev"].environment = {
  POSTGRES_USER: pgDevCredsParsed.user,
  POSTGRES_PASSWORD: pgDevCredsParsed.password,
  POSTGRES_DB: pgDevCredsParsed.dbName,
};
writeFileSync(dockerComposeFile, yaml.stringify(dcf));

try {
  await Deno.stat(envFile);
} catch {
  await Deno.writeTextFile(envFile, "");
}

const envFileContents = {
  PORT: `${webDevHostPort}`,
   DATABASE_URL:
    `postgresql://${pgDevCredsParsed.user}:${pgDevCredsParsed.password}@localhost:${pgDevHostPort}/${pgDevCredsParsed.dbName}`,
    DENO_ENV: "development",
    USERNAME: webUsername,
    JWT_SECRET: jwtSecret,
    PASSWORD_HASH: passwordHash,
};
writeFileSync(envFile, dotenv.stringify(envFileContents));
//#end-region

console.log(`\n${chalk.green("Applied your changes .env and compose.yml.")}`)
console.log(chalk.yellowBright("WARNING: You must rebuild the docker containers (docker compose down -v) OR manually change your postgres credentials if they were modified."))