# VidyaSetu 🎓

VidyaSetu is your all-in-one study companion designed to help students excel academically. Set goals, track progress, earn rewards, stay organized with personalized timetables, and collaborate with peers.

## Features

### 📚 Core Features
- **Personal Timetable** - Create and manage personalized study schedules
- **Assignment Tracking** - Submit, track, and manage assignments with deadline reminders
- **Result Management** - View and submit exam results with performance analytics
- **Real-time Chat** - Collaborate with classmates through real-time messaging
- **Leaderboard System** - Gamified learning with points and rankings
- **Attendance Tracking** - Monitor and manage class attendance records

### 🎯 Additional Features
- **Dark Mode Support** - Eye-friendly dark theme option
- **Personalized Dashboard** - View all important information at a glance

## Tech Stack

### Frontend
- **Framework**: React 18.3
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS, Bootstrap 5
- **Build Tool**: Vite
- **Charts**: Chart.js, React ChartJS 2
- **UI Components**: React Bootstrap
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Google OAuth, bcryptjs
- **File Upload**: Cloudinary + Multer
- **Real-time Communication**: Socket.io
- **Email**: Nodemailer
- **Validation**: Express Validator
- **PDF Generation**: PDFKit

## Project Structure

```
VidyaSetu/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components
│   │   ├── store/              # Redux store configuration
│   │   ├── service/            # API service layer
│   │   └── assets/             # Static assets
│   ├── vite.config.js          # Vite configuration
│   └── tailwind.config.js      # Tailwind CSS config
│
├── backend/                     # Node.js/Express backend
│   ├── index.js                # Entry point
│   ├── config/                 # Configuration files
│   │   ├── db.js              # Database configuration
│   │   ├── cloudinary.js      # Cloudinary setup
│   │   ├── secret.js          # Secrets management
│   │   └── socket.js          # Socket.io setup
│   ├── controller/             # Route controllers
│   ├── models/                 # MongoDB schemas
│   ├── middlewares/            # Express middlewares
│   ├── Routers/                # Route definitions
│   └── public/                 # Static files
│
└── package.json               # Root package configuration
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account (for file uploads)
- Google OAuth credentials (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/apmkush/VidyaSetu.git
   cd VidyaSetu
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend Setup**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GMAIL_USER=your_gmail_address
   GMAIL_PASSWORD=your_app_password
   ```

2. **Frontend Setup**
   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

### Running the Application

#### Development Mode

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on `http://localhost:5000`

2. **Start Frontend Development Server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Application runs on `http://localhost:5173`

#### Production Mode

**Backend**
```bash
cd backend
npm start
```

**Frontend**
```bash
cd frontend
npm run build
npm run preview
```

## Available Scripts

### Backend
- `npm run dev` - Start development server with auto-reload (nodemon)
- `npm start` - Start production server
- `npm test` - Run tests (not yet configured)

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google-login` - Google OAuth login


### Assignments
- `GET /api/assignments` - Fetch all assignments
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/:id` - Update assignment
- `POST /api/assignments/:id/submit` - Submit assignment

### Results
- `GET /api/results` - Fetch user results
- `POST /api/results` - Submit result
- `GET /api/results/analytics` - Get result analytics


### Leaderboard
- `GET /api/leaderboard` - Get leaderboard rankings


### Messages
- `GET /api/messages` - Fetch messages
- `POST /api/messages` - Send message

### Attendance
- `GET /api/attendance` - Fetch attendance records
- `POST /api/attendance` - Mark attendance


## Author

- **Anupam Kushwaha** - Initial development

---

**Happy Learning with VidyaSetu!** 🚀
