# Users Management Feature

## Overview
The Users Management feature allows organization administrators to add and manage other admin users for their organization. All users added through this interface have full administrative access to the organization.

## Access
- **Route**: `/admin/users`
- **Authentication**: Requires admin authentication
- **Visibility**: Hidden (no navigation link, direct access only)

## Features

### 1. View Admin Users
- Lists all admin users associated with the organization
- Shows user information:
  - Name and profile picture
  - Email address
  - Authentication method (Google SSO indicator)
  - Account status
  - Date added
- Current user's row is visually distinct:
  - Grayed out and disabled
  - Shows "You" badge next to name
  - Cannot be edited or removed
- Click any row (except your own) to edit that user

### 2. Add New Admin User
- Add users by email address
- Optional: First and last name
- Choose authentication method:
  - **Magic Login Link**: Sends a secure login link via email (no password needed)
  - **Set Password**: Create a password for the user (they can change it later)
- Supports both new users and existing users from other organizations

### 3. Edit Admin User
- Click on any user row to open the edit drawer
- Can update:
  - First name
  - Last name
- Cannot update:
  - Email address (locked after creation)
  - Authentication method (only set during creation)
- Cannot edit your own user (use profile page instead)

### 4. Remove Admin User
- Remove admin access for users
- Prevention of self-removal
- If user belongs to multiple organizations, only removes from current organization
- If user belongs only to current organization, completely deletes the user account

## Backend API

### Routes
All routes require admin authentication (`[auth, requireAdmin]`)

#### GET `/api/users/admin`
Get all admin users for the current organization.

**Response:**
```json
{
  "success": true,
  "message": "Admin users retrieved successfully",
  "data": [
    {
      "_id": "...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "picture": "https://...",
      "status": "active",
      "isAdmin": true,
      "organizations": ["..."],
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/users/admin`
Create a new admin user or add existing user to organization.

**Request Body (Magic Link Method):**
```json
{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "authMethod": "magic-link"
}
```

**Request Body (Set Password Method):**
```json
{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "authMethod": "set-password",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "data": {
    "_id": "...",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "isAdmin": true,
    "status": "active",
    "organizations": ["..."]
  }
}
```

**Notes:**
- `authMethod` defaults to `"magic-link"` if not provided
- When using `"magic-link"`, automatically generates and sends a secure login link via email
- When using `"set-password"`, password must be at least 8 characters
- Password is automatically hashed before storage
- If user already exists in the system, adds the organization to their profile
- Returns error if user is already part of the organization

#### PUT `/api/users/admin/:id`
Update an existing admin user's information.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user updated successfully",
  "data": {
    "_id": "...",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "isAdmin": true,
    "status": "active",
    "organizations": ["..."]
  }
}
```

**Notes:**
- Can only update `firstName` and `lastName`
- Email cannot be changed
- Cannot update yourself through this endpoint (use profile endpoint instead)
- User must belong to your organization

#### DELETE `/api/users/admin/:id`
Remove admin user from the organization.

**Response:**
```json
{
  "success": true,
  "message": "Admin user removed successfully",
  "data": null
}
```

**Notes:**
- Cannot delete yourself
- If user belongs to multiple organizations, only removes current organization
- If user belongs only to current organization, deletes the user account entirely

## Frontend Components

### Main Component
**File**: `/fe/src/pages/admin/Users.vue`

Uses composition API with `<script setup>` and includes:
- User table with sorting
- Add user drawer (modal)
- Delete confirmation modal
- Error handling and loading states
- Toast notifications

### Dependencies
- `@iconify/vue` for icons
- `Drawer.vue` component
- `ConfirmationModal.vue` component
- Toast notification system

## Security Considerations

1. **Authentication Required**: All endpoints require admin authentication
2. **Organization Scoped**: Users can only manage users within their own organization
3. **Self-Protection**: Users cannot remove themselves from the organization
4. **Validation**: Email validation and duplicate checking
5. **Safe Deletion**: Prevents accidental data loss by checking organization membership

## Future Enhancements

Potential improvements for future versions:
1. Role-based permissions (different admin levels)
2. User activity logs
3. Bulk user management
4. User invitation system with acceptance flow
5. Temporary access grants with expiration
6. Two-factor authentication requirements
7. Audit trail for user management actions

## Testing

To test the feature:
1. Navigate to `/admin/users` while logged in as an admin
2. Verify your own user row is grayed out with a "You" badge
3. Click "Add User" to create a new admin user
4. Enter email and optional name information
5. Choose authentication method:
   - **Magic Link**: Check backend logs for the generated magic login URL
   - **Set Password**: Enter and confirm a password (minimum 8 characters)
6. Submit the form and verify success message
7. Click on another user's row to edit them
8. Update their first/last name and save
9. Verify email field is disabled in edit mode
10. Try clicking your own row (should not open drawer)
11. Test removing users (except yourself)
12. Verify organization scoping by checking multiple organizations
13. Test login with both authentication methods

## Troubleshooting

### User not receiving magic login email
- Check backend logs for email sending errors
- Verify Postmark service configuration
- Check the email address is valid
- Look for the magic login URL in the logs (temporary debugging)

### Cannot add user
- Verify user email format is correct
- Check if user already exists in the organization
- Ensure you have admin privileges
- If using set-password method, verify password meets requirements (8+ characters)
- Check that passwords match if using set-password method
- Check network console for API errors

### Cannot remove user
- Verify you're not trying to remove yourself
- Ensure user belongs to your organization
- Check admin authentication is valid


