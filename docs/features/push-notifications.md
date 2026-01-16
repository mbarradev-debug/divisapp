# Push Notifications

This document explains how Web Push notifications work in DivisApp.

## Overview

Web Push allows the application to send notifications to users even when they don't have the app open. The notifications appear as system notifications on the user's device.

The feature consists of four main parts:

1. **Permission Flow** - Asking the user for notification permission
2. **Subscription Management** - Storing the browser's push subscription
3. **Push Delivery** - Sending notifications to subscribed browsers
4. **Service Worker** - Receiving and displaying notifications

## How Web Push Works

Web Push uses a standardized protocol defined by the W3C. Here's the simplified flow:

```
1. User grants permission
   └─> Browser generates a unique subscription (endpoint + keys)

2. App sends subscription to server
   └─> Supabase stores the subscription in database

3. Server wants to send notification
   └─> Edge Function encrypts payload and sends to push service

4. Push service delivers to browser
   └─> Service Worker receives event and shows notification
```

### Key Concepts

**Push Subscription**: When a user grants permission, the browser generates:
- An `endpoint` URL (unique per browser/device)
- A `p256dh` key (public key for encryption)
- An `auth` secret (for additional encryption)

**VAPID**: Voluntary Application Server Identification. A way for the server to prove its identity to push services using cryptographic keys.

**Service Worker**: A background script that runs independently of the web page. It handles incoming push events even when the app is closed.

## File Structure

```
lib/
  push/
    web-push.ts           # Permission flow and subscription management
    send-test-push.ts     # Testing utilities

public/
  sw.js                   # Service Worker

supabase/
  functions/
    send-push/
      index.ts            # Edge Function for delivery
  migrations/
    20260115_create_push_subscriptions.sql
```

## Permission Flow

The permission flow is handled in `lib/push/web-push.ts`.

### Requesting Permission

```typescript
// Check if push is supported
if (!isPushSupported()) {
  return { success: false, error: 'Push not supported' };
}

// Request permission
const permission = await Notification.requestPermission();
if (permission !== 'granted') {
  return { success: false, error: 'Permission denied' };
}
```

### Creating a Subscription

```typescript
// Get the service worker registration
const registration = await navigator.serviceWorker.ready;

// Subscribe to push with VAPID key
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
});
```

The `applicationServerKey` must match the public key configured on the server. If they don't match, push delivery will fail with a 403 error.

### Saving the Subscription

The subscription object contains:

```typescript
{
  endpoint: "https://fcm.googleapis.com/fcm/send/...",
  keys: {
    p256dh: "BNc...",  // Browser's public key
    auth: "abc..."     // Auth secret
  }
}
```

This is sent to Supabase and stored in the `push_subscriptions` table.

## Subscription Storage

Subscriptions are stored in Supabase. The client code is in `lib/supabase/push-subscriptions.ts`.

### Database Schema

```sql
create table push_subscriptions (
  endpoint text primary key,     -- Unique identifier
  p256dh text not null,          -- Encryption key
  auth text not null,            -- Auth secret
  user_id uuid,                  -- Optional user association
  expiration_time bigint,        -- When subscription expires
  user_agent text,               -- Browser info
  created_at timestamptz,
  updated_at timestamptz
);
```

### Upsert Logic

```typescript
export async function saveSubscription(subscription: PushSubscription) {
  const { endpoint, keys } = subscription.toJSON();

  await supabase.from('push_subscriptions').upsert({
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    user_agent: navigator.userAgent,
  });
}
```

## Push Delivery

The Edge Function in `supabase/functions/send-push/index.ts` handles delivery.

### Request Format

```typescript
interface PushDeliveryRequest {
  eventId: string;           // Unique ID for tracking
  userId: string;            // Target user (for filtering)
  notification: {
    title: string;
    body: string;
    actionUrl?: string;
    data?: Record<string, any>;
  };
}
```

### Delivery Process

1. **Query subscriptions** from database
2. **Create VAPID JWT** for authentication
3. **Encrypt payload** using subscriber's public key
4. **Send to push service** (FCM, Mozilla, etc.)
5. **Handle responses** (success, expired, rate-limited)

### VAPID Authentication

```typescript
const authorization = `vapid t=${jwt}, k=${publicKey}`;
```

The JWT contains:
- `aud`: The push service origin (e.g., `https://fcm.googleapis.com`)
- `exp`: Expiration time (12 hours from now)
- `sub`: Contact email for the application server

### Payload Encryption

Web Push payloads must be encrypted. The process:

1. Generate an ephemeral ECDH key pair
2. Derive a shared secret with subscriber's key
3. Use HKDF to derive content encryption key
4. Encrypt with AES-128-GCM

```typescript
const { ciphertext, salt, localPublicKey } = await encryptPayload(
  payload,
  subscription.p256dh,
  subscription.auth
);
```

### Response Handling

| Status | Meaning | Action |
|--------|---------|--------|
| 201 | Success | Notification delivered |
| 404/410 | Gone | Remove subscription |
| 429 | Rate limited | Retry later |
| 403 | Unauthorized | Check VAPID keys |

## Service Worker

The Service Worker in `public/sw.js` handles incoming push events.

### Push Event Handler

```javascript
self.addEventListener('push', (event) => {
  const payload = event.data.json();

  const options = {
    body: payload.body,
    icon: '/icon-192.png',
    tag: payload.data?.eventId,
    data: { url: payload.actionUrl },
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});
```

### Click Handler

```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.openWindow(url)
  );
});
```

## Configuration

### Environment Variables

Frontend (`.env.local`):
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEBvnt4gt9...
```

Supabase secrets:
```bash
npx supabase secrets set \
  VAPID_PUBLIC_KEY="BEBvnt4gt9..." \
  VAPID_PRIVATE_KEY="giWVIm4APF..."
```

### Generating VAPID Keys

VAPID keys are EC P-256 key pairs. You can generate them using:

```bash
npx web-push generate-vapid-keys
```

Or programmatically:

```javascript
const keys = await crypto.subtle.generateKey(
  { name: 'ECDH', namedCurve: 'P-256' },
  true,
  ['deriveBits']
);
```

## Testing

### Local Development

1. Ensure `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is in `.env.local`
2. Run `npm run dev`
3. Go to Settings page
4. Grant notification permission
5. Use "Test Push" button

### Debugging

Check Service Worker logs:
1. Open DevTools → Application → Service Workers
2. Click "Inspect" on your service worker
3. View console for `[SW]` prefixed logs

Check Edge Function logs:
1. Go to Supabase Dashboard → Functions
2. Select `send-push`
3. View logs for `[send-push]` messages

### Common Issues

**403 from push service**: VAPID credentials don't match the subscription. Re-subscribe with the correct public key.

**No notification appears**: Check browser notification permissions in system settings.

**CORS errors**: Ensure the Edge Function includes CORS headers for your origin.

## How to Extend

### Adding Notification Types

1. Define new notification data in the payload
2. Handle it in the Service Worker
3. Add corresponding UI in the frontend

### Targeting Specific Users

The current implementation sends to all subscriptions. To target specific users:

1. Store `user_id` when saving subscriptions
2. Filter by `user_id` in the Edge Function query
3. Pass the target user in the delivery request

### Adding Action Buttons

```javascript
const options = {
  body: payload.body,
  actions: [
    { action: 'view', title: 'View' },
    { action: 'dismiss', title: 'Dismiss' }
  ]
};
```

Handle in `notificationclick`:

```javascript
if (event.action === 'view') {
  clients.openWindow(url);
}
```
