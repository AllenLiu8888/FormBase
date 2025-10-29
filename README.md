# FormBase (React Native + Expo)

Front-end for a form system , built with React Native + Expo, integrated with a PostgREST backend. Supports Forms, Fields, Records, Filter Builder, and Map visualization, following Apple HIG-style UI via NativeWind.

## Getting Started

1) Install dependencies

```bash
npm install
npx expo install expo-router react-native-safe-area-context react-native-screens
npx expo install nativewind tailwindcss
npx expo install react-native-reanimated
npx expo install expo-clipboard expo-location react-native-maps expo-image-picker expo-camera
npx expo install expo-haptics
# Drag & gesture (if not installed yet)
npx expo install react-native-gesture-handler
npm i react-native-draggable-flatlist
```

2) Environment variables

Create `.env.local` and provide:

```bash
API_BASE_URL=https://comp2140a3.uqcloud.net/api
JWT_TOKEN=YOUR_JWT
USERNAME=s1234567
```

Expo injects these via `app.config.js` into `Constants.expoConfig.extra`. Do not commit secrets.

3) Run (Expo)

```bash
npm run start
# or
npm run ios
npm run android
npm run web
```

## Features

- Forms: create, edit, delete
- Fields: add/manage field definitions (text, multiline, dropdown, location, image)
- Records: dynamic entry from schema, required/number validation, delete, copy JSON
- Filter Builder: multiple criteria with global AND/OR, operators labeled in plain English
- Map: show markers when location fields exist
- Device APIs: camera/image picker, location, clipboard, haptics
- Field ordering: render by `order_index`; long-press drag to reorder with persisted indices

## Architecture

- Routing: `expo-router` (file-based)
- State: `zustand` global store (actions for forms/fields/records)
- UI: `nativewind` (Tailwind for RN, Apple HIG-inspired)
- Maps: `react-native-maps`
- Device APIs: `expo-location`, `expo-image-picker`, `expo-camera`, `expo-clipboard`, `expo-haptics`
- API layer: `src/lib/api.js` with resource clients and JSONB filter helper

### Directory Layout

```text
/app
  _layout.jsx                # Root stack + custom bottom nav
  index.jsx                  # Home / Welcome
  about.jsx                  # About
  /forms
    index.jsx               # My Forms
    [id]/_layout.jsx        # Tabs: fields / records / map
    [id]/fields.jsx         # Field list + drag reorder
    [id]/records.jsx        # Records + filters
    [id]/map.jsx            # Map

/src
  /components               # Reusable components
  /components/inputs        # Inputs for FormSheet
  /lib/api.js               # API client
  /store/useAppStore.js     # Zustand store

global.css
tailwind.config.js
```

## API Conventions

- Headers: `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`, `Prefer: return=representation`
- All POST/PATCH bodies include `username`
- Delete operations include `username` filter as required
- Records list default: `limit=20&offset=0` (UI later avoids pagination to prevent duplicates)

### JSONB Filter Examples

AND example:

```
/record?form_id=eq.{id}&values->>'price'=gt.100&values->>'category'=eq.Book
```

OR example (PostgREST `or=(...)`):

```
/record?form_id=eq.{id}&or=(values->>'price'.lt.50,values->>'category'.eq.Toy)
```

## Field Ordering & Drag

- Render strictly by ascending `order_index`.
- New field uses `order_index = current_count + 1`.
- Long-press to drag; upon release, indices update locally and persist via PATCH.
- Haptics: medium impact feedback when drag begins (iOS supported).

## Styling with NativeWind

- Use Tailwind classes via `className` in RN components.
- `global.css` imports Tailwind layers; `tailwind.config.js` scans `app/**` and `src/**`.

## Privacy Risks in Mobile Data Collection (Assessment Answer)

- Collection without consent or beyond necessity: e.g., adding an ID field that is not required.
- Plaintext storage/transmission: e.g., uploading records over public Wi‑Fi without HTTPS.
- Insufficient access control: e.g., viewing/deleting other users' records without authentication.
- PII exposure: e.g., names and phone numbers exported to a shareable JSON file.
- Clipboard exposure: e.g., copying a whole record and other apps subsequently read the clipboard.
- Misentry of sensitive information: e.g., passwords/bank card numbers entered into a generic "Notes" field.
- EXIF/geotag exposure: e.g., uploaded photos include capture coordinates and timestamps.
- Third-party privacy in images: e.g., inadvertently capturing other people's faces or ID details.
- Overly precise location: e.g., recording points down to a home street address/door number.
- Third-party map provider collection: e.g., base map tile requests expose coordinates to the map service provider.

## AI Assistance Statement

This project used ChatGPT to assist with:
- Writing explanatory code comments
- Drafting and polishing this README
- Assisting with code completion, testing, and debugging

All architecture and implementation decisions were reviewed and validated by the author. No proprietary data or credentials were shared with the AI service.
