# AI Voice Reservation System

## Setup

1. **Frontend**
   ```bash
   cd frontend
   npm install
   npx prisma generate
   npx prisma db push
   ```
   Create `.env` in `frontend/`:
   ```
   DATABASE_URL="mysql://root:blank@localhost:3306/ai-voice-reservation"
   ```

2. **Backend**
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
   Create `.env` in `backend/`:
   ```
   OPENAI_API_KEY="sk-..."
   GOOGLE_TTS_CREDENTIALS="..." # Or use GOOGLE_APPLICATION_CREDENTIALS path
   ```

## Running

1. **Start Backend**
   ```bash
   cd backend
   .\venv\Scripts\activate
   uvicorn main:app --reload
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## Features
- **Voice Interaction**: Speak in Bangla.
- **Reservation Logic**: Collects Name, Phone, Date, Time, People.
- **Persistence**: Saves to MySQL Database upon confirmation.
