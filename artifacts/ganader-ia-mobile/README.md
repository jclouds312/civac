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
- CIVAC AI chat with role-based usage guidance.
- Live read views for pastures, inventory, reproduction, alerts, staff, and GPS.
- A link to the full responsive GanaderIA web app for actions not yet available as native forms.

The AI model key belongs only on the backend as `GEMINI_API_KEY`; never add it to the mobile app. AI chat will report unavailable until the backend key is configured. Serial-device measurements require connected hardware and are not available from a phone-only session.
