# 🚀 Deployment Guide - Stock Chatbot AI

This guide provides step-by-step instructions for deploying the Stock Chatbot AI to production.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Groq API key ([Get one here](https://console.groq.com/))
- [ ] GitHub account with repository access
- [ ] Vercel account ([Sign up](https://vercel.com/signup))
- [ ] Render account ([Sign up](https://render.com/register))

## 🎯 Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐
│   Vercel        │         │    Render       │
│   (Frontend)    │ ◄─────► │   (Backend)     │
│                 │  CORS   │                 │
│  React + Vite   │  APIs   │  Express API    │
└─────────────────┘         └─────────────────┘
        ▲                            ▲
        │                            │
        └────── User Browser ────────┘
```

---

## 1️⃣ Backend Deployment (Render)

### Step 1: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

```yaml
Name: stock-chatbot-backend
Region: Choose nearest to your users
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### Step 2: Set Environment Variables

In Render, go to **Environment** and add:

| Key                 | Value                                    |
|---------------------|------------------------------------------|
| `GROQ_API_KEY`      | Your Groq API key                        |
| `NODE_ENV`          | `production`                             |
| `ALLOWED_ORIGINS`   | `http://localhost:5173` (temporary)      |

> **Note:** We'll update `ALLOWED_ORIGINS` after deploying the frontend.

### Step 3: Deploy

Click **"Create Web Service"** and wait for deployment to complete.

**Save your Render backend URL:** `https://your-app-name.onrender.com`

---

## 2️⃣ Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:

```yaml
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 2: Set Environment Variables

In Vercel, go to **Settings** → **Environment Variables** and add:

| Key                    | Value                                      |
|------------------------|--------------------------------------------|
| `VITE_API_BASE_URL`    | `https://your-app-name.onrender.com`      |

> Replace with your actual Render backend URL from Step 1.3

### Step 3: Deploy

Click **"Deploy"** and wait for deployment to complete.

**Save your Vercel frontend URL:** `https://your-app.vercel.app`

---

## 3️⃣ Connect Frontend and Backend

### Update Backend CORS Origins

1. Go back to **Render Dashboard** → Your service
2. Go to **Environment** variables
3. Update `ALLOWED_ORIGINS`:
   ```
   https://your-app.vercel.app,http://localhost:5173
   ```
4. Click **"Save Changes"**
5. Render will automatically redeploy

---

## 4️⃣ Verification

### Test the Deployment

1. **Open your frontend:** `https://your-app.vercel.app`
2. **Check health endpoint:** `https://your-backend.onrender.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`
3. **Test chat functionality:**
   - Type a message in the chat
   - Verify AI responds correctly
   - Check browser console for errors

### Common Issues

| Issue | Solution |
|-------|----------|
| **CORS Error** | Verify `ALLOWED_ORIGINS` includes your Vercel URL |
| **404 on Vercel** | Check `vercel.json` rewrites in `client/` folder |
| **Backend not responding** | Check Render logs, verify `GROQ_API_KEY` is set |
| **Build failures** | Ensure `Root Directory` is set correctly |

---

## 5️⃣ Post-Deployment

### Monitor Your Apps

**Vercel:**
- View logs: Dashboard → Your Project → Deployments → View Function Logs
- Analytics: Dashboard → Your Project → Analytics

**Render:**
- View logs: Dashboard → Your Service → Logs
- Metrics: Dashboard → Your Service → Metrics

### Enable Auto-Deploy

Both Vercel and Render are configured for auto-deploy on git push to `main` branch.

### Custom Domain (Optional)

**Vercel:**
1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**Render:**
1. Go to Settings → Custom Domain
2. Add your custom domain
3. Update DNS records as instructed

**After adding custom domains, update:**
- Backend `ALLOWED_ORIGINS` with new frontend domain
- Frontend `VITE_API_BASE_URL` if backend domain changed

---

## 🔐 Security Checklist

- [ ] `GROQ_API_KEY` is set and kept secret
- [ ] `ALLOWED_ORIGINS` only includes your domains
- [ ] HTTPS is enabled (automatic on Vercel/Render)
- [ ] Environment variables are not committed to git
- [ ] API keys are rotated periodically

---

## 🛠️ Local Development After Deployment

To test locally with production backend:

```bash
cd client
# Create .env file
echo "VITE_API_BASE_URL=https://your-backend.onrender.com" > .env
npm run dev
```

To test locally with local backend:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
echo "VITE_API_BASE_URL=http://localhost:5000" > .env
npm run dev
```

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Project Issues:** https://github.com/Anamitra-Sarkar/Stock-Chatbot-AI-1/issues

---

## 🎉 Success!

Your Stock Chatbot AI is now live and production-ready! 

Share your deployment URL and start chatting about stocks! 📈
