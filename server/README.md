# GroChain Backend

A production-grade Node.js/TypeScript backend for GroChain: Digital Trust Platform for Nigeria’s Agriculture.

## Features
- Modular, scalable, and secure architecture
- User authentication (JWT, RBAC)
- Partner onboarding and referral tracking
- Swagger/OpenAPI documentation
- Docker & CI/CD ready

## Setup
1. Clone the repo and install dependencies:
   ```sh
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your environment variables.
3. Start MongoDB (locally or with MongoDB Atlas).
4. Run the server in development:
   ```sh
   npm run dev
   ```
5. Access API docs at [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

## Scripts
- `npm run dev` — Start server with ts-node
- `npm run build` — Compile TypeScript
- `npm start` — Run compiled server
- `npm test` — Run tests

## Contribution
- Follow the modular structure (controllers, models, routes, services, middlewares, utils)
- Add/Update Swagger docs for every endpoint
- Write tests for new features
- Use environment variables for secrets/config

## License
MIT
