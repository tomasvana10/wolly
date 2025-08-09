# wolly

<img width="256" height="256" alt="wolly" src="https://github.com/user-attachments/assets/186e83ae-e920-4411-a659-04c38950cdf0" />

Power on your LAN devices with style

## Setup

1. `git clone https://github.com/tomasvana10/wolly.git`
2. Install [Docker](https://docs.docker.com/engine/install/)
3. Modify `compose.yml` how you wish (change ports, etc)
4. Build and run the container `docker compose up -d --build wolly postgres`

## Development

1. Install [Deno](https://docs.deno.com/runtime/getting_started/installation/)
2. `docker compose up -d --build postgres-dev`
3. `deno run dev`
