FROM node:latest

LABEL org.opencontainers.image.source=https://github.com/mathieu2301/candlevault

WORKDIR /app

# Copy package.json and yarn.lock to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile
COPY . .

EXPOSE 4000

CMD ["yarn", "start"]
