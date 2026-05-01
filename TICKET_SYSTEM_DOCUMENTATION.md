# Maintenance & Incident Ticketing System - Implementation Summary

## Overview
Complete implementation of the Maintenance & Incident Ticketing module for the Smart Campus Operations Hub. This system allows users to report issues with campus resources, including category, priority, contact information, and image attachments for evidence.

---

## Backend Implementation

### 1. Enhanced Ticket Model (`Ticket.java`)
**New Fields Added:**
- `userId` - ID of the user reporting the issue
- `category` - Issue category (ELECTRICAL, PLUMBING, HVAC, IT, FURNITURE, OTHER)
- `priority` - Priority level (LOW, MEDIUM, HIGH, CRITICAL)
- `assignedTo` - ID of technician/staff assigned to the ticket
- `contactName` - Name of person reporting
- `contactPhone` - Phone number for contact
- `contactEmail` - Email for contact
- `createdAt` - Timestamp when ticket was created
- `updatedAt` - Timestamp when ticket was last updated
- `attachments` - List of attached images (1-to-many relationship)

**Status Values:**
- OPEN - Issue reported, pending review
- IN_PROGRESS - Issue being worked on (set when assigned)
- RESOLVED - Issue has been fixed

**Automatic Features:**
- `@PrePersist` - Auto-sets timestamp and default status to "OPEN"
- `@PreUpdate` - Auto-updates the `updatedAt` timestamp

### 2. New TicketAttachment Model (`TicketAttachment.java`)
**Purpose:** Store image attachments as evidence for tickets

**Fields:**
- `id` - Primary key
- `ticket` - Many-to-one relationship with Ticket
- `fileName` - Original file name
- `fileType` - MIME type (image/jpeg, image/png, etc.)
- `fileSize` - File size in bytes
- `fileData` - Actual binary data (LONGBLOB)
- `uploadedAt` - Timestamp of upload

**Validation:**
- Maximum 3 attachments per ticket
- Only image files allowed
- Max file size: 10MB per file
- Enforced at service layer

### 3. New TicketAttachmentRepository
Custom queries for attachment management:
- `findByTicketId(Long ticketId)` - Get all attachments for a ticket

### 4. Enhanced TicketRepository
New query methods:
- `findByUserId(Long userId)` - Get tickets reported by a user
- `findByStatus(String status)` - Get tickets by status
- `findByAssignedTo(Long staffId)` - Get tickets assigned to staff
- `findByPriority(String priority)` - Get tickets by priority
- `findByResourceAndStatus()` - Get tickets for resource with specific status
- `findByUserAndStatus()` - Get user's tickets with specific status

### 5. Enhanced TicketService
**New Methods:**
- `getTicketById(Long id)` - Get single ticket details
- `getTicketsByResourceId(Long resourceId)` - Get all tickets for a resource
- `getTicketsByUserId(Long userId)` - Get user's tickets
- `getTicketsByStatus(String status)` - Filter by status
- `getTicketsByAssignedTo(Long staffId)` - Get staff's assigned tickets
- `getTicketsByPriority(String priority)` - Filter by priority
- `updateTicketStatus(Long id, String newStatus)` - Change ticket status
- `assignTicket(Long ticketId, Long staffId)` - Assign technician (auto-sets status to IN_PROGRESS)
- `updateTicket(Long id, Ticket ticketDetails)` - Update ticket details
- `deleteTicket(Long id)` - Delete ticket
- `uploadAttachment(Long ticketId, MultipartFile file)` - Upload image with validation
- `getAttachment(Long attachmentId)` - Retrieve attachment
- `getTicketAttachments(Long ticketId)` - Get all attachments for ticket
- `deleteAttachment(Long attachmentId)` - Delete attachment

### 6. Enhanced TicketController
**New Endpoints:**

**Ticket Management:**
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/{id}` - Get ticket by ID
- `GET /api/tickets/resource/{resourceId}` - Get tickets for resource
- `GET /api/tickets/user/{userId}` - Get user's tickets
- `GET /api/tickets/status/{status}` - Get tickets by status
- `GET /api/tickets/priority/{priority}` - Get tickets by priority
- `GET /api/tickets/assigned/{staffId}` - Get tickets assigned to staff
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/{id}` - Update ticket details
- `PUT /api/tickets/{id}/status/{status}` - Update ticket status
- `PUT /api/tickets/{id}/assign/{staffId}` - Assign technician to ticket
- `DELETE /api/tickets/{id}` - Delete ticket

**Attachment Management:**
- `POST /api/tickets/{id}/attachments` - Upload image (multipart/form-data)
- `GET /api/tickets/{id}/attachments` - Get all attachments for ticket
- `GET /api/tickets/attachment/{attachmentId}` - Get single attachment
- `DELETE /api/tickets/attachment/{attachmentId}` - Delete attachment

### 7. Configuration Updates (`application.properties`)
Added file upload settings:
```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=30MB
spring.servlet.multipart.enabled=true
```

---

## Frontend Implementation

### 1. Enhanced API Service (`api.js`)
**New API Methods:**
```javascript
// Ticket CRUD
createTicket(data)
getTickets()
getTicketById(id)
getTicketsByUser(userId)
getTicketsByStatus(status)
getTicketsByPriority(priority)
getTicketsByResource(resourceId)
getTicketsAssignedTo(staffId)
updateTicket(id, data)
updateTicketStatus(id, status)
assignTicket(id, staffId)
deleteTicket(id)

// Attachment Management
uploadTicketAttachment(ticketId, file) - MultipartForm data
getTicketAttachments(ticketId)
getAttachment(attachmentId)
deleteAttachment(attachmentId)
```

### 2. Enhanced CreateTicket Page (`CreateTicket.jsx`)
**Features Implemented:**
- Resource selection dropdown (auto-loaded from API)
- Category selector (6 categories)
- Priority selector (4 priority levels)
- Detailed description textarea
- Contact information fields:
  - Contact Name
  - Phone Number
  - Email Address
- Image attachment upload:
  - Drag & drop support
  - Multiple file selection
  - Max 3 images validation
  - Image type validation
  - File preview with removal option
- Toast notifications for feedback
- Loading states
- Form validation
- Auto-upload attachments after ticket creation

**UI/UX Highlights:**
- Material Design 3 compliant styling
- Responsive grid layout
- Real-time attachment preview
- Visual feedback for file limit (3/3)
- Cancel/Submit buttons

### 3. New TicketDetail Page (`TicketDetail.jsx`)
**Features Implemented:**
- Ticket header with ID and resource info
- Status management with buttons for OPEN → IN_PROGRESS → RESOLVED
- Priority badge with color coding
- Category display with emoji icons
- Detailed ticket information:
  - Created/Updated timestamps
  - Reporter ID
  - Attachment count
- Description section
- Contact information display:
  - Clickable phone links (tel:)
  - Clickable email links (mailto:)
- Evidence section with image attachments:
  - Grid preview layout
  - Click to view full image
  - Delete button on hover
- Assignment section:
  - Show current assignee
  - Modal dialog to assign/reassign technician
  - Staff ID input
- Ticket details sidebar with ID, Resource ID, Attachment count
- Loading state with spinner
- Error handling

**Technical Features:**
- Base64 image rendering from binary data
- Modal dialog for assignment
- Confirm dialogs for destructive actions
- Auto-refresh on updates
- Toast notifications for all actions

### 4. Enhanced TicketList Page (`TicketList.jsx`)
**Features Implemented:**
- Advanced filtering system:
  - Search by ticket ID, description, category, resource ID
  - Filter by status (Open, In Progress, Resolved)
  - Filter by priority (Low, Medium, High, Critical)
  - View options (All Tickets, My Tickets)
  - Reset button to clear all filters
- Professional table layout:
  - Ticket ID (formatted with #)
  - Resource reference
  - Category with emoji icons
  - Description (truncated)
  - Priority badge with color coding
  - Status badge with color coding
  - View button linking to detail page
- Summary statistics:
  - Total tickets count
  - Resolved count
  - In Progress count
  - Critical priority count
- Loading state with spinner
- Empty state with icon
- Responsive design (grid on mobile, table on desktop)
- Hover effects and transitions

**Color Coding:**
- Priority: Green (Low) → Yellow (Medium) → Orange (High) → Red (Critical)
- Status: Blue (Open) → Purple (In Progress) → Green (Resolved)
- Category Icons: ⚡(Electrical), 🔧(Plumbing), ❄️(HVAC), 💻(IT), 🪑(Furniture), ⚙️(Other)

### 5. Updated App.jsx
Added new route:
```javascript
<Route path="tickets/:id" element={<TicketDetail />} />
```

---

## Data Flow & Workflows

### Create Ticket Workflow
1. User fills out form (Category, Priority, Description, Contact Info)
2. Frontend creates ticket via `POST /api/tickets`
3. Backend returns created ticket with ID
4. Frontend uploads up to 3 images via `POST /api/tickets/{id}/attachments`
5. Each attachment validated (image only, size limit)
6. User redirected to ticket list with success toast

### View & Update Workflow
1. User clicks "View" on ticket in list
2. TicketDetail page loads ticket data and attachments
3. User can:
   - Change status (OPEN → IN_PROGRESS → RESOLVED)
   - Assign technician (opens modal with staff ID input)
   - View/delete attachments
   - See contact information

### Filter & Search Workflow
1. User selects filter (Status, Priority, View mode)
2. TicketList fetches filtered data from backend
3. Results displayed in table with search overlay
4. Summary statistics auto-update based on filters
5. Reset button clears all filters

---

## Key Features Summary

✅ **Create Tickets with Rich Details**
- Category classification
- Priority levels for triage
- Contact information capture
- Markdown-style description

✅ **Image Evidence Support**
- Upload up to 3 images per ticket
- Image validation (type and size)
- Base64 encoding for database storage
- Responsive image gallery display

✅ **Technician Assignment**
- Assign/reassign staff members to tickets
- Auto-set status to IN_PROGRESS on assignment
- View assigned staff ID

✅ **Status Tracking Throughout Lifecycle**
- OPEN → IN_PROGRESS → RESOLVED
- Visual status indicators
- Status change buttons on detail page

✅ **Advanced Filtering**
- Filter by status, priority, category
- Search by ticket ID, description, resource
- View user's own tickets
- Reset to show all tickets

✅ **Professional UI**
- Material Design 3 styling
- Responsive across all devices
- Toast notifications for feedback
- Color-coded priorities and statuses
- Loading and empty states
- Modal dialogs for actions

---

## File Structure

**Backend:**
```
src/main/java/com/sliit/paf/
├── model/
│   ├── Ticket.java (ENHANCED)
│   └── TicketAttachment.java (NEW)
├── repository/
│   ├── TicketRepository.java (ENHANCED)
│   └── TicketAttachmentRepository.java (NEW)
├── service/
│   └── TicketService.java (ENHANCED)
└── controller/
    └── TicketController.java (ENHANCED)

src/main/resources/
└── application.properties (ENHANCED)
```

**Frontend:**
```
src/
├── pages/
│   ├── CreateTicket.jsx (ENHANCED)
│   ├── TicketDetail.jsx (NEW)
│   ├── TicketList.jsx (ENHANCED)
│   └── App.jsx (ENHANCED with route)
└── services/
    └── api.js (ENHANCED)
```

---

## API Response Examples

### Create Ticket Response
```json
{
  "id": 1,
  "userId": 1,
  "resourceId": 1,
  "category": "IT",
  "description": "WiFi not working in Lab 3",
  "priority": "HIGH",
  "status": "OPEN",
  "assignedTo": null,
  "contactName": "John Doe",
  "contactPhone": "+1-555-0123",
  "contactEmail": "john@example.com",
  "createdAt": "2026-04-17T10:30:00",
  "updatedAt": "2026-04-17T10:30:00",
  "attachments": []
}
```

### Ticket with Attachments
```json
{
  "id": 1,
  "... (ticket fields) ...",
  "attachments": [
    {
      "id": 1,
      "fileName": "issue.jpg",
      "fileType": "image/jpeg",
      "fileSize": 245632,
      "uploadedAt": "2026-04-17T10:35:00"
    }
  ]
}
```

---

## Testing Checklist

✅ Create ticket with all fields
✅ Upload 1, 2, 3 attachments
✅ Reject upload if image > 3 files
✅ Reject upload if non-image file
✅ View ticket detail page
✅ Update ticket status through buttons
✅ Assign technician via modal
✅ Filter by status
✅ Filter by priority
✅ Search by ticket ID
✅ Delete attachment
✅ View attachment image
✅ Go to ticket from list
✅ Return from detail to list
✅ Toast notifications appear
✅ Mobile responsive layout

---

## Future Enhancements (Optional)

- Real-time notifications when tickets are assigned
- Email notifications to contact
- Attachment file download feature
- Bulk actions on tickets
- Custom ticket fields
- SLA/deadline tracking
- Work log/comments on tickets
- Ticket templates
- Integration with calendar for scheduling repairs
- Analytics dashboard for maintenance metrics
