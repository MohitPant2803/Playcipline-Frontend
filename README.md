# Playcipline Frontend

A React-based frontend for the Playcipline platform, built with Vite.

## Tech Stack

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MohitPant2803/Playcipline-Frontend.git
   cd Playcipline-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   - `VITE_API_BASE_URL`: Your API base URL (e.g., `http://localhost:5000/api` for local development)

5. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for API requests | `http://localhost:5000/api` (dev) or leave empty for production (`/api`) |

## Deployment to Vercel

This project is configured for easy deployment to Vercel.

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add environment variables in Vercel dashboard:
   - `VITE_API_BASE_URL`: Set to your production API URL, or leave empty to use relative `/api` path
5. Click **Deploy**

### Manual Deployment

Install Vercel CLI:
```bash
npm i -g vercel
```

Deploy:
```bash
vercel
```

### SPA Routing

The `vercel.json` file configures rewrites to handle client-side routing:
- All non-file requests are redirected to `index.html`
- Requests to `/api/*` are passed through (for API integration)

### Environment Configuration for Vercel

For production on Vercel, you have two options:

1. **Use absolute URL**: Set `VITE_API_BASE_URL` to your full API URL (e.g., `https://api.example.com/api`)
2. **Use relative path**: Leave `VITE_API_BASE_URL` empty or unset. The app will use `/api` as the base path, which works well if your API is served from the same domain.

## Project Structure

```
├── public/           # Static assets
├── src/
│   ├── api/          # API client and endpoints
│   ├── components/   # Reusable UI components
│   ├── context/      # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   ├── utils/        # Utility functions
│   ├── App.jsx       # Main app component
│   ├── index.css     # Global styles
│   └── main.jsx      # App entry point
├── index.html        # HTML template
├── vite.config.js    # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── vercel.json       # Vercel deployment configuration
```

## License

MIT