# Pinned on purpose: `node:latest` silently moved this agent across major Node
# versions between builds, which is how an unhandled rejection quietly became a
# fatal error. Bump this line deliberately, not by rebuilding.
FROM node:22-alpine AS deps

WORKDIR /app

# The `websocket` package pulls the optional native accelerators bufferutil and
# utf-8-validate. They ship a linux-x64 prebuild but no linux-arm64 one, and the
# old node:latest image was Debian with a toolchain already present. Only
# node_modules is copied into the runtime stage, so none of this ships.
RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean


FROM node:22-alpine AS runner

LABEL org.opencontainers.image.source=https://github.com/mathieu2301/candlevault
LABEL org.opencontainers.image.description="CandleVault trading agent"

ENV NODE_ENV=production

WORKDIR /app

# dumb-init reaps zombies and forwards SIGTERM, so Kubernetes can stop the pod
# cleanly instead of waiting out the 30s grace period.
RUN apk add --no-cache dumb-init

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node

EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "main.js"]
