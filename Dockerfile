FROM denoland/deno:2.4.3

WORKDIR /app

COPY . .

CMD ["task", "deploy"]

