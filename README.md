# Gardinier - Gardening Tracker Application

A comprehensive gardening tracker app to help users manage their gardening activities, track plant growth, and record observations.

## Features

- **User Management:** Registration, login, profile management
- **Garden Planning:** Visual garden layout, plant database
- **Activity Tracking:** Journal entries, tasks, photo uploads
- **Notes and Search:** Rich text notes, tagging, search functionality
- **Analytics:** Harvest tracking, growth timeline, season comparison

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/your-username/gardinier.git
cd gardinier
```

2. Install server dependencies
```
cd server
npm install
```

3. Install client dependencies
```
cd ../client
npm install
```

### Development

To run both the client and server concurrently (in two separate terminal windows):

#### Terminal 1 - Start the server:
```
cd server
npm run dev
```

#### Terminal 2 - Start the client:
```
cd client
npm start
```

Then open your browser and navigate to http://localhost:3000

## Testing

For testing purposes, a default user has been created:
- Username: trav
- Password: hamster

You can use these credentials to log in immediately without registering.

## Tech Stack

### Frontend
- React.js
- React Router
- Axios

### Backend
- Node.js
- Express
- JWT Authentication
- MongoDB (configured but using in-memory storage for now)

## Project Structure

```
gardinier/
├── client/              # React frontend
│   ├── public/          # Static files
│   └── src/             # React components and logic
│       ├── components/  # Reusable components
│       ├── pages/       # Page components
│       ├── services/    # API service calls
│       └── utils/       # Utility functions
│
├── server/              # Node.js backend
│   ├── src/             # Server source code
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Custom middleware
│   │   ├── models/      # Data models
│   │   ├── routes/      # API routes
│   │   └── utils/       # Utility functions
│   └── .env             # Environment variables
│
└── README.md            # Project documentation
```

## Implementation Notes

### Authentication
- The system currently uses hardcoded users for testing purposes
- JWT tokens are used for authentication
- Sessions will time out after inactivity

### Security
- Password hashing using bcrypt
- Rate limiting for protection against brute force attacks
- CORS protection

## Next Steps

1. Implement garden planning interface
2. Add plant database and plant tracking
3. Create activity and task management system
4. Develop notes and search functionality 