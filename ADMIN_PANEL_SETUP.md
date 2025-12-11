# Admin Panel Setup Guide

## Overview

The Admin Panel is a comprehensive management system for administrators and founders to manage users, premium keys, maintenance mode, and global statistics. Access is controlled through Firestore roles.

## User Roles & Permissions

### User Role
- **Default role** for all new accounts
- **Permissions:**
  - No admin access
  - Cannot see Admin tab
  - Cannot access `/dashboard` admin routes

### Admin Role
- **Limited management access**
- **Permissions:**
  - View user management interface
  - Modify user roles (limited)
  - View global statistics
  - View premium keys (read-only)
  - Cannot perform critical actions (delete users, create keys)

### Founder Role
- **Full administrative access**
- **Permissions:**
  - Full user management (create, update, delete users)
  - Create and delete premium keys
  - Enable/disable maintenance mode
  - Modify maintenance message
  - View all statistics
  - Perform critical actions

## Setting Up Admin Roles

### Initial Setup

1. **Create your first founder account:**
   - Register a new account normally
   - A default "user" role will be assigned automatically

2. **Manually upgrade to Founder (via Firebase Console):**
   - Go to Firebase Console → Firestore Database
   - Navigate to `userRoles` collection
   - Find your user document (uses your User UID)
   - Edit the `role` field from "user" to "founder"
   - Save

3. **Admin Panel becomes accessible:**
   - Return to Dashboard
   - A new "Admin Panel" tab will appear in the sidebar
   - You now have full admin access

### Creating Additional Admins

Once you have founder access:

1. Go to Admin Panel → Users tab
2. Find the user you want to promote
3. Change their role to "admin" or "founder"
4. The change takes effect immediately

## Admin Panel Features

### 1. Premium Keys Management (Founder Only)
- **Location:** Admin Panel → Premium Keys tab
- **Features:**
  - Generate new premium license keys
  - View all keys and their status
  - See which user each key is assigned to
  - Delete unused keys
- **Key Generation:**
  - Click "Generate Key"
  - Keys follow format: `KEY_[timestamp]_[random]`
  - Keys start as "unused"
  - Status changes to "used" when redeemed

### 2. User Management (Admin & Founder)
- **Location:** Admin Panel → Users tab
- **Features:**
  - View all system users with details:
    - Email address
    - Current role (user/admin/founder)
    - Plan type (free/premium/lifetime)
    - Storage used
    - Account creation date
  - **Admin actions:**
    - Change user roles
    - View statistics (read-only for admins)
  - **Founder-only actions:**
    - Delete user accounts (with confirmation)
    - Full user management

### 3. Maintenance Mode (Founder Only)
- **Location:** Admin Panel → Maintenance tab
- **Features:**
  - Toggle maintenance mode on/off
  - Set custom maintenance message
  - Real-time preview of maintenance message
  - Message is displayed to all users when enabled
- **Use Cases:**
  - System updates or migrations
  - Emergency maintenance
  - Scheduled downtime notifications

### 4. Global Statistics (Admin & Founder)
- **Location:** Admin Panel → Statistics tab
- **Displays:**
  - Total number of users
  - Active users count
  - Total storage used across system
  - Premium user count
  - Plan distribution (pie chart)
    - Free vs Premium vs Lifetime breakdown
  - Role distribution (pie chart)
    - Users vs Admins vs Founders breakdown
  - Activity graph (last 7 days)
    - Signups and uploads trends

## Firebase Configuration

### Required Collections

The system automatically creates these Firestore collections:

- **userRoles** - User role assignments
  ```
  userRoles/{userId}
  {
    role: "user" | "admin" | "founder"
  }
  ```

- **premiumKeys** - Premium license keys
  ```
  premiumKeys/{keyId}
  {
    key: string,
    status: "unused" | "used",
    assignedTo?: string (userId),
    assignedEmail?: string,
    createdAt: timestamp
  }
  ```

- **appConfig** - Application configuration
  ```
  appConfig/maintenance
  {
    enabled: boolean,
    message: string,
    lastUpdated: timestamp
  }
  ```

### Deploying Security Rules

The `firestore.rules` file contains all security rules for the Admin Panel:

```bash
# Deploy rules to Firebase
firebase deploy --only firestore:rules
```

**Key Rules:**
- Only founders can modify roles and create keys
- Only founders can enable maintenance mode
- Admins can view but not modify sensitive data
- Users cannot access admin collections
- Role verification happens on both client and server

## Testing the Admin Panel

### Test Scenarios

1. **Test Role Isolation:**
   - Create test accounts with different roles
   - Verify the Admin tab only appears for admin/founder roles
   - Attempt to manually access `/dashboard?tab=admin` with user role (should not display)

2. **Test Key Generation:**
   - Generate multiple keys as founder
   - Verify they appear in the Premium Keys table
   - Delete a key and verify removal

3. **Test User Management:**
   - Promote a regular user to admin
   - Change admin back to user
   - Verify permissions update in real-time

4. **Test Maintenance Mode:**
   - Enable maintenance mode with custom message
   - Verify message displays to all users
   - Disable and verify system returns to normal

5. **Test Statistics:**
   - Add multiple users
   - Generate some activity
   - Verify statistics update correctly

## Security Best Practices

1. **Role Management:**
   - Never share founder/admin credentials
   - Regularly audit who has admin access
   - Remove admin access when no longer needed

2. **Maintenance Mode:**
   - Test maintenance messages before enabling
   - Set a clear expected downtime duration
   - Notify users before enabling

3. **Key Management:**
   - Generate keys only when needed
   - Delete unused keys regularly
   - Track key distribution for security

4. **Firebase Rules:**
   - Always deploy rules before production
   - Test rules in test environment first
   - Monitor Firestore for unauthorized access attempts

## Environment Variables

No additional environment variables are required. The admin system uses existing Firebase configuration from `.env`.

## Troubleshooting

### Admin Tab Not Showing
- Verify your role is "admin" or "founder" in Firestore
- Hard refresh the page or clear browser cache
- Check browser console for errors
- Verify Firebase connection is working

### Cannot Generate Keys
- Verify you have "founder" role (not just "admin")
- Check Firestore rules are deployed
- Verify `premiumKeys` collection exists in Firestore

### Maintenance Message Not Displaying
- Verify maintenance mode is enabled in Admin Panel
- Check that `appConfig/maintenance` document exists
- Verify Firestore rules allow maintenance mode access

### Statistics Not Loading
- Check that you have "admin" or "founder" role
- Verify network connection and Firebase status
- Check browser console for error messages
- Ensure `userRoles` and `userPlans` collections exist

## API Reference

### Auth Utils Functions

```typescript
// Get user's role from Firestore
const role = await getUserRole(userId);

// Update a user's role (founder only)
await updateUserRole(userId, newRole);

// Permission checking helpers
canAccessAdmin(role);           // admin/founder only
canCreateKeys(role);             // founder only
canManageUsers(role);            // admin/founder
canPerformCriticalActions(role); // founder only
canToggleMaintenance(role);      // founder only
canViewStats(role);              // admin/founder
```

## Future Enhancements

Potential features to add:
- Audit logs for all admin actions
- Two-factor authentication for founder accounts
- API key management
- Custom role creation
- Advanced analytics and reports
- Scheduled maintenance windows
- Email notifications for critical events

## Support

For issues or questions about the Admin Panel:
1. Check this documentation
2. Review Firestore rules in `firestore.rules`
3. Check browser console for error messages
4. Verify Firebase project configuration
