# POSTMAN TESTING COLLECTION
## Module C - Maintenance & Incident Ticketing

**Base URL**: `http://localhost:8085/api`

This document contains ready-to-use curl commands for testing all ticket endpoints.

---

## 1. TICKET CREATION & RETRIEVAL

### 1.1 Create a New Ticket
```bash
curl -X POST http://localhost:8085/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": 1,
    "category": "MAINTENANCE",
    "title": "Broken Door Lock in Building A",
    "description": "The main entrance door lock on the first floor is stuck and cannot be opened. This is a critical issue affecting building access.",
    "priority": "HIGH",
    "preferredContact": "john.doe@example.com",
    "createdBy": 1,
    "status": "OPEN"
  }'
```

**Expected Response (201 Created)**:
```json
{
  "id": 1,
  "resourceId": 1,
  "category": "MAINTENANCE",
  "title": "Broken Door Lock in Building A",
  "description": "The main entrance door lock on the first floor is stuck and cannot be opened. This is a critical issue affecting building access.",
  "priority": "HIGH",
  "preferredContact": "john.doe@example.com",
  "status": "OPEN",
  "createdBy": 1,
  "assignedTechnician": null,
  "resolutionNotes": null,
  "rejectionReason": null,
  "createdAt": "2026-05-24T10:30:00",
  "updatedAt": "2026-05-24T10:30:00"
}
```

### 1.2 Create Another Ticket (IT Category)
```bash
curl -X POST http://localhost:8085/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": 2,
    "category": "IT",
    "title": "WiFi Network Not Working",
    "description": "The WiFi network in the computer lab is not responding. All devices are unable to connect.",
    "priority": "MEDIUM",
    "preferredContact": "+1-555-0123",
    "createdBy": 2,
    "status": "OPEN"
  }'
```

### 1.3 Get All Tickets
```bash
curl http://localhost:8085/api/tickets \
  -H "Content-Type: application/json"
```

### 1.4 Get Specific Ticket
```bash
curl http://localhost:8085/api/tickets/1 \
  -H "Content-Type: application/json"
```

**Note**: This includes attachments and comments nested in response.

### 1.5 Get Tickets by Status
```bash
# Get all OPEN tickets
curl http://localhost:8085/api/tickets/status/OPEN \
  -H "Content-Type: application/json"

# Get all IN_PROGRESS tickets
curl http://localhost:8085/api/tickets/status/IN_PROGRESS \
  -H "Content-Type: application/json"
```

### 1.6 Get Tickets by Resource
```bash
curl http://localhost:8085/api/tickets/resource/1 \
  -H "Content-Type: application/json"
```

### 1.7 Get Tickets Created by User
```bash
curl http://localhost:8085/api/tickets/user/1 \
  -H "Content-Type: application/json"
```

### 1.8 Get Tickets Assigned to Technician
```bash
curl http://localhost:8085/api/tickets/technician/2 \
  -H "Content-Type: application/json"
```

---

## 2. TECHNICIAN ASSIGNMENT

### 2.1 Assign Technician to Ticket
```bash
curl -X PUT http://localhost:8085/api/tickets/1/assign?technicianId=2 \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK)**:
```json
{
  "id": 1,
  ...
  "assignedTechnician": 2,
  ...
}
```

### 2.2 Assign to Different Technician
```bash
curl -X PUT http://localhost:8085/api/tickets/1/assign?technicianId=3 \
  -H "Content-Type: application/json"
```

---

## 3. STATUS WORKFLOW

### 3.1 Move Ticket from OPEN to IN_PROGRESS
```bash
curl -X PUT http://localhost:8085/api/tickets/1/status?status=IN_PROGRESS \
  -H "Content-Type: application/json"
```

### 3.2 Move from IN_PROGRESS to RESOLVED
```bash
curl -X PUT http://localhost:8085/api/tickets/1/status?status=RESOLVED \
  -H "Content-Type: application/json"
```

### 3.3 Move from RESOLVED to CLOSED
```bash
curl -X PUT http://localhost:8085/api/tickets/1/status?status=CLOSED \
  -H "Content-Type: application/json"
```

### 3.4 Reject Ticket (Invalid Transition Test)
```bash
# This should work from OPEN or IN_PROGRESS
curl -X PUT "http://localhost:8085/api/tickets/1/reject?reason=Cannot+fix+with+current+resources.+Requires+specialized+equipment." \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK)**:
```json
{
  "id": 1,
  ...
  "status": "REJECTED",
  "rejectionReason": "Cannot fix with current resources. Requires specialized equipment.",
  ...
}
```

### 3.5 Test Invalid Transition (Should Fail)
```bash
# Try to go from CLOSED to anything (should fail with 409)
curl -X PUT http://localhost:8085/api/tickets/1/status?status=OPEN \
  -H "Content-Type: application/json"
```

**Expected Response (409 Conflict)**:
```json
{
  "message": "Invalid status transition from CLOSED to OPEN"
}
```

---

## 4. COMMENTS

### 4.1 Add Comment to Ticket
```bash
curl -X POST http://localhost:8085/api/tickets/1/comments?userId=2 \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I have started investigating the lock mechanism. Initial assessment shows the bolt is stuck due to rust."
  }'
```

**Expected Response (201 Created)**:
```json
{
  "id": 1,
  "ticketId": 1,
  "userId": 2,
  "content": "I have started investigating the lock mechanism. Initial assessment shows the bolt is stuck due to rust.",
  "createdAt": "2026-05-24T11:00:00",
  "updatedAt": "2026-05-24T11:00:00"
}
```

### 4.2 Add Another Comment
```bash
curl -X POST http://localhost:8085/api/tickets/1/comments?userId=3 \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Applied lubricant to the mechanism. Testing the lock now."
  }'
```

### 4.3 Get All Comments for Ticket
```bash
curl http://localhost:8085/api/tickets/1/comments \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK)**:
```json
[
  {
    "id": 1,
    "userId": 2,
    "content": "I have started investigating the lock mechanism...",
    "createdAt": "2026-05-24T11:00:00",
    "updatedAt": "2026-05-24T11:00:00"
  },
  {
    "id": 2,
    "userId": 3,
    "content": "Applied lubricant to the mechanism...",
    "createdAt": "2026-05-24T11:05:00",
    "updatedAt": "2026-05-24T11:05:00"
  }
]
```

### 4.4 Edit Own Comment (User 2 edits comment 1)
```bash
curl -X PUT http://localhost:8085/api/tickets/comments/1?userId=2 \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I have started investigating the lock mechanism. Initial assessment shows the bolt is stuck due to rust. Recommendation: Replace the lock entirely."
  }'
```

### 4.5 Delete Own Comment
```bash
curl -X DELETE http://localhost:8085/api/tickets/comments/2?userId=3 \
  -H "Content-Type: application/json"
```

**Expected Response (204 No Content)**

### 4.6 Try to Edit Someone Else's Comment (Should Fail)
```bash
# User 1 tries to edit comment created by User 2 (should fail with 403)
curl -X PUT http://localhost:8085/api/tickets/comments/1?userId=1 \
  -H "Content-Type: application/json" \
  -d '{"content": "New content"}'
```

**Expected Response (403 Forbidden)**:
```json
{
  "message": "You can only edit your own comments"
}
```

---

## 5. ATTACHMENTS (Images)

### 5.1 Upload Image to Ticket (Using File)

First, prepare an image file (e.g., `test-image.jpg`).

```bash
curl -X POST http://localhost:8085/api/tickets/1/attachments \
  -F "file=@/path/to/test-image.jpg"
```

**Expected Response (201 Created)**:
```json
{
  "id": 1,
  "ticketId": 1,
  "fileName": "test-image.jpg",
  "filePath": "uploads/tickets/550e8400-e29b-41d4-a716-446655440000.jpg",
  "fileType": "image/jpeg",
  "fileSize": 245632,
  "uploadedAt": "2026-05-24T11:30:00"
}
```

### 5.2 Upload Multiple Images
```bash
curl -X POST http://localhost:8085/api/tickets/1/attachments \
  -F "file=@/path/to/image1.jpg"

curl -X POST http://localhost:8085/api/tickets/1/attachments \
  -F "file=@/path/to/image2.png"

curl -X POST http://localhost:8085/api/tickets/1/attachments \
  -F "file=@/path/to/image3.gif"
```

### 5.3 Try to Upload 4th Image (Should Fail)
```bash
# This should fail because max 3 images per ticket
curl -X POST http://localhost:8085/api/tickets/1/attachments \
  -F "file=@/path/to/image4.jpg"
```

**Expected Response (409 Conflict)**:
```json
{
  "message": "Maximum 3 attachments allowed per ticket"
}
```

### 5.4 Try to Upload Non-Image File (Should Fail)
```bash
curl -X POST http://localhost:8085/api/tickets/1/attachments \
  -F "file=@/path/to/document.pdf"
```

**Expected Response (409 Conflict)**:
```json
{
  "message": "Only image files are allowed"
}
```

### 5.5 Try to Upload File > 5MB (Should Fail)
```bash
# Create a large file > 5MB
curl -X POST http://localhost:8085/api/tickets/1/attachments \
  -F "file=@/path/to/large-file-10mb.jpg"
```

**Expected Response (400 Bad Request)**:
```json
{
  "message": "File size exceeds 5MB limit"
}
```

### 5.6 Get All Attachments for Ticket
```bash
curl http://localhost:8085/api/tickets/1/attachments \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK)**:
```json
[
  {
    "id": 1,
    "fileName": "test-image.jpg",
    "filePath": "uploads/tickets/550e8400-e29b-41d4-a716-446655440000.jpg",
    "fileType": "image/jpeg",
    "fileSize": 245632
  },
  {
    "id": 2,
    "fileName": "test-image2.png",
    "filePath": "uploads/tickets/550e8400-e29b-41d4-a716-446655440001.png",
    "fileType": "image/png",
    "fileSize": 512000
  }
]
```

### 5.7 Delete Attachment
```bash
curl -X DELETE http://localhost:8085/api/tickets/attachments/1 \
  -H "Content-Type: application/json"
```

**Expected Response (204 No Content)**

---

## 6. UPDATE TICKET

### 6.1 Update Ticket Resolution Notes
```bash
curl -X PUT http://localhost:8085/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "resourceId": 1,
    "category": "MAINTENANCE",
    "title": "Broken Door Lock in Building A",
    "description": "The main entrance door lock on the first floor is stuck and cannot be opened.",
    "priority": "HIGH",
    "preferredContact": "john.doe@example.com",
    "status": "RESOLVED",
    "createdBy": 1,
    "assignedTechnician": 2,
    "resolutionNotes": "Replaced the entire lock assembly. Installed new deadbolt with updated security features. Tested multiple times for proper operation.",
    "rejectionReason": null
  }'
```

### 6.2 Update Multiple Fields
```bash
curl -X PUT http://localhost:8085/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "title": "Updated: Broken Door Lock FIXED",
    "resolutionNotes": "Lock has been successfully repaired and tested."
  }'
```

---

## 7. COMPREHENSIVE WORKFLOW TEST

### Complete Ticket Lifecycle
```bash
# Step 1: Create Ticket
echo "1. Creating ticket..."
TICKET=$(curl -s -X POST http://localhost:8085/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": 1,
    "category": "MAINTENANCE",
    "title": "Test Ticket",
    "description": "Test workflow ticket",
    "priority": "HIGH",
    "preferredContact": "test@example.com",
    "createdBy": 1
  }')

TICKET_ID=$(echo $TICKET | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Created ticket ID: $TICKET_ID"

# Step 2: Upload Image
echo "2. Uploading image..."
curl -s -X POST http://localhost:8085/api/tickets/$TICKET_ID/attachments \
  -F "file=@test-image.jpg"

# Step 3: Assign Technician
echo "3. Assigning technician..."
curl -s -X PUT http://localhost:8085/api/tickets/$TICKET_ID/assign?technicianId=2

# Step 4: Change Status to IN_PROGRESS
echo "4. Moving to IN_PROGRESS..."
curl -s -X PUT http://localhost:8085/api/tickets/$TICKET_ID/status?status=IN_PROGRESS

# Step 5: Add Comment
echo "5. Adding comment..."
curl -s -X POST http://localhost:8085/api/tickets/$TICKET_ID/comments?userId=2 \
  -H "Content-Type: application/json" \
  -d '{"content": "Investigation in progress"}'

# Step 6: Update with Resolution Notes
echo "6. Adding resolution notes..."
curl -s -X PUT http://localhost:8085/api/tickets/$TICKET_ID \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": $TICKET_ID,
    \"resourceId\": 1,
    \"category\": \"MAINTENANCE\",
    \"title\": \"Test Ticket\",
    \"description\": \"Test workflow ticket\",
    \"priority\": \"HIGH\",
    \"preferredContact\": \"test@example.com\",
    \"status\": \"IN_PROGRESS\",
    \"createdBy\": 1,
    \"assignedTechnician\": 2,
    \"resolutionNotes\": \"Issue resolved successfully\"
  }"

# Step 7: Move to RESOLVED
echo "7. Moving to RESOLVED..."
curl -s -X PUT http://localhost:8085/api/tickets/$TICKET_ID/status?status=RESOLVED

# Step 8: Move to CLOSED
echo "8. Moving to CLOSED..."
curl -s -X PUT http://localhost:8085/api/tickets/$TICKET_ID/status?status=CLOSED

# Step 9: Get Final Ticket State
echo "9. Final ticket state..."
curl -s http://localhost:8085/api/tickets/$TICKET_ID | json_pp

echo "Workflow complete!"
```

---

## 8. ERROR SCENARIOS TO TEST

### 8.1 Invalid Status Transition
```bash
# Get a CLOSED ticket and try to change status
curl -X PUT http://localhost:8085/api/tickets/1/status?status=OPEN
# Should return 409 Conflict
```

### 8.2 Non-existent Ticket
```bash
curl http://localhost:8085/api/tickets/9999
# Should return 404 Not Found
```

### 8.3 Missing Required Fields
```bash
curl -X POST http://localhost:8085/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Incomplete Ticket"
  }'
# Should return 400 Bad Request with validation errors
```

### 8.4 Unauthorized Edit
```bash
# User 1 tries to edit comment made by User 2
curl -X PUT http://localhost:8085/api/tickets/comments/1?userId=1 \
  -H "Content-Type: application/json" \
  -d '{"content": "Hacked!"}'
# Should return 403 Forbidden
```

---

## 9. PERFORMANCE TESTING

### Load Test - Create 100 Tickets
```bash
for i in {1..100}; do
  curl -s -X POST http://localhost:8085/api/tickets \
    -H "Content-Type: application/json" \
    -d "{
      \"resourceId\": $((1 + RANDOM % 10)),
      \"category\": \"MAINTENANCE\",
      \"title\": \"Test Ticket $i\",
      \"description\": \"Test ticket for load testing\",
      \"priority\": \"MEDIUM\",
      \"preferredContact\": \"test$i@example.com\",
      \"createdBy\": 1
    }" &
done
wait
```

### Query Performance - Get All Tickets
```bash
time curl http://localhost:8085/api/tickets
# Should complete in < 1 second
```

---

## 10. DATA VALIDATION TESTING

### 10.1 Title Validation
```bash
# Too short (< 5 chars)
curl -X POST http://localhost:8085/api/tickets \
  -H "Content-Type: application/json" \
  -d '{..., "title": "Bug"}'

# Too long (> 200 chars)
curl -X POST http://localhost:8085/api/tickets \
  -H "Content-Type: application/json" \
  -d '{..., "title": "Very long title repeated many times..."}'
```

### 10.2 Contact Validation
```bash
# Invalid email
curl -X POST http://localhost:8085/api/tickets \
  -H "Content-Type: application/json" \
  -d '{..., "preferredContact": "not-an-email"}'

# Invalid phone
curl -X POST http://localhost:8085/api/tickets \
  -H "Content-Type: application/json" \
  -d '{..., "preferredContact": "123"}'
```

---

## Tips for Testing

1. **Using jq for JSON formatting**:
   ```bash
   curl http://localhost:8085/api/tickets | jq '.'
   ```

2. **Save responses to file**:
   ```bash
   curl http://localhost:8085/api/tickets > response.json
   ```

3. **Check response headers**:
   ```bash
   curl -i http://localhost:8085/api/tickets
   ```

4. **Time requests**:
   ```bash
   time curl http://localhost:8085/api/tickets
   ```

5. **Verbose output**:
   ```bash
   curl -v http://localhost:8085/api/tickets
   ```

---

## Common Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET, PUT successful |
| 201 | Created | POST new resource |
| 204 | No Content | DELETE successful |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing auth |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Invalid state/transition |
| 500 | Server Error | Backend issue |

---

**Last Updated**: May 24, 2026
**Version**: 1.0.0
**Ready for Testing**: ✅
