FROM denoland/deno:1.30.2

EXPOSE 8080
EXPOSE 443

WORKDIR /app

RUN mkdir /app/.data/ \
	&& chown deno:deno /app/.data/
	
VOLUME [ "/app/.data" ]

COPY public ./public
COPY import_map.json ./import_map.json
COPY deno.json ./deno.json
COPY src ./src

RUN chown deno:deno /app

USER deno

CMD ["run", "--unstable", "--allow-all", "--no-check", "./src/server.ts"]