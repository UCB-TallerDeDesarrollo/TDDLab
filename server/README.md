
## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run dev

# production mode
$ npm run dev
```

## Local environment

Create a `.env` file in `server/` or in the repository root with these values:

```bash
PGHOST=ep-rough-union-a5xn25u7-pooler.us-east-2.aws.neon.tech
PGDATABASE=neondb
PGUSER=neondb_owner
PGPASSWORD=i8umcFGt4DBE
PGPORT=5432
VITE_FIREBASE_PROJECT_ID=tddlab-staging-firebase
JWT_SECRET=tdd-lab-td
VITE_FRONT_URL=http://localhost:5173
```

If you prefer, you can also set `FIREBASE_PROJECT_ID` instead of relying on `VITE_FIREBASE_PROJECT_ID`.

If port `3000` is busy, you can override it with `PORT`, for example `PORT=3001 npm run dev`.

Run the server:

```bash
npm run dev
```

The backend usually listens on `http://localhost:3000`.

Example requests:

```bash
curl http://localhost:3000/api/user/users
curl http://localhost:3000/api/assignments
```

## Test

```bash
# unit tests
$ npm run test
$ npm run test:coverage
