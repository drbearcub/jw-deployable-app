# Instructor Deployments

A full-stack web application for deploying and managing Jill Watson AI teaching assistants across multiple courses and platforms.

## Features

- 🔐 JWT-based authentication system
- 📚 Course configuration and management
- 📄 PDF document upload and processing
- 🤖 Automated Jill Watson deployment
- 🔌 Multiple LMS plugin support (Canvas, EdStem, VERA, etc.)
- 📅 Term-based course organization
- 🏢 Multi-organization support

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.9
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt
- **UI Components**: shadcn/ui

## Prerequisites

- Node.js (v14 or higher)
- Python 3.9
- MongoDB
- pip and npm/yarn

## Quick Start

1. Clone the repository:

```bash
git clone https://github.gatech.edu/Dilab/Instructor_Deployable_JW.git
cd Instructor_Deployable_JW
```

2. Install dependencies:

```bash
npm install
# make sure correct python is being used first by setting up conda env
pip install -r requirements.txt
```

3. Configure environment variables:

```bash
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
```

4. Start the development server:

```bash
npm run dev
```

This starts both Next.js (port 3000) and FastAPI (port 8000).

## Course Configuration

Courses can be configured with:

- Course name and number
- Term/semester
- Organization
- Start/end dates
- LMS plugin type
- Course documents (PDFs)

Supported LMS plugins:
- CanvasLTI
- VERA
- EdStem
- Blackboard
- CommandLine

## API Endpoints

Go to `http://localhost:8000/docs` to see the API documentation and playground.

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### Course Management
- `GET /user-configs` - List courses
- `POST /create-config` - Create course
- `POST /add-documents/{configId}` - Add documents
- `POST /deactivate-config/{configId}` - Deactivate course


## Development

The project uses:
- TypeScript for type safety
- FastAPI for API development
- MongoDB with Motor for async database operations
- JWT tokens for authentication
- YAML for configuration management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Project Structure

```
├── app/ # Next.js pages and components
├── api/ # FastAPI backend
├── components/ # Reusable React components
├── lib/ # Utility functions and types
├── hooks/ # Custom React hooks
└── public/ # Static assets
```
# jw-deployable-app
