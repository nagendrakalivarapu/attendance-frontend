# API compatibility

I compared the frontend calls with the uploaded Spring Boot source archive. All Spring Boot paths used by the frontend are present in the controllers, including attendance sessions. The earlier conversation preview's claim that the session controller was missing does not match the uploaded source.

The frontend continues to call the Java API using its existing request shapes. The uploaded Spring source supports authentication and OTP, admin/student/teacher management, courses, enrollments, attendance summaries and reports, attendance sessions, face attendance submission, and attendance email preview/send. No backend endpoint was invented and the Java backend was not modified.

## Separate face preview service

The Java archive did not include the separate FastAPI face preview service, so these existing frontend calls could not be checked against its implementation:

- `GET /face/health`
- `POST /face/detect` with multipart field `image`

The preview service address can be set with `VITE_FACE_API_URL` or **Server settings** on the sign-in page. Actual face attendance is submitted to the confirmed Spring Boot endpoint `POST /api/attendance/face/{sessionId}` with multipart field `image`.

## Local browser access

Configure Spring Boot CORS to allow the frontend origin (by default, `http://localhost:5173`). Without that, browsers block API requests even when the API server is running.
