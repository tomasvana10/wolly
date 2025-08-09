# wolly

<img width="256" height="256" alt="wolly" src="https://github.com/user-attachments/assets/186e83ae-e920-4411-a659-04c38950cdf0" />

Power on your LAN devices with style

Wolly also supports restarts and shutdowns through SSH.

## Setup

1. `git clone https://github.com/tomasvana10/wolly.git`
2. Install [Docker](https://docs.docker.com/engine/install/) and the [Deno JavaScript runtime](https://docs.deno.com/runtime/getting_started/installation/)
3. Configure your environment and credentials (important): `deno run --allow-env scripts/setUpEnvironment.ts`
4. Build and run the container: `docker compose up -d --build wolly postgres`

## Development

The development web server is run outside a container.

1. `docker compose up -d --build postgres-dev`
2. `deno run dev`
