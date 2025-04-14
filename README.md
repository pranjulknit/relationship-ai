# Relationship AI MVP
Voice-based app for relationship insights using MERN, Vite, and GCP.
## Setup
### Backend

cd backend
npm install
Set .env with MONGO_URI, JWT_SECRET, GOOGLE_APPLICATION_CREDENTIALS
npm run server

### Frontend

cd frontend
npm install
Set .env with VITE_API_URL
npm run dev

#### Features

4-phase conversation flow (Onboarding, Emotional, Dynamics, Dual-Lens).
Voice input/output with GCP Speech-to-Text and Text-to-Speech.
Enhanced AI:
Weighted sentiment analysis for nuanced emotions.
Personalized prompts based on past memories.
Detailed session summaries with actionable suggestions.
Sentiment trend tracking across sessions.


MongoDB Atlas for data storage.
Modular backend with separate routes, controllers, sockets.
Deployed on GCP Cloud Run (backend) and Vercel (frontend).

#### Challenges


Debugged Mongoose schema errors for robust data handling.
Added AI enhancements

