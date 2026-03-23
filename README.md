# Iron & Wrench

This project is set up with:

- React (Vite)
- WebGL stack: `three`, `@react-three/fiber`, `@react-three/drei`
- Custom component CSS with shared theme variables in `src/index.css`
- Firebase SDK with Firestore and Storage setup

## Run locally

1. Install dependencies:

	npm install

2. Configure environment:

	cp .env.example .env

3. Add your Firebase web config values to `.env`.

4. Start dev server:

	npm run dev

## Firebase setup

Firebase initialization lives in `src/firebase.js` and exports:

- `app`
- `analytics` (Firebase Analytics)
- `db` (Firestore)
- `storage` (Firebase Storage)

Use these exports anywhere in your app.
