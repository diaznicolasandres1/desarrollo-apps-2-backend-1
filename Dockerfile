# Imagen de producción: el tar ya contiene dist/, no se necesita build
FROM node:22-alpine AS production

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=nestjs:nodejs ./dist ./dist

USER nestjs

EXPOSE 80

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main"]
