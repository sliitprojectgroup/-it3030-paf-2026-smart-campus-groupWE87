# Smart Campus Operations Hub web site


A comprehensive platform to manage academic resources, facilitate seamless bookings, track IT/maintenance tickets, and manage notifications in a university campus setting.

## Features

- **Resource Management**: Manage spaces, labs, and equipment effectively. Admin operations support full CRUD actions.
- **Booking Hub**: Enable users to browse and book campus resources seamlessly.
- **Ticketing System**: Submit and track issues around the campus.
- **Notifications**: Stay updated with real-time operation statuses and updates.
- **Admin Operations**: Allow campus administrators to approve/reject bookings, manage resources, and oversee overall operations health.

## Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **HTTP Client**: Axios

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 21
- **ORM**: Spring Data JPA
- **Database**: MySQL

## Project Structure

- `frontend/` - Contains the React client application.
- `backend/` - Contains the RESTful Spring Boot application.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Java 21](https://jdk.java.net/21/)
- [Maven](https://maven.apache.org/)
- [MySQL](https://www.mysql.com/)

### Backend Setup

1. Configure your MySQL database. Create a schema for the platform (e.g. `smartcampus`).
2. Navigate to the `backend` directory.
3. Verify `src/main/resources/application.properties` to ensure your database credentials match your local MySQL configuration.
4. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup

1. Navigate to the `frontend` directory.
2. Install the JavaScript dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will typically run at `http://localhost:5173`.

## Additional Documentation

For a detailed walkthrough of the backend API capabilities, refer to the [BACKEND_API_DOCUMENTATION.md](./BACKEND_API_DOCUMENTATION.md) included in the root of the repository.
