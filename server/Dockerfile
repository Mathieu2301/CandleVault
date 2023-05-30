FROM node:lts-hydrogen

LABEL org.opencontainers.image.source=https://github.com/mathieu2301/candlevault

WORKDIR /app

COPY package.json .

RUN yarn
COPY . .

CMD ["node", "./main.js"]
