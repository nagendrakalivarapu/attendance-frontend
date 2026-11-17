# Smart Attendance Frontend

This is the JavaScript React frontend for the Smart Attendance System. It keeps the existing page layouts, colors, components, and routes, and connects to the Java Spring Boot API.

## Run locally

1. Install Node.js 22.12 or newer.
2. In this folder, install dependencies and start the development server:

   ```sh
   npm install
   npm run dev
   ```

3. Open the local address printed by Vite, usually `http://localhost:5173`.

## Backend addresses

By default, the frontend uses the Spring Boot API at `http://localhost:8080/api` and the optional face preview service at `http://127.0.0.1:8000`. You can override these with `VITE_API_URL` and `VITE_FACE_API_URL`, or use **Server settings** on the sign-in screen to save per-browser addresses.

The Java API must allow requests from the frontend's origin through CORS. Face attendance recognition is submitted to the Spring Boot API; the face preview service is used for the existing live camera check.

## Production build

```sh
npm run build
npm run preview
```

The production files are written to `dist/`. Configure a static host to serve `index.html` for unknown routes so nested pages continue to load on refresh.

## API compatibility

See [API-COMPATIBILITY.md](./API-COMPATIBILITY.md) for the verified Spring Boot routes and the separate face preview service that was not included in the Java source archive.
