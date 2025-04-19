# 💬 Relationship AI — Reflective Conversation Engine

An emotionally intelligent relationship assistant that guides users to build balanced, meaningful relationship profiles through structured reflection, sentiment analysis, and phase-specific prompts.

## 🧠 Core Features

### 🎯 4-Phase Conversation Flow
- **Onboarding & History**: Explore meeting stories, favorite memories, interaction frequency, and usual topics.
- **Emotional Mapping**: Reflect on love, appreciation, roles, and support during tough times.
- **Dynamics & Tensions**: Address disconnection, annoyances, conflicts, and relationship balance.
- **Dual-Lens Reflection**: Switch perspectives, build empathy, and uncover mutual views.

### 🔍 HuggingFace-powered Sentiment Analysis
- Detects emotional tone from voice/text inputs.
- Scales from -1 (negative) to +1 (positive) for nuanced insights.

### 🗣️ Prompt Generation (LLM-driven)
- Generates reflective, phase-specific prompts (e.g., "How did you and [Name] meet?").
- Memory-aware, avoids repetition, focuses on the contact (not the user).

### 📦 MongoDB-based Memory Engine
- Stores content, phase, type, sentiment, depth, and topic.
- Supports summarization, journaling, and trend tracking with a weighted system.

## 🏗️ Project Structure

### /backend
- **`models/`**: Mongoose models for relationship data.
- **`controllers/`**: Logic for relationship and session handling.
- **`sockets/`**: Voice socket and AI conversation loop.
- **`utils/`**: HuggingFace integration, depth, and topic utilities.
- **`server.js`**: Main server entry point.

### /frontend
- **`src/`**: React UI code (if applicable).
- **`public/`**: Static files (e.g., index.html).

## 🔌 Environment Variables (.env in /backend)
```bash
HUGGINGFACE_API_TOKEN=hf_your_token_here
MONGODB_URI=mongodb://localhost:27017/relationshipai
```

## ▶️ Run Locally


```
cd backend
npm install
node server.js


2. Frontend

cd frontend
npm install
npm run dev ```


### Frontend communicates with the backend at http://localhost:5000


## 🚀 Steps to Run backend Container

This backend is containerized using Docker and is ready to be deployed locally or to platforms like Cloud Run.

### 🔧 Prerequisites

- [Docker](https://www.docker.com/) installed
- `.env` file with required environment variables

### 📁 Required `.env` File

Create a `.env` file in the root directory with the following variables:

MONGO_URI=your_mongodb_uri 
JWT_SECRET=your_jwt_secret 
GOOGLE_APPLICATION_CREDENTIALS=./gcp-key.json 
HUGGINGFACE_API_TOKEN=your_huggingface_token


> 🔒 Make sure to keep this file secret and **never commit it to Git** (already in `.dockerignore`).

---

### 🐳 Build the Docker Image

```bash
docker build -t backend-app .
```bash
docker run --env-file .env -v "$(pwd)/gcp-key.json:/app/gcp-key.json" -p 5000:5000 backend-app

Note:- Please create gcp-key.json file from https://console.cloud.google.com/iam-admin/serviceaccounts