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