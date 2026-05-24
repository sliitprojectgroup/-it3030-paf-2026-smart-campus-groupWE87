# MODULE C - QUICK REFERENCE GUIDE

## 📋 Table of Contents
1. [File Structure](#file-structure)
2. [Frontend Routes & Components](#frontend-routes--components)
3. [API Endpoints Quick Reference](#api-endpoints-quick-reference)
4. [Common Code Patterns](#common-code-patterns)
5. [Debugging Tips](#debugging-tips)

---

## File Structure

### Backend Files
```
backend/src/main/java/com/sliit/paf/
├── controller/
│   └── TicketController.java           # REST endpoints
├── service/
│   └── TicketService.java              # Business logic
├── model/
│   ├── Ticket.java                     # Main entity
│   ├── TicketAttachment.java           # Image model
│   └── TicketComment.java              # Comment model
├── repository/
│   ├── TicketRepository.java
│   ├── TicketAttachmentRepository.java
│   └── TicketCommentRepository.java
└── dto/
    ├── CreateTicketRequest.java
    ├── TicketResponse.java
    ├── TicketAttachmentResponse.java
    ├── TicketCommentResponse.java
    └── AddCommentRequest.java
```

### Frontend Files
```
frontend/src/
├── pages/
│   ├── CreateTicket.jsx                # Report issue form
│   ├── TicketList.jsx                  # View all tickets
│   ├── TicketDetail.jsx                # Single ticket view
│   ├── AdminTicketOps.jsx              # Admin panel
│   └── TechnicianTickets.jsx           # Technician dashboard
├── services/
│   └── api.js                          # API client
└── utils/
    ├── ticketValidation.js             # Form validators
    └── toast.js                        # Notifications
```

---

## Frontend Routes & Components

### Routes (add to your router configuration)
```javascript
{
    path: '/report-issue',
    element: <CreateTicket />
},
{
    path: '/tickets',
    element: <TicketList />
},
{
    path: '/tickets/:id',
    element: <TicketDetail />
},
{
    path: '/admin/tickets',
    element: <AdminTicketOps />
},
{
    path: '/technician/tickets',
    element: <TechnicianTickets />
}
```

### Component Props & State
All components use React hooks (useState, useEffect, useParams, useNavigate).

---

## API Endpoints Quick Reference

### Create Ticket
```
POST /api/tickets
Body: {
    resourceId: 1,
    category: "MAINTENANCE",
    title: "Issue Title",
    description: "Detailed description",
    priority: "HIGH",
    preferredContact: "email@example.com",
    createdBy: 1
}
Response: 201 {Ticket object}
```

### Get Tickets
```
GET /api/tickets                                → All tickets
GET /api/tickets/{id}                           → Single ticket
GET /api/tickets/status/{status}                → By status
GET /api/tickets/resource/{resourceId}          → By resource
GET /api/tickets/user/{userId}                  → By creator
GET /api/tickets/technician/{technicianId}      → By assigned tech
```

### Update Ticket
```
PUT /api/tickets/{id}
Body: {Ticket fields to update}

PUT /api/tickets/{id}/status?status=IN_PROGRESS
PUT /api/tickets/{id}/assign?technicianId=2
PUT /api/tickets/{id}/reject?reason="Reason"
```

### Comments
```
POST /api/tickets/{id}/comments?userId=1
Body: {content: "Comment text"}

GET /api/tickets/{id}/comments
PUT /api/tickets/comments/{commentId}?userId=1
Body: {content: "Updated text"}

DELETE /api/tickets/comments/{commentId}?userId=1
```

### Attachments
```
POST /api/tickets/{id}/attachments
Body: FormData with 'file' field

GET /api/tickets/{id}/attachments
DELETE /api/tickets/attachments/{attachmentId}
```

---

## Common Code Patterns

### Creating a Ticket (Frontend)
```javascript
import { createTicket, uploadTicketAttachment } from '../services/api';

// Create ticket
const ticket = await createTicket({
    resourceId: 1,
    category: 'MAINTENANCE',
    title: 'Title',
    description: 'Description',
    priority: 'HIGH',
    preferredContact: 'email@example.com',
    createdBy: currentUser.id
});

// Upload attachments
for (const file of files) {
    await uploadTicketAttachment(ticket.id, file);
}
```

### Getting Ticket with Details (Frontend)
```javascript
import { getTicketById } from '../services/api';

const ticket = await getTicketById(id);
// ticket.attachments[] available
// ticket.comments[] available
```

### Updating Status (Frontend)
```javascript
import { updateTicketStatus } from '../services/api';

await updateTicketStatus(ticketId, 'IN_PROGRESS');
// Valid transitions enforced on backend
```

### Adding Comment (Frontend)
```javascript
import { addTicketComment } from '../services/api';

const comment = await addTicketComment(
    ticketId,
    userId,
    { content: 'Comment text' }
);
```

### Validation (Frontend)
```javascript
import { 
    validateTicketForm, 
    validateFileAttachments 
} from '../utils/ticketValidation';

// Validate entire form
const errors = validateTicketForm(formData);
if (Object.keys(errors).length > 0) {
    // Has errors
}

// Validate files
const fileErrors = validateFileAttachments(files);
if (fileErrors.length > 0) {
    // Has errors
}
```

### Notifications (Frontend)
```javascript
import { 
    showSuccessToast, 
    showErrorToast,
    showWarningToast 
} from '../utils/toast';

showSuccessToast('Ticket created!');
showErrorToast('Failed to create ticket');
showWarningToast('Please check your input');
```

### Backend Status Validation
```java
// In TicketService.java
private void validateStatusTransition(String current, String newStatus) {
    boolean valid = false;
    
    switch(current) {
        case "OPEN":
            valid = "IN_PROGRESS".equals(newStatus) || 
                    "REJECTED".equals(newStatus);
            break;
        case "IN_PROGRESS":
            valid = "RESOLVED".equals(newStatus) || 
                    "REJECTED".equals(newStatus);
            break;
        case "RESOLVED":
            valid = "CLOSED".equals(newStatus);
            break;
        // CLOSED and REJECTED are terminal
    }
    
    if (!valid) {
        throw new ConflictException("Invalid transition");
    }
}
```

---

## Debugging Tips

### Frontend Debugging

1. **API calls not working?**
   - Check browser console for errors
   - Verify API_HOST in api.js
   - Check if backend is running on :8085
   - Look at Network tab in DevTools

2. **Form validation not showing?**
   - Verify validateTicketForm is imported
   - Check if errors are being set in state
   - Look for console errors

3. **Images not uploading?**
   - Check file size (must be < 5MB)
   - Check file type (must be image)
   - Verify uploads/tickets directory exists on server
   - Check backend logs for file errors

4. **Status not updating?**
   - Check current status in database
   - Verify transition is allowed
   - Look for validation errors in response
   - Check user permissions

5. **Comments not appearing?**
   - Refresh page to sync
   - Check network requests
   - Verify user ID matches
   - Look for errors in console

### Backend Debugging

1. **Check application.properties**
   ```properties
   # Logging
   logging.level.com.sliit.paf=DEBUG
   
   # File upload
   file.upload-dir=uploads/tickets
   spring.servlet.multipart.max-file-size=5MB
   spring.servlet.multipart.max-request-size=15MB
   ```

2. **Database queries**
   ```properties
   # Show SQL
   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.format_sql=true
   ```

3. **Test endpoints with curl**
   ```bash
   # Get all tickets
   curl http://localhost:8085/api/tickets
   
   # Create ticket
   curl -X POST http://localhost:8085/api/tickets \
     -H "Content-Type: application/json" \
     -d '{"title":"Test",...}'
   ```

### Database Debugging

```sql
-- Check table structure
DESCRIBE tickets;
DESCRIBE ticket_attachments;
DESCRIBE ticket_comments;

-- Check data
SELECT * FROM tickets;
SELECT * FROM ticket_comments WHERE ticket_id = 1;

-- Check constraints
SHOW CREATE TABLE tickets;
```

---

## Environment Setup

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8085
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Database Setup
```bash
# Create database
CREATE DATABASE smart_campus;

# Run migrations (if using Flyway)
# Or execute SQL files from backend/resources/db
```

---

## Important Notes

⚠️ **File Upload**
- Creates `uploads/tickets/` directory automatically
- Files stored outside web root
- Unique names generated using UUID
- Max 5MB per file, 3 files per ticket

⚠️ **Status Workflow**
- Transitions enforced at service level
- Invalid transitions return 409 Conflict
- Only admin can reject
- Terminal states: CLOSED, REJECTED

⚠️ **Comments**
- Only owner can edit/delete
- Admin can still add comments
- Content length: 2-1000 characters

⚠️ **Validation**
- All inputs validated on frontend
- All inputs re-validated on backend
- Double validation ensures security

---

## Quick Troubleshooting Table

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 on ticket detail | ID doesn't exist | Check database for ticket |
| 409 on status change | Invalid transition | Check allowed transitions |
| 400 on file upload | File too large/wrong type | Check file size and format |
| 403 on comment edit | Not owner | Only creator can edit |
| Connection refused | Backend not running | Run `mvn spring-boot:run` |
| 401 Unauthorized | No auth token | Add authentication headers |
| Toast not showing | Container not created | Check DOM for #toast-container |

---

## Performance Tips

1. **Database**
   - Indexes are set up on key columns
   - Use status filter before fetching
   - Avoid N+1 queries (comments/attachments included)

2. **Frontend**
   - Images are lazy loaded
   - Use search to filter large lists
   - Modals prevent full page reloads

3. **API**
   - Batch operations when possible
   - Use query params for filtering
   - Include related data in responses

---

## Security Reminders

✅ **Always**
- Validate input on frontend AND backend
- Check user ID matches on edit/delete
- Use HTTPS in production
- Validate file types server-side
- Escape user input in displays

❌ **Never**
- Trust frontend validation alone
- Allow arbitrary file uploads
- Skip permission checks
- Store sensitive data in comments
- Use hardcoded user IDs

---

## Support Resources

- Backend Logs: `logs/spring.log`
- Frontend Console: Browser DevTools → Console
- Database: Use MySQL Workbench or similar
- API Documentation: See MODULE_C_IMPLEMENTATION_COMPLETE.md
- Postman Collection: Available in project root

---

**Last Updated**: May 24, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
