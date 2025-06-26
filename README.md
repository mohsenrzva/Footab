# Footab Backend

This repository contains a small [NestJS](https://nestjs.com/) API that uses an OTP based workflow for authentication. After verifying an OTP, the server issues JWT access and refresh tokens.
One-time passwords are stored in a dedicated `otp` MongoDB collection rather than inside the user documents.

## Installation

```bash
npm install
```

### Environment variables

- `MONGO_URI` - MongoDB connection string (defaults to `mongodb://localhost/footab`)
- `JWT_SECRET` - secret used to sign tokens (`secret` by default)
- `JWT_ACCESS_EXPIRES_IN` - access token lifetime (default `30m`)
- `JWT_REFRESH_EXPIRES_IN` - refresh token lifetime (default `7d`)
- `PORT` - port the server listens on (default `3000`)

Create a `.env` file (you can copy `.env.example`) to set these values. The server
loads this file automatically on startup.

## Running the app

```bash
# development
npm run start:dev

# production
npm run start
```

## Testing

```bash
npm run test       # run unit tests
npm run test:e2e   # run e2e tests
npm run test:cov   # generate coverage report
```

## API overview

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/auth/request-otp` | Request a one time password for a phone number |
| `POST` | `/auth/verify-otp` | Verify the OTP and receive access and refresh tokens |
| `POST` | `/auth/refresh` | Exchange refresh token for a new access token |
| `GET`  | `/auth/profile` | Example protected route |

Swagger documentation is available at `/api` when the server is running.

## License

MIT
