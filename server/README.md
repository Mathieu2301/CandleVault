# CandleVault Agent

Agent that open and closes positions on CandleVault using TradingView data.

## Development

1. Install dependencies

    ```sh
    yarn
    ```

2. Configuration

    Create a `.env` file or set env variables:

    ```env
    FIREBASE_CREDENTIALS={"type":"service_account", ...}
    FIREBASE_DB=https://xxxxxxx.firebaseio.com
    PORT=4000 # Optional
    CORR=0 # Optional
    ```

3. `yarn dev`

## Deployment with Docker Compose (Traefik)

```yml
version: '3'

services:
  candlevault-agent:
    image: ghcr.io/mathieu2301/candlevault-agent:latest
    restart: always
    environment:
      FIREBASE_CREDENTIALS: ${FIREBASE_CREDENTIALS}
      FIREBASE_DB: ${FIREBASE_DB}
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.candlevault.rule=Host(`${SERVER_URL}`)'
      - 'traefik.http.routers.candlevault.entrypoints=https'

networks:
  default:
    name: traefik_web
    external: true
```
