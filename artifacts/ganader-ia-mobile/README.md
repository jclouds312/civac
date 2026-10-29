# GanaderIA Mobile

Expo app for Android/iPhone with a web preview. It uses the existing GanaderIA API and account sessions.

## Run locally

From the workspace root:

```sh
pnpm --filter @workspace/ganader-ia-mobile run dev
```

The Expo workflow prints a QR code for Expo Go. In this Replit workspace, the workflow supplies `EXPO_PUBLIC_DOMAIN` and exposes the mobile web preview at `/mobile`.

When running Expo outside Replit, configure the API and web origins before starting:

```sh
EXPO_PUBLIC_API_URL=https://api.example.com \
EXPO_PUBLIC_WEB_URL=https://app.example.com \
pnpm --filter @workspace/ganader-ia-mobile run dev
```

Use origin URLs without a trailing slash or `/api` path. The API URL is public configuration, not a credential.

## Included

- Bearer-token sign-in; native tokens use Expo SecureStore and web preview sessions use browser session storage.
- Live dashboard counts, animal search/create/edit/delete, and weight-record entry.
- CIVAC AI with role-based guidance, remote chat when configured, and an offline local FAQ fallback.
- Live read views for pastures, inventory, reproduction, alerts, staff, and GPS.
- A link to the full responsive GanaderIA web app for actions not yet available as native forms.

Remote AI provider keys belong only on the backend; never add them to the mobile app. The Expo app keeps an offline FAQ guide available when the remote service is missing. Generative local inference is available in the web app on supported WebGPU browsers after its first model download. Serial-device measurements require connected hardware and are not available from a phone-only session.
