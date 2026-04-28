# 🏫 Smart Campus Operations Hub — Backend API Documentation

> **Project**: Smart Campus Operations Hub  
> **University**: SLIIT  
> **Backend Framework**: Spring Boot (Java 21)  
> **Database**: MySQL  
> **Base URL**: `http://localhost:8085`  
> **CORS**: Enabled for all origins (`@CrossOrigin(origins = "*")`)  
> **Date Generated**: April 2026

---

## 📖 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Project Structure (File Tree)](#3-project-structure-file-tree)
4. [Database Schema](#4-database-schema)
5. [Module 1 — Resource Management](#5-module-1--resource-management)
6. [Module 2 — Booking System (Main Module)](#6-module-2--booking-system-main-module)
7. [Module 3 — Ticket System](#7-module-3--ticket-system)
8. [Module 4 — Notification System](#8-module-4--notification-system)
9. [Error Handling & Response Format](#9-error-handling--response-format)
10. [Authentication Model (Simplified)](#10-authentication-model-simplified)
11. [Complete API Reference Table](#11-complete-api-reference-table)
12. [Frontend Integration Guide](#12-frontend-integration-guide)
13. [How to Run the Backend](#13-how-to-run-the-backend)

---

## 1. Project Overview

The **Smart Campus Operations Hub** is a university campus management system that allows students and staff to manage campus resources (rooms, labs, equipment), create bookings for those resources, raise support tickets, and receive notifications about booking status changes.

### What Is Implemented

| Module | Status | Complexity | Description |
|--------|--------|------------|-------------|
| **Resource** | ✅ Complete | Minimal | CRUD for campus resources (rooms, labs, etc.) |
| **Booking** | ✅ Complete | Full | Booking with conflict detection, approval workflow |
| **Ticket** | ✅ Complete | Basic | Issue reporting for resources |
| **Notification** | ✅ Complete | Simple | Console-based notification on booking status changes |
| **Auth** | ⚠️ Simplified | N/A | No OAuth — `userId` is passed in request body |

### What Is NOT Implemented (Frontend Must Handle)

- User registration / login UI (no auth backend — frontend manages user identity)
- Role-based UI switching (USER vs ADMIN) — backend does not enforce roles via security
- Real-time notifications (backend only prints to console)
- Dashboard analytics / statistics
- Resource filtering / search

---

## 2. Architecture & Tech Stack

### Tech Stack

| Technology | Purpose |
|------------|---------|
| Java 21 | Programming language |
| Spring Boot 4.1.x | Backend framework |
| Spring Web | REST API controllers |
| Spring Data JPA | Database access (ORM) |
| Hibernate | JPA implementation |
| MySQL | Relational database |
| Lombok | Reduces boilerplate (getters, setters, constructors) |
| Maven | Build tool / dependency management |

### Layered Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                  │
│              React / Angular / Vue / etc.             │
└───────────────────────┬──────────────────────────────┘
                        │ HTTP (JSON)
                        ▼
┌──────────────────────────────────────────────────────┐
│               CONTROLLER LAYER                       │
│   ResourceController, BookingController,             │
│   TicketController                                   │
│   • Receives HTTP requests                           │
│   • Returns ResponseEntity with proper HTTP codes    │
│   • @CrossOrigin enabled for frontend                │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│                SERVICE LAYER                         │
│   ResourceService, BookingService,                   │
│   TicketService, NotificationService                 │
│   • Business logic lives here                        │
│   • Booking conflict detection                       │
│   • Status workflow management                       │
│   • Notification triggers                            │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│              REPOSITORY LAYER                        │
│   ResourceRepository, BookingRepository,             │
│   TicketRepository                                   │
│   • JPA interfaces extending JpaRepository           │
│   • Custom JPQL queries (conflict detection)         │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│                 MySQL DATABASE                       │
│   Tables: resources, bookings, tickets               │
│   Auto-created via hibernate ddl-auto=update         │
└──────────────────────────────────────────────────────┘
```

---

## 3. Project Structure (File Tree)

```
src/main/java/com/sliit/paf/
│
├── PafApplication.java                    # Spring Boot entry point
│
├── controller/
│   ├── ResourceController.java            # REST endpoints for resources
│   ├── BookingController.java             # REST endpoints for bookings
│   └── TicketController.java              # REST endpoints for tickets
│
├── service/
│   ├── ResourceService.java               # Resource business logic
│   ├── BookingService.java                # Booking logic + conflict detection
│   ├── TicketService.java                 # Ticket business logic
│   └── NotificationService.java           # Console notification service
│
├── repository/
│   ├── ResourceRepository.java            # JPA repo for Resource entity
│   ├── BookingRepository.java             # JPA repo + custom conflict query
│   └── TicketRepository.java              # JPA repo for Ticket entity
│
├── model/
│   ├── Resource.java                      # Resource JPA entity
│   ├── Booking.java                       # Booking JPA entity
│   └── Ticket.java                        # Ticket JPA entity
│
└── exception/
    ├── GlobalExceptionHandler.java        # Centralized error handling
    ├── ResourceNotFoundException.java     # 404 exception
    ├── ConflictException.java             # 409 exception
    └── ErrorResponse.java                 # Standard error JSON structure
```

---

## 4. Database Schema

The database `smart_campus` is auto-created. All tables below are auto-generated by Hibernate.

### Table: `resources`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Name of the resource (e.g., "Lecture Hall A") |
| `type` | VARCHAR(255) | NOT NULL | Type of resource (e.g., "ROOM", "LAB", "EQUIPMENT") |
| `capacity` | INT | NOT NULL | Max capacity/count |
| `status` | VARCHAR(255) | NOT NULL | `ACTIVE` or `OUT_OF_SERVICE` |

### Table: `bookings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `user_id` | BIGINT | NOT NULL | ID of the user who created the booking |
| `resource_id` | BIGINT | NOT NULL | ID of the resource being booked |
| `date` | DATE | NOT NULL | Booking date (e.g., `2026-04-20`) |
| `start_time` | TIME | NOT NULL | Start time (e.g., `09:00`) |
| `end_time` | TIME | NOT NULL | End time (e.g., `11:00`) |
| `purpose` | VARCHAR(255) | NOT NULL | Purpose of the booking |
| `attendees` | INT | NOT NULL | Number of attendees |
| `status` | VARCHAR(255) | NOT NULL | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |
| `admin_reason` | VARCHAR(255) | NULLABLE | Reason given by admin for rejection |

### Table: `tickets`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `resource_id` | BIGINT | NOT NULL | ID of the resource the ticket is about |
| `description` | VARCHAR(255) | NOT NULL | Description of the issue |
| `status` | VARCHAR(255) | NOT NULL | `OPEN`, `IN_PROGRESS`, `RESOLVED` |

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│   Resource   │◄────────│     Booking      │         │    Ticket    │
├──────────────┤  ref by ├──────────────────┤         ├──────────────┤
│ id (PK)      │ resourceId│ id (PK)         │         │ id (PK)      │
│ name         │         │ userId           │         │ resourceId   │──► references Resource
│ type         │         │ resourceId       │         │ description  │
│ capacity     │         │ date             │         │ status       │
│ status       │         │ startTime        │         └──────────────┘
└──────────────┘         │ endTime          │
                         │ purpose          │
                         │ attendees        │
                         │ status           │
                         │ adminReason      │
                         └──────────────────┘
```

> **Note**: The relationships between entities are logical (by ID reference), not enforced with `@ManyToOne` JPA relationships. The `resourceId` field in `Booking` and `Ticket` is a plain `Long`, not a foreign key relationship. The `userId` in `Booking` references an external user concept (no User entity exists in the backend).

---

## 5. Module 1 — Resource Management

### Purpose
Manages campus resources such as lecture halls, labs, seminar rooms, and equipment. Resources must exist before bookings can be created against them.

### Entity: Resource

```json
{
  "id": 1,
  "name": "Lecture Hall A",
  "type": "ROOM",
  "capacity": 200,
  "status": "ACTIVE"
}
```

### Status Values

| Status | Meaning |
|--------|---------|
| `ACTIVE` | Resource is available for booking |
| `OUT_OF_SERVICE` | Resource is unavailable — bookings will be rejected |

### API Endpoints

---

#### 5.1 GET `/api/resources` — Get All Resources

**Description**: Returns a list of all campus resources.

**Request**: No body required.

**Response** `200 OK`:
```json
[
  {
    "id": 1,
    "name": "Lecture Hall A",
    "type": "ROOM",
    "capacity": 200,
    "status": "ACTIVE"
  },
  {
    "id": 2,
    "name": "Computer Lab 3",
    "type": "LAB",
    "capacity": 40,
    "status": "ACTIVE"
  }
]
```

**Frontend Usage**: Resource listing page, dropdown selectors in booking forms.

---

#### 5.2 GET `/api/resources/{id}` — Get Resource by ID

**Description**: Returns a single resource by its ID.

**Path Parameter**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Long | Yes | Resource ID |

**Response** `200 OK`:
```json
{
  "id": 1,
  "name": "Lecture Hall A",
  "type": "ROOM",
  "capacity": 200,
  "status": "ACTIVE"
}
```

**Response** `404 Not Found`:
```json
{
  "timestamp": "2026-04-17T14:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found with ID: 99",
  "path": "/api/resources/99"
}
```

**Frontend Usage**: Resource detail page, booking form pre-population.

---

#### 5.3 POST `/api/resources` — Create a New Resource

**Description**: Creates a new campus resource. Typically used by admins.

**Request Body**:
```json
{
  "name": "Seminar Room B",
  "type": "ROOM",
  "capacity": 50,
  "status": "ACTIVE"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Resource name |
| `type` | String | Yes | Resource type (e.g., ROOM, LAB, EQUIPMENT) |
| `capacity` | int | Yes | Maximum capacity |
| `status` | String | Yes | Must be `ACTIVE` or `OUT_OF_SERVICE` |

**Response** `201 Created`:
```json
{
  "id": 3,
  "name": "Seminar Room B",
  "type": "ROOM",
  "capacity": 50,
  "status": "ACTIVE"
}
```

**Frontend Usage**: Admin resource creation form.

---

## 6. Module 2 — Booking System (Main Module)

### Purpose
This is the **core module** of the project. It handles the complete booking lifecycle — creation with conflict detection, approval/rejection workflow by admins, and cancellation by users.

### Entity: Booking

```json
{
  "id": 1,
  "userId": 101,
  "resourceId": 1,
  "date": "2026-04-20",
  "startTime": "09:00:00",
  "endTime": "11:00:00",
  "purpose": "Database Lecture",
  "attendees": 150,
  "status": "PENDING",
  "adminReason": null
}
```

### Status Values & Workflow

| Status | Meaning | Set By |
|--------|---------|--------|
| `PENDING` | Booking created, awaiting admin review | System (auto on create) |
| `APPROVED` | Admin approved the booking | Admin (via approve endpoint) |
| `REJECTED` | Admin rejected the booking | Admin (via reject endpoint) |
| `CANCELLED` | User cancelled their booking | User (via cancel endpoint) |

### Status Flow Diagram

```
                    ┌─────────────┐
   User creates     │             │
   booking ────────►│   PENDING   │
                    │             │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌───────────┐ ┌──────────┐ ┌───────────┐
       │ APPROVED  │ │ REJECTED │ │ CANCELLED │
       │           │ │          │ │           │
       └───────────┘ └──────────┘ └───────────┘
        (by Admin)   (by Admin)    (by User)
              │            │
              ▼            ▼
        Notification  Notification
        sent          sent (with reason)
```

### Business Logic (Implemented in BookingService)

1. **On Create (`POST /api/bookings`)**:
   - Status is automatically set to `PENDING` (any status sent by frontend is overridden)
   - Validates that the `resourceId` refers to an existing resource
   - Validates that the resource status is `ACTIVE` (rejects if `OUT_OF_SERVICE`)
   - Checks for time slot conflicts: no overlapping bookings for the same resource on the same date where the time ranges intersect
   - Conflict detection only considers bookings with status `PENDING` or `APPROVED` (rejected/cancelled bookings are ignored)

2. **On Approve (`PUT /api/bookings/{id}/approve`)**:
   - Changes status to `APPROVED`
   - Triggers notification: `"Your booking (ID: X) has been APPROVED."`

3. **On Reject (`PUT /api/bookings/{id}/reject?reason=...`)**:
   - Changes status to `REJECTED`
   - Stores the admin's reason in `adminReason` field
   - Triggers notification: `"Your booking (ID: X) has been REJECTED. Reason: ..."`

4. **On Cancel (`PUT /api/bookings/{id}/cancel`)**:
   - Changes status to `CANCELLED`
   - No notification sent

### Time Conflict Detection Logic

The backend uses the following JPQL query to detect overlapping time slots:

```sql
SELECT COUNT(b) > 0 FROM Booking b
WHERE b.resourceId = :resourceId
  AND b.date = :date
  AND b.status IN ('PENDING', 'APPROVED')
  AND (b.startTime < :endTime AND b.endTime > :startTime)
```

**How it works**: Two time ranges overlap if `start1 < end2 AND end1 > start2`. This means:
- Booking 09:00–11:00 conflicts with 10:00–12:00 ✅ (overlap 10:00–11:00)
- Booking 09:00–11:00 conflicts with 11:00–13:00 ❌ (no overlap — adjacent is fine)
- Booking 09:00–11:00 conflicts with 08:00–10:00 ✅ (overlap 09:00–10:00)

### API Endpoints

---

#### 6.1 POST `/api/bookings` — Create a Booking

**Description**: Creates a new booking request. Status is auto-set to `PENDING`.

**Request Body**:
```json
{
  "userId": 101,
  "resourceId": 1,
  "date": "2026-04-20",
  "startTime": "09:00:00",
  "endTime": "11:00:00",
  "purpose": "Database Systems Lecture",
  "attendees": 150
}
```

| Field | Type | Required | Format | Description |
|-------|------|----------|--------|-------------|
| `userId` | Long | Yes | — | ID of the user creating the booking |
| `resourceId` | Long | Yes | — | ID of the resource to book |
| `date` | String | Yes | `YYYY-MM-DD` | Booking date |
| `startTime` | String | Yes | `HH:mm:ss` | Start time |
| `endTime` | String | Yes | `HH:mm:ss` | End time |
| `purpose` | String | Yes | — | Purpose of the booking |
| `attendees` | int | Yes | — | Number of attendees |

> **Note**: Do NOT send `status` or `adminReason` in the create request. The backend ignores/overrides `status` and sets it to `PENDING`.

**Response** `201 Created`:
```json
{
  "id": 1,
  "userId": 101,
  "resourceId": 1,
  "date": "2026-04-20",
  "startTime": "09:00:00",
  "endTime": "11:00:00",
  "purpose": "Database Systems Lecture",
  "attendees": 150,
  "status": "PENDING",
  "adminReason": null
}
```

**Error Responses**:

`404 Not Found` — Resource does not exist:
```json
{
  "timestamp": "2026-04-17T14:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found",
  "path": "/api/bookings"
}
```

`409 Conflict` — Resource is out of service:
```json
{
  "timestamp": "2026-04-17T14:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Resource is currently OUT_OF_SERVICE",
  "path": "/api/bookings"
}
```

`409 Conflict` — Time slot already booked:
```json
{
  "timestamp": "2026-04-17T14:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Time slot already booked",
  "path": "/api/bookings"
}
```

**Frontend Usage**: Booking creation form. Display appropriate error toasts/alerts on 409 responses.

---

#### 6.2 GET `/api/bookings` — Get All Bookings

**Description**: Returns all bookings in the system. Used by admin dashboards.

**Response** `200 OK`:
```json
[
  {
    "id": 1,
    "userId": 101,
    "resourceId": 1,
    "date": "2026-04-20",
    "startTime": "09:00:00",
    "endTime": "11:00:00",
    "purpose": "Database Systems Lecture",
    "attendees": 150,
    "status": "PENDING",
    "adminReason": null
  },
  {
    "id": 2,
    "userId": 102,
    "resourceId": 2,
    "date": "2026-04-21",
    "startTime": "14:00:00",
    "endTime": "16:00:00",
    "purpose": "Software Engineering Workshop",
    "attendees": 35,
    "status": "APPROVED",
    "adminReason": null
  }
]
```

**Frontend Usage**: Admin booking management dashboard showing all bookings with status filtering.

---

#### 6.3 GET `/api/bookings/user/{userId}` — Get Bookings by User

**Description**: Returns all bookings for a specific user.

**Path Parameter**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | Long | Yes | The user's ID |

**Response** `200 OK`:
```json
[
  {
    "id": 1,
    "userId": 101,
    "resourceId": 1,
    "date": "2026-04-20",
    "startTime": "09:00:00",
    "endTime": "11:00:00",
    "purpose": "Database Systems Lecture",
    "attendees": 150,
    "status": "PENDING",
    "adminReason": null
  }
]
```

**Frontend Usage**: User's "My Bookings" page.

---

#### 6.4 PUT `/api/bookings/{id}/approve` — Approve a Booking

**Description**: Admin approves a pending booking. Triggers a notification.

**Path Parameter**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Long | Yes | Booking ID |

**Request Body**: None required.

**Response** `200 OK`:
```json
{
  "id": 1,
  "userId": 101,
  "resourceId": 1,
  "date": "2026-04-20",
  "startTime": "09:00:00",
  "endTime": "11:00:00",
  "purpose": "Database Systems Lecture",
  "attendees": 150,
  "status": "APPROVED",
  "adminReason": null
}
```

**Error** `404 Not Found` — Booking not found.

**Frontend Usage**: Admin dashboard "Approve" button on pending booking cards/rows.

---

#### 6.5 PUT `/api/bookings/{id}/reject?reason=...` — Reject a Booking

**Description**: Admin rejects a booking with an optional reason. Triggers a notification.

**Path Parameter**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Long | Yes | Booking ID |

**Query Parameter**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `reason` | String | No | `"No reason provided"` | Rejection reason |

**Example URL**: `PUT /api/bookings/1/reject?reason=Room%20under%20maintenance`

**Request Body**: None required.

**Response** `200 OK`:
```json
{
  "id": 1,
  "userId": 101,
  "resourceId": 1,
  "date": "2026-04-20",
  "startTime": "09:00:00",
  "endTime": "11:00:00",
  "purpose": "Database Systems Lecture",
  "attendees": 150,
  "status": "REJECTED",
  "adminReason": "Room under maintenance"
}
```

**Frontend Usage**: Admin dashboard "Reject" button — should open a modal/prompt for the reason, then send it as a query parameter.

---

#### 6.6 PUT `/api/bookings/{id}/cancel` — Cancel a Booking

**Description**: User cancels their own booking.

**Path Parameter**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Long | Yes | Booking ID |

**Request Body**: None required.

**Response** `200 OK`:
```json
{
  "id": 1,
  "userId": 101,
  "resourceId": 1,
  "date": "2026-04-20",
  "startTime": "09:00:00",
  "endTime": "11:00:00",
  "purpose": "Database Systems Lecture",
  "attendees": 150,
  "status": "CANCELLED",
  "adminReason": null
}
```

**Frontend Usage**: "Cancel" button on user's "My Bookings" page — only show for PENDING bookings.

---

## 7. Module 3 — Ticket System

### Purpose
A basic issue-reporting module. Users can report problems with campus resources (e.g., broken projector, AC not working). This is a skeleton module with no complex workflows.

### Entity: Ticket

```json
{
  "id": 1,
  "resourceId": 1,
  "description": "Projector in Lecture Hall A not working",
  "status": "OPEN"
}
```

### Status Values

| Status | Meaning |
|--------|---------|
| `OPEN` | Issue reported, pending review |
| `IN_PROGRESS` | Issue being worked on |
| `RESOLVED` | Issue has been fixed |

> **Note**: There are no API endpoints to change ticket status. The backend auto-sets status to `OPEN` if not provided. Status transitions (`IN_PROGRESS`, `RESOLVED`) would need to be added for a complete workflow.

### API Endpoints

---

#### 7.1 POST `/api/tickets` — Create a Ticket

**Description**: Report an issue with a resource.

**Request Body**:
```json
{
  "resourceId": 1,
  "description": "Projector in Lecture Hall A not working"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resourceId` | Long | Yes | The resource the issue relates to |
| `description` | String | Yes | Description of the problem |
| `status` | String | No | Defaults to `OPEN` if omitted |

**Response** `201 Created`:
```json
{
  "id": 1,
  "resourceId": 1,
  "description": "Projector in Lecture Hall A not working",
  "status": "OPEN"
}
```

**Frontend Usage**: Issue reporting form (accessible from resource detail page or standalone form).

---

#### 7.2 GET `/api/tickets` — Get All Tickets

**Description**: Returns all reported tickets.

**Response** `200 OK`:
```json
[
  {
    "id": 1,
    "resourceId": 1,
    "description": "Projector in Lecture Hall A not working",
    "status": "OPEN"
  },
  {
    "id": 2,
    "resourceId": 2,
    "description": "AC in Computer Lab 3 is leaking",
    "status": "OPEN"
  }
]
```

**Frontend Usage**: Admin ticket management/listing page.

---

## 8. Module 4 — Notification System

### Purpose
A simple notification service that prints messages to the server console. It is automatically triggered by the Booking module when bookings are approved or rejected.

### How It Works

- **Not an API endpoint** — this is a backend-only service
- Called internally by `BookingService` during approve/reject operations
- Currently prints to `System.out` (server console)

### When Notifications Are Triggered

| Event | Message Format |
|-------|----------------|
| Booking approved | `"Your booking (ID: {id}) has been APPROVED."` |
| Booking rejected | `"Your booking (ID: {id}) has been REJECTED. Reason: {reason}"` |
| Booking cancelled | ❌ No notification sent |

### Frontend Consideration

Since notifications are currently console-only, the frontend should:
- Show success/error toasts after approve/reject API calls complete
- Optionally implement a polling mechanism or WebSocket for real-time updates in the future

---

## 9. Error Handling & Response Format

All API errors return a consistent JSON structure via the `GlobalExceptionHandler`.

### Error Response Structure

```json
{
  "timestamp": "2026-04-17T14:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found with ID: 99",
  "path": "/api/resources/99"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | String (ISO DateTime) | When the error occurred |
| `status` | int | HTTP status code |
| `error` | String | HTTP status text |
| `message` | String | Human-readable error description |
| `path` | String | The API path that was called |

### HTTP Status Codes Used

| Code | Meaning | When Used |
|------|---------|-----------|
| `200 OK` | Success | GET, PUT operations |
| `201 Created` | Resource created | POST operations |
| `404 Not Found` | Entity not found | Invalid ID in path |
| `409 Conflict` | Business rule violation | Time slot conflict, resource out of service |
| `500 Internal Server Error` | Unexpected error | Unhandled exceptions |

### Frontend Error Handling Recommendations

```javascript
// Example error handling in frontend (Axios/Fetch)
try {
  const response = await axios.post('/api/bookings', bookingData);
  // Handle success (201)
} catch (error) {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 404:
        showToast('error', data.message); // "Resource not found"
        break;
      case 409:
        showToast('warning', data.message); // "Time slot already booked"
        break;
      default:
        showToast('error', 'Something went wrong');
    }
  }
}
```

---

## 10. Authentication Model (Simplified)

### How It Works

- **No Spring Security** is configured
- **No login/register endpoints** exist
- `userId` is passed directly in the booking request body
- Role concept (USER vs ADMIN) is a **frontend-only concern**

### What the Frontend Must Implement

| Feature | Frontend Responsibility |
|---------|----------------------|
| User identity | Manage locally (localStorage, context, hardcoded for demo) |
| Login/Register UI | Build login form — store userId after "login" |
| Role switching | Show different UI for USER vs ADMIN |
| USER actions | Create bookings, cancel own bookings, raise tickets |
| ADMIN actions | Approve/reject bookings, manage resources, view tickets |

### Suggested Frontend Auth Approach (For Demo)

```javascript
// Simple hardcoded users for demo
const USERS = {
  user: { id: 101, name: "John Student", role: "USER" },
  admin: { id: 1, name: "Admin", role: "ADMIN" }
};

// Store current user in context/state
const [currentUser, setCurrentUser] = useState(USERS.user);

// When creating a booking, use currentUser.id
const bookingData = {
  userId: currentUser.id,
  resourceId: selectedResource,
  // ... rest of fields
};
```

---

## 11. Complete API Reference Table

| # | Method | Endpoint | Description | Request Body | Response Code |
|---|--------|----------|-------------|--------------|---------------|
| 1 | `GET` | `/api/resources` | Get all resources | — | `200` |
| 2 | `GET` | `/api/resources/{id}` | Get resource by ID | — | `200` / `404` |
| 3 | `POST` | `/api/resources` | Create a resource | JSON (Resource) | `201` |
| 4 | `POST` | `/api/bookings` | Create a booking | JSON (Booking) | `201` / `404` / `409` |
| 5 | `GET` | `/api/bookings` | Get all bookings | — | `200` |
| 6 | `GET` | `/api/bookings/user/{userId}` | Get bookings by user | — | `200` |
| 7 | `PUT` | `/api/bookings/{id}/approve` | Approve a booking | — | `200` / `404` |
| 8 | `PUT` | `/api/bookings/{id}/reject?reason=` | Reject a booking | — | `200` / `404` |
| 9 | `PUT` | `/api/bookings/{id}/cancel` | Cancel a booking | — | `200` / `404` |
| 10 | `POST` | `/api/tickets` | Create a ticket | JSON (Ticket) | `201` |
| 11 | `GET` | `/api/tickets` | Get all tickets | — | `200` |

---

## 12. Frontend Integration Guide

### Base Configuration

```javascript
// API base URL
const API_BASE = "http://localhost:8080/api";

// Axios instance (recommended)
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Suggested Frontend Pages & Components

| Page | Route | Role | APIs Used | Description |
|------|-------|------|-----------|-------------|
| **Dashboard** | `/` | Both | GET bookings, GET resources | Overview with stats |
| **Resource List** | `/resources` | Both | GET `/api/resources` | Browse all campus resources |
| **Create Resource** | `/resources/create` | Admin | POST `/api/resources` | Form to add new resource |
| **Create Booking** | `/bookings/create` | User | GET resources + POST booking | Booking form with resource selector, date/time picker |
| **My Bookings** | `/bookings/my` | User | GET `/api/bookings/user/{userId}` | User's bookings with cancel option |
| **All Bookings (Admin)** | `/bookings/manage` | Admin | GET `/api/bookings` | Admin view with approve/reject buttons |
| **Report Issue** | `/tickets/create` | Both | POST `/api/tickets` | Form to report resource issues |
| **Ticket List** | `/tickets` | Admin | GET `/api/tickets` | View all reported issues |

### Date/Time Format Requirements

When sending dates and times to the backend, use these exact formats:

| Field | Format | Example |
|-------|--------|---------|
| `date` | `YYYY-MM-DD` | `"2026-04-20"` |
| `startTime` | `HH:mm:ss` | `"09:00:00"` |
| `endTime` | `HH:mm:ss` | `"11:00:00"` |

### Sample API Calls (JavaScript)

```javascript
// ── RESOURCES ───────────────────────────────────────

// Get all resources
const resources = await api.get('/resources');

// Get single resource
const resource = await api.get('/resources/1');

// Create resource (Admin)
const newResource = await api.post('/resources', {
  name: "Seminar Room B",
  type: "ROOM",
  capacity: 50,
  status: "ACTIVE"
});

// ── BOOKINGS ────────────────────────────────────────

// Create booking (User)
const newBooking = await api.post('/bookings', {
  userId: 101,
  resourceId: 1,
  date: "2026-04-20",
  startTime: "09:00:00",
  endTime: "11:00:00",
  purpose: "Database Lecture",
  attendees: 150
});

// Get all bookings (Admin)
const allBookings = await api.get('/bookings');

// Get user's bookings
const myBookings = await api.get('/bookings/user/101');

// Approve booking (Admin)
const approved = await api.put('/bookings/1/approve');

// Reject booking (Admin)
const rejected = await api.put('/bookings/1/reject?reason=Room+under+maintenance');

// Cancel booking (User)
const cancelled = await api.put('/bookings/1/cancel');

// ── TICKETS ─────────────────────────────────────────

// Create ticket
const newTicket = await api.post('/tickets', {
  resourceId: 1,
  description: "Projector not working in Lecture Hall A"
});

// Get all tickets
const tickets = await api.get('/tickets');
```

---

## 13. How to Run the Backend

### Prerequisites

1. **Java 21** installed
2. **MySQL** running on `localhost:3306`
3. MySQL user `root` with password `root` (or update `application.properties`)

### Steps

```bash
# 1. Create the database (MySQL CLI or Workbench)
mysql -u root -p
CREATE DATABASE smart_campus;
EXIT;

# 2. Navigate to project root
cd paf/

# 3. Build and run
./mvnw spring-boot:run
```

### Verify

Once running, visit `http://localhost:8080/api/resources` in your browser — you should see an empty JSON array `[]`.

### Application Properties (Current Configuration)

```properties
spring.application.name=paf
spring.datasource.url=jdbc:mysql://localhost:3306/smart_campus?createDatabaseIfNotExist=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
server.port=8080
```

> **Note**: `ddl-auto=update` means Hibernate will automatically create/update database tables based on entity definitions. You do NOT need to run SQL migration scripts.

---

*End of Backend API Documentation*
