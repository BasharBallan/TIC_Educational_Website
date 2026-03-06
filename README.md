# 🎓 TIC Educational Website

A robust and feature-rich educational platform built with Node.js and Express, designed to provide an engaging learning experience with secure authentication, content management, and e-commerce capabilities.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license/None-red)
![Stars](https://img.shields.io/github/stars/BasharBallan/TIC_Educational_Website?style=social)
![Forks](https://img.shields.io/github/forks/BasharBallan/TIC_Educational_Website?style=social)


## ✨ Features

*   🔐 **Secure User Authentication & Authorization:** Implement robust user management with JWT-based authentication and role-based authorization using `bcryptjs` and `jsonwebtoken`.
*   📚 **Dynamic Content Management:** Easily create, update, and manage educational courses and materials with `mongoose` for data persistence.
*   📧 **Automated Email Notifications:** Send transactional emails, password resets, and course updates using `nodemailer`.
*   🖼️ **Image Upload & Optimization:** Efficiently manage and optimize course images and user avatars with `multer` and `sharp`.
*   🌐 **API Documentation with Swagger:** Explore and interact with the API endpoints through interactive `Swagger` documentation.

## 🚀 Installation Guide

Follow these steps to get your development environment set up and running.

### Prerequisites

Ensure you have the following installed:

*   Node.js (LTS version recommended)
*   npm (comes with Node.js) or Yarn
*   MongoDB (local or cloud instance like MongoDB Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/BasharBallan/TIC_Educational_Website.git
cd TIC_Educational_Website
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using Yarn:

```bash
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory of the project based on the `config/config.env` example. This file will store your sensitive environment variables.

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
BASE_URL=http://localhost:5000
```

**Note:** Replace placeholder values with your actual credentials and settings.

### 4. Start the Server

Once dependencies are installed and `.env` is configured, you can start the development server:

```bash
npm run dev
```

The server will typically run on `http://localhost:5000` (or your specified `PORT`).

## 💡 Usage Examples

### Accessing the API

The API will be available at your configured `BASE_URL`. For example, if running locally:

```
http://localhost:5000/api/v1/users
```

### API Documentation

Explore all available API endpoints and their functionalities using Swagger UI:

```
http://localhost:5000/api-docs
```

### Example: Registering a New User

You can use a tool like Postman or Insomnia to send a POST request to the registration endpoint.

**Request URL:** `POST http://localhost:5000/api/v1/auth/signup`

**Request Body (JSON):**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "role": "user"
}
```

### Example: Fetching Subjects

**Request URL:** `GET http://localhost:5000/api/v1/subjects`

This will return a list of all Subjects. You can add query parameters for filtering, sorting, and pagination.

## 🗺️ Project Roadmap

The TIC Educational Website is continuously evolving. Here's a glimpse of what's planned:

*   **V1.1 - Instructor Dashboard:** Develop a dedicated dashboard for instructors to manage their courses, view student progress, and communicate.
*   **V1.2 - Interactive Quizzes & Assessments:** Integrate interactive quizzes, assignments, and progress tracking for students.
*   **V1.3 - Real-time Chat/Forum:** Implement a communication feature for students and instructors within courses.
*   **V1.4 - Advanced Search & Filtering:** Enhance search capabilities with more refined filters and categories for courses.
*   **V1.5 - Multi-language Support Expansion:** Expand `i18n` to cover all user-facing content and administrative interfaces.

## 🤝 Contribution Guidelines

We welcome contributions to the TIC Educational Website! To ensure a smooth collaboration, please follow these guidelines:

### Code Style

*   Adhere to the ESLint configuration (`.eslintrc.json`) provided in the project.
*   Use consistent formatting and naming conventions.

### Branch Naming Conventions

*   Use descriptive branch names, typically following a `feature/`, `bugfix/`, or `refactor/` prefix.
    *   Example: `feature/add-instructor-dashboard`, `bugfix/fix-payment-issue`, `refactor/improve-auth-middleware`

### Pull Request Process

1.  Fork the repository and create your branch from `main`.
2.  Ensure your code adheres to the project's code style.
3.  Write clear, concise commit messages.
4.  Before submitting a Pull Request (PR), ensure all tests pass.
5.  Provide a detailed description of your changes in the PR, explaining what problem it solves and how it was implemented.
6.  Link any relevant issues in your PR description.

### Testing Requirements

*   All new features should be accompanied by appropriate unit and/or integration tests.
*   Ensure existing tests pass before submitting a PR.
*   Strive for good test coverage for your changes.

## 📄 License Information

This project is currently **unlicensed**. This means that by default, all rights are reserved by the copyright holder(s) (BasharBallan). Users are not permitted to distribute, modify, or use the code for commercial purposes without explicit permission.

For inquiries regarding licensing or usage, please contact the main contributor.

---
