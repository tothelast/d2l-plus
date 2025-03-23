# D2L Plus Learning Platform

An upgrade to the existing D2l - modern learning management system used for univeristy of Arizona course managment. The project is built on AWS serverless architecture. D2L Plus provides a comprehensive suite of features, including course management, enrollment, assignments, grades, and AI-powered learning assistance.

## Features

-   **User Authentication**: Secure registration, login, and password management
-   **Course Management**: Create, update, view, and delete courses
-   **Professor Management**: Manage professor profiles and course assignments
-   **Student Enrollment**: Enroll and manage students in courses
-   **Assignments**: Create, submit, and grade assignments
-   **Announcements**: Course-wide communication
-   **Grades**: Comprehensive grade tracking and reporting
-   **Course & Professor Rankings**: Feedback and evaluation system
-   **AI Assistant**: Advanced AI-powered learning assistance using AWS Bedrock

## Technology Stack

-   **Backend**: Node.js on AWS Lambda
-   **Authentication**: Amazon Cognito
-   **Database**: Amazon DynamoDB
-   **API**: Amazon API Gateway with API key authentication
-   **AI Services**: Amazon Bedrock
-   **Infrastructure**: AWS Serverless Framework
-   **Language**: TypeScript

## Getting Started

### Prerequisites

-   Node.js (v18+)
-   AWS CLI configured with appropriate credentials
-   Serverless Framework

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/d2l-plus.git
cd d2l-plus
```

2. Install dependencies

```bash
npm install
```

3. Deploy the application

```bash
npm run deploy
```

## Project Structure

-   `/src`: Source code
    -   `/handlers`: API Lambda handlers organized by resource
    -   `/utils`: Utility functions
    -   `/types`: TypeScript type definitions
-   `/scripts`: Deployment and utility scripts

## API Endpoints

### Authentication

-   POST `/auth/register`: Register a new user
-   POST `/auth/login`: User login
-   POST `/auth/verify`: Verify user
-   POST `/auth/forgot-password`: Request password reset
-   POST `/auth/reset-password`: Reset password

### Courses

-   GET `/courses`: List all courses
-   POST `/courses`: Create a new course
-   GET `/courses/{id}`: Get course details
-   PUT `/courses/{id}`: Update a course
-   DELETE `/courses/{id}`: Delete a course
-   GET `/courses/professor/{professorId}`: Get courses by professor

### Enrollments, Assignments, Grades, etc.

-   Various endpoints for managing enrollments, assignments, grades, announcements, and other educational resources

