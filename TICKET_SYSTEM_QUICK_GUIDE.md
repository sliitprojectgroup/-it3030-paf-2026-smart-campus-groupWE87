# Quick Start Guide - Ticket System

## How to Use the Ticket System

### For Users: Creating a Ticket

1. **Navigate to Report Issue**
   - Click "Report Issue" button on Tickets page
   - Or go to `/report-issue`

2. **Fill Out the Form**
   - **Resource**: Select from dropdown (required)
   - **Category**: Choose from 6 categories
     - Electrical
     - Plumbing
     - HVAC/Cooling
     - IT/Technology
     - Furniture/Fixtures
     - Other
   - **Priority**: Select importance level
     - Low (Green)
     - Medium (Yellow)
     - High (Orange)
     - Critical (Red)
   - **Description**: Detailed problem description (required)
   - **Contact Name**: Your name (optional)
   - **Phone**: Your phone number (optional)
   - **Email**: Your email (optional)

3. **Add Evidence**
   - Drag & drop up to 3 images OR click to select files
   - Only image files allowed (JPG, PNG, GIF, etc.)
   - Max 10MB per file
   - See preview of selected images
   - Remove unwanted images by clicking X

4. **Submit**
   - Click "Submit Request"
   - Images auto-upload after ticket is created
   - Redirected to Tickets list on success

---

### For Users: Viewing Tickets

1. **Browse All Tickets**
   - Go to Tickets page
   - See table with all tickets

2. **Use Filters**
   - **Search**: Find by ticket ID, description, category, or resource
   - **View**: Switch between "All Tickets" and "My Tickets"
   - **Status**: Filter by Open / In Progress / Resolved
   - **Priority**: Filter by Low / Medium / High / Critical
   - **Reset**: Clear all filters

3. **View Statistics**
   - See counts at bottom:
     - Total tickets
     - Resolved count
     - In Progress count
     - Critical priority count

4. **View Ticket Details**
   - Click "View" button on any ticket row
   - Goes to detail page: `/tickets/{id}`

---

### On Ticket Detail Page

1. **View Information**
   - Ticket ID and Resource ID
   - Description of the issue
   - Contact information (with clickable links)
   - Ticket timestamps (created/updated)
   - Evidence images in gallery

2. **Update Status** (if authorized)
   - Click status buttons: OPEN → IN_PROGRESS → RESOLVED
   - Changes reflected immediately

3. **Assign Technician** (if authorized)
   - Click "Assign Technician" button
   - Enter staff ID in modal
   - Ticket auto-sets to "IN_PROGRESS"
   - "Reassign" button available if already assigned

4. **View Evidence**
   - Images displayed in grid
   - Hover to see delete button (admin only)
   - Attachment count shown in sidebar

---

### For Admins: Managing Tickets

1. **Navigate to Admin Area**
   - May have additional admin filtering options
   - Can access all tickets (not just own)

2. **Assign Technicians**
   - Open ticket detail
   - Click "Assign Technician"
   - Enter technician/staff ID
   - Status auto-changes to "IN_PROGRESS"

3. **Update Status**
   - Change ticket status through buttons
   - Reflects in system immediately

4. **Manage Attachments**
   - Delete evidence images if needed
   - Hover over image → click X

---

## Example Workflows

### Workflow 1: Report a Broken Projector
1. Click "Report Issue"
2. Select "Lecture Hall A" (resource)
3. Category: "IT/Technology"
4. Priority: "HIGH"
5. Description: "Projector in Lecture Hall A won't turn on"
6. Contact: "John Smith" / "555-1234" / "john@university.edu"
7. Add photo of broken projector
8. Click Submit
9. Ticket created with ID #5 (example)

### Workflow 2: Admin Assigns Technician
1. Admin sees new ticket #5
2. Opens ticket detail
3. Clicks "Assign Technician"
4. Enters staff ID: 12
5. Technician now owns ticket (status = IN_PROGRESS)
6. Technician can view and update status

### Workflow 3: Find All Critical Issues
1. Go to Tickets page
2. Click Priority filter
3. Select "Critical"
4. See all high-priority tickets
5. Sort by status or search specific resource

---

## Color Coding Guide

### Priority Colors
- 🟢 **Low** - Green background
- 🟡 **Medium** - Yellow background
- 🟠 **High** - Orange background
- 🔴 **Critical** - Red background

### Status Colors
- 🔵 **Open** - Blue background
- 🟣 **In Progress** - Purple background
- 🟢 **Resolved** - Green background

### Category Icons
- ⚡ Electrical
- 🔧 Plumbing
- ❄️ HVAC
- 💻 IT
- 🪑 Furniture
- ⚙️ Other

---

## Important Notes

### Ticket Lifecycle
- New tickets always start as **OPEN**
- When assigned, status changes to **IN_PROGRESS**
- Can be manually changed to **RESOLVED**
- No automated status transitions

### Attachment Rules
- Maximum **3 images per ticket**
- Only image files accepted (JPEG, PNG, GIF, etc.)
- Maximum **10MB per image**
- Stored as binary in database

### Contact Information
- Contact fields are **optional**
- Phone/Email shown as clickable links
- Useful for technician follow-up

### Filters
- Filters can be combined with search
- "My Tickets" shows only your submitted tickets
- Reset button clears all filters at once

---

## Troubleshooting

### "Maximum 3 attachments allowed"
- You've already selected 3 images
- Remove one before adding another

### "Only image files are allowed"
- File type not supported
- Use JPG, PNG, GIF, or similar image format

### Image won't upload
- File size might exceed 10MB
- Try re-uploading or compress image

### Can't see My Tickets
- Make sure userId is set in localStorage
- System uses userId to filter tickets

### Status update not working
- May need admin permissions
- Try refreshing page if stuck

---

## API Testing

### Create Ticket (cURL)
```bash
curl -X POST http://localhost:8085/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "resourceId": 1,
    "category": "IT",
    "description": "WiFi not working",
    "priority": "HIGH",
    "contactName": "John",
    "contactPhone": "555-0123",
    "contactEmail": "john@test.com"
  }'
```

### Upload Attachment
```bash
curl -X POST http://localhost:8085/api/tickets/1/attachments \
  -F "file=@/path/to/image.jpg"
```

### Get All Tickets
```bash
curl http://localhost:8085/api/tickets
```

### Get Ticket by Status
```bash
curl http://localhost:8085/api/tickets/status/OPEN
```

---

## Key Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/tickets | Create ticket |
| GET | /api/tickets | Get all |
| GET | /api/tickets/{id} | Get detail |
| GET | /api/tickets/user/{userId} | Get user's tickets |
| GET | /api/tickets/status/{status} | Filter by status |
| GET | /api/tickets/priority/{priority} | Filter by priority |
| PUT | /api/tickets/{id}/status/{status} | Update status |
| PUT | /api/tickets/{id}/assign/{staffId} | Assign technician |
| POST | /api/tickets/{id}/attachments | Upload image |
| GET | /api/tickets/{id}/attachments | Get attachments |
| DELETE | /api/tickets/attachment/{id} | Delete attachment |

---

## UI Components

### CreateTicket Form
- Dropdown selects for Resource, Category, Priority
- Textarea for description
- Text inputs for contact info
- Drag-drop file upload zone
- Image preview grid with remove buttons
- Submit/Cancel buttons

### TicketList Page
- Search/filter controls
- Data table with:
  - Ticket ID (clickable)
  - Resource ID
  - Category with icon
  - Description (truncated)
  - Priority badge
  - Status badge
  - View button
- Statistics summary at bottom

### TicketDetail Page
- Header with ticket ID
- Status update buttons
- Priority/Category/Timestamps
- Description section
- Contact info (clickable links)
- Evidence gallery with delete
- Sidebar with:
  - Assignment section
  - Ticket details
- Modal for assigning technician

---

## Next Steps

1. **Compile Backend**
   ```bash
   cd backend
   ./mvnw clean install
   ```

2. **Start Backend**
   ```bash
   java -jar target/paf-application.jar
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Start Frontend**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Open http://localhost:5173
   - Go to Tickets page
   - Try creating a ticket!

---

For detailed technical documentation, see: `TICKET_SYSTEM_DOCUMENTATION.md`
