# Flow Logic Frontend

React + TypeScript + Vite frontend for Flow Logic platform.

## Tech Stack

- **React 18+** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for routing
- **Axios** for API calls
- **React Hook Form + Zod** for form validation

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/frontend/
├── components/       # React components
│   ├── common/      # Shared components (Layout, ProtectedRoute)
│   └── features/    # Feature-specific components
├── pages/           # Page components
├── store/           # Zustand stores
├── api/             # API client and endpoints
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── styles/          # Global styles
└── tests/           # Tests
```

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=https://api.flowlogic.shop/v1
```

## Development

The app runs on `http://localhost:3000` by default.

API requests are proxied to `http://localhost:3001` in development (see `vite.config.ts`).

## Deployment

The frontend is deployed to Vercel. Push to `main` branch triggers automatic deployment.




