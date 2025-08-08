FROM denoland/deno:2.4.3

EXPOSE 6767

WORKDIR /app

COPY . .

CMD ["task", "deploy"]

