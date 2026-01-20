# Stock Chatbot AI - Market Intelligence Assistant

A full-stack AI-powered chatbot for stock market analysis and financial insights, built with React, Express, and Groq AI.

## 🏗️ Architecture

This is a **monorepo** with split deployment:

```
├── client/          → Frontend (React + Vite + Tailwind) → Deploy to Vercel
├── server/          → Backend (Express + Node.js) → Deploy to Render
└── shared/          → Shared types and routes
```

### Deployment Strategy

| Component | Folder   | Platform | Purpose                           |
|-----------|----------|----------|-----------------------------------|
| Frontend  | `client/`| Vercel   | Static React SPA                  |
| Backend   | `server/`| Render   | Express API + Groq AI integration |
| Shared    | `shared/`| Library  | Type-safe API contracts           |

> **Important:** Frontend and backend are deployed separately. They communicate via API calls with CORS enabled.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **Groq API Key** ([Get one here](https://console.groq.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anamitra-Sarkar/Stock-Chatbot-AI-1.git
   cd Stock-Chatbot-AI-1
   ```

2. **Install dependencies for all workspaces**
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   
   # Install shared dependencies
   cd ../shared
   npm install
   ```

---

## 💻 Local Development

### 1. Start the Backend (Terminal 1)

```bash
cd server
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
npm run dev
```

The backend will start on `http://localhost:5000`

**Backend Environment Variables** (in `server/.env`):
```env
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=development
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2. Start the Frontend (Terminal 2)

```bash
cd client
cp .env.example .env
# VITE_API_BASE_URL should point to your local backend
npm run dev
```

The frontend will start on `http://localhost:5173`

**Frontend Environment Variables** (in `client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Open your browser

Navigate to `http://localhost:5173` and start chatting!

---

## 🏗️ Building for Production

### Build Frontend
```bash
cd client
npm run build
# Output: client/dist/
```

### Build Backend
```bash
cd server
npm run build
# Output: dist/index.cjs
```

---

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. **Connect your repository to Vercel**

2. **Configure Vercel Project Settings:**
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Framework Preset:** Vite

3. **Set Environment Variables in Vercel:**
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```

4. **Deploy!** Vercel will automatically deploy on every push to main.

### Backend Deployment (Render)

1. **Create a new Web Service on Render**

2. **Configure Render Service:**
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node

3. **Set Environment Variables in Render:**
   ```
   GROQ_API_KEY=your_groq_api_key
   NODE_ENV=production
   PORT=5000  (Render sets this automatically)
   ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
   ```

4. **Deploy!** Render will build and start your backend.

### Post-Deployment

After both deployments:

1. Update `VITE_API_BASE_URL` in Vercel to point to your Render backend URL
2. Update `ALLOWED_ORIGINS` in Render to include your Vercel frontend URL
3. Test end-to-end communication

---

## 📂 Project Structure

```
Stock-Chatbot-AI-1/
├── client/                  # Frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks (API calls)
│   │   ├── pages/           # Page components
│   │   └── lib/             # Utilities
│   ├── public/              # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json          # Vercel configuration
│   └── .env.example
│
├── server/                  # Backend application
│   ├── index.ts             # Express server entry point
│   ├── routes.ts            # API routes + Groq integration
│   ├── storage.ts           # In-memory message storage
│   ├── build.ts             # Build script
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── shared/                  # Shared code
    ├── routes.ts            # API route definitions
    ├── schema.ts            # Database schema & types
    └── package.json
```

---

## 🔐 Environment Variables Reference

### Client (`client/.env`)

| Variable              | Required | Description                          | Example                                 |
|-----------------------|----------|--------------------------------------|-----------------------------------------|
| `VITE_API_BASE_URL`   | Yes      | Backend API base URL                 | `http://localhost:5000` (dev)<br>`https://your-backend.onrender.com` (prod) |

### Server (`server/.env`)

| Variable           | Required | Description                                | Example                                                      |
|--------------------|----------|--------------------------------------------|--------------------------------------------------------------|
| `GROQ_API_KEY`     | Yes      | Groq API key for AI model                  | `gsk_...`                                                    |
| `NODE_ENV`         | Yes      | Node environment                           | `development` or `production`                                |
| `PORT`             | No       | Server port (auto-set by Render)           | `5000`                                                       |
| `ALLOWED_ORIGINS`  | Yes      | CORS allowed origins (comma-separated)     | `http://localhost:5173,https://your-app.vercel.app`         |

---

## 🛠️ Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Wouter (routing)
- Radix UI components
- Framer Motion

**Backend:**
- Node.js
- Express 5
- TypeScript
- Groq AI API (OpenAI-compatible)
- CORS middleware

**Shared:**
- Zod (schema validation)
- Drizzle ORM (types)

---

## 🧪 API Endpoints

| Method | Endpoint           | Description                     |
|--------|--------------------|---------------------------------|
| GET    | `/api/messages`    | Get chat history                |
| POST   | `/api/chat`        | Send message to AI              |
| POST   | `/api/chat/clear`  | Clear chat history              |
| GET    | `/health`          | Health check                    |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Powered by [Groq](https://groq.com/) AI
- UI components from [Radix UI](https://www.radix-ui.com/)
- Deployed on [Vercel](https://vercel.com/) and [Render](https://render.com/)

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure `ALLOWED_ORIGINS` in backend includes your frontend URL
- Check that `VITE_API_BASE_URL` in frontend points to the correct backend

### Build Failures
- Run `npm install` in client/, server/, and shared/ directories
- Ensure Node.js version is 20+
- Clear node_modules and reinstall if needed

### 404 Errors on Vercel
- Verify `vercel.json` in client/ has correct rewrites
- Check that Root Directory is set to `client` in Vercel settings

### Backend Not Starting
- Verify `GROQ_API_KEY` is set correctly
- Check Render logs for errors
- Ensure all dependencies are installed

---

## 📞 Support

For issues or questions, please open an issue on [GitHub](https://github.com/Anamitra-Sarkar/Stock-Chatbot-AI-1/issues).
