# Imagen de producción: el tar ya contiene dist/, no se necesita build
FROM node:22-alpine AS production

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

# ----------------------------
# Build-time ARGs (opcionales)
# CapRover puede inyectar como build args si usás "caprover deploy --imageName" con args
ARG NODE_ENV=production
ARG PORT=80
# Redis
ARG REDIS_PASSWORD
ARG REDIS_PORT
ARG REDIS_HOST
ARG REDIS_URL
ARG REDIS_DB
# Email
ARG EMAIL_HOST
ARG EMAIL_PORT
ARG EMAIL_USER
ARG EMAIL_PASS
ARG EMAIL_FROM
# Mongo
ARG MONGODB_URI
# ----------------------------

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=nestjs:nodejs ./dist ./dist

# ----------------------------
# Runtime ENVs (CapRover inyecta por panel/variables de la app)
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
# Redis
ENV REDIS_PASSWORD=${REDIS_PASSWORD}
ENV REDIS_PORT=${REDIS_PORT}
ENV REDIS_HOST=${REDIS_HOST}
ENV REDIS_URL=${REDIS_URL}
ENV REDIS_DB=${REDIS_DB}
# Email
ENV EMAIL_HOST=${EMAIL_HOST}
ENV EMAIL_PORT=${EMAIL_PORT}
ENV EMAIL_USER=${EMAIL_USER}
ENV EMAIL_PASS=${EMAIL_PASS}
ENV EMAIL_FROM=${EMAIL_FROM}
# Mongo
ENV MONGODB_URI=${MONGODB_URI}
# ----------------------------

USER nestjs

EXPOSE 80

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main"]
