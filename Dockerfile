# Stage de construcción
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm install

COPY . .

RUN npm run build

# Stage de producción
FROM node:22-alpine AS production

RUN apk add --no-cache dumb-init wget

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV MONGODB_URI=""

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main"]
