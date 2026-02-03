# AI Voice Reservation System

A voice-powered restaurant reservation system using AI. Supports Bengali (Bangla) speech recognition and natural voice responses.

## Tech Stack

| Component | Technology                            |
| --------- | ------------------------------------- |
| Frontend  | Next.js 15, TypeScript, Tailwind CSS  |
| Backend   | FastAPI, Python                       |
| Database  | MySQL with Prisma ORM                 |
| STT       | Google Cloud Speech-to-Text (Bengali) |
| TTS       | Google Cloud Text-to-Speech (WaveNet) |
| LLM       | OpenAI GPT-4o-mini                    |

---

## 🖥️ Local Development Setup (Windows)

### Prerequisites

- Node.js 18+
- Python 3.10+
- MySQL Server
- Git

### 1. Clone Repository

```bash
git clone https://github.com/heavensarder/ai-voice-reservation.git
cd ai-voice-reservation
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE `ai-voice-reservation`;
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/ai-voice-reservation"
```

Run database migrations:

```bash
npx prisma generate
npx prisma db push
```

### 4. Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Running Locally

**Terminal 1 - Backend:**

```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Access at: `http://localhost:3000`

---

## 🐧 Ubuntu Server Deployment

### Prerequisites

- Ubuntu 20.04+ server
- Node.js 18+
- Python 3.10+
- MySQL Server
- Nginx
- PM2 (for process management)

### 1. System Dependencies

```bash
sudo apt update
sudo apt install -y nodejs npm python3 python3-pip python3-venv mysql-server nginx
sudo npm install -g pm2
```

### 2. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/heavensarder/ai-voice-reservation.git
sudo chown -R $USER:$USER ai-voice-reservation
cd ai-voice-reservation
```

### 3. Database Setup

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE `ai-voice-reservation`;
CREATE USER 'reservation_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON `ai-voice-reservation`.* TO 'reservation_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Frontend Setup

```bash
cd /var/www/ai-voice-reservation/frontend
npm install
```

Create `frontend/.env`:

```env
DATABASE_URL="mysql://reservation_user:YOUR_SECURE_PASSWORD@localhost:3306/ai-voice-reservation"
```

Run migrations and build:

```bash
npx prisma generate
npx prisma db push
npm run build
```

### 5. Backend Setup

```bash
cd /var/www/ai-voice-reservation/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 6. Start Services with PM2

**Backend:**

```bash
cd /var/www/ai-voice-reservation/backend
pm2 start "source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000" --name "reservation-backend"
```

**Frontend:**

```bash
cd /var/www/ai-voice-reservation/frontend
pm2 start npm --name "reservation-frontend" -- start
```

Save PM2 config:

```bash
pm2 save
pm2 startup
```

### 7. Nginx Configuration

Create `/etc/nginx/sites-available/ai-reservation`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/ai-reservation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL with Certbot (Optional)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## ⚙️ API Configuration

After deployment, access the Admin Dashboard at `/admin` and configure:

1. **OpenAI API Key** - For GPT-4o-mini (AI brain)
2. **Google Cloud Credentials** - For Speech-to-Text and Text-to-Speech
3. **System Prompt** - AI behavior instructions

### Getting Google Cloud Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable APIs:
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
4. Create Service Account → Generate JSON key
5. Paste JSON content in Admin Dashboard

---

## 📁 Project Structure

```
ai-voice-reservation/
├── frontend/           # Next.js application
│   ├── app/           # Pages and routes
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   └── prisma/        # Database schema
├── backend/           # FastAPI application
│   ├── main.py        # WebSocket endpoint
│   └── services/      # STT, TTS, LLM services
└── README.md
```

---

## Features

- 🎤 **Voice Interaction** - Speak in Bengali/Bangla
- 🤖 **AI Conversation** - Natural language understanding
- 📅 **Reservation Logic** - Collects Name, Phone, Date, Time, Guests
- 💾 **Database Storage** - Saves to MySQL upon confirmation
- 🔊 **Natural Voice** - WaveNet Bengali voice responses
