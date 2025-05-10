# Gardinier Backend API

This is the backend API for the Gardinier gardening tracker application. It provides user authentication, profile management, and garden data storage functionality.

## Features

- User authentication (login, register)
- Profile management
- JWT-based authentication
- Role-based access control
- Rate limiting for security

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```
npm install
```

### Development

```
npm run dev
```

This will start the server with nodemon, which will automatically restart when changes are detected.

### Production

```
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/user` - Get current user information

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/settings` - Update user settings
- `PUT /api/users/password` - Change password

## Test User

For development and testing purposes, a default user is automatically created:
- Username: trav
- Password: hamster

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=7d
NODE_ENV=development
``` 