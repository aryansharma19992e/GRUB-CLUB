# Restaurant Cleanup Guide

## Problem Description
When a restaurant owner user is deleted, the associated restaurant record becomes "orphaned" because it still references the deleted user's ID. This causes database constraint issues and prevents the restaurant from being deleted or modified.

## Root Causes
1. **Duplicate Restaurant Creation**: The registration logic was creating restaurants twice
2. **Missing Cascade Delete**: No cleanup when users are deleted
3. **Invalid References**: Restaurants with non-existent ownerId references

## Solutions Implemented

### 1. Fixed Registration Logic
- **File**: `app/api/auth/register/route.ts`
- **Changes**: Prevented duplicate restaurant creation and improved invite code handling
- **Result**: Only one restaurant per owner, no more orphaned records

### 2. Added Database Constraints
- **File**: `models/Restaurant.ts`
- **Changes**: Added pre-save validation and safeDelete method
- **Result**: Prevents invalid ownerId references and safe cleanup

### 3. Created Cleanup Tools
- **File**: `scripts/cleanup-orphaned-restaurants.js`
- **Purpose**: Find and remove orphaned restaurant records
- **File**: `scripts/admin-utils.js`
- **Purpose**: Comprehensive restaurant management utilities

## How to Fix Your Current Issue

### Step 1: Identify Orphaned Restaurants
```bash
node scripts/admin-utils.js find-orphaned
```

This will show you all restaurants with invalid owner references.

### Step 2: Clean Up Orphaned Records
```bash
# First, review what will be deleted (dry run)
node scripts/admin-utils.js cleanup

# If you're satisfied, edit the script to uncomment the deletion line
# Then run again to actually delete
node scripts/admin-utils.js cleanup
```

### Step 3: Alternative - Reassign to New Owner
If you want to keep the restaurant but assign it to a different user:
```bash
node scripts/admin-utils.js reassign <restaurantId> <newOwnerId>
```

## Prevention for Future

### 1. Use Safe Delete API
Always use the new DELETE endpoint for restaurants:
```
DELETE /api/restaurants/[id]
```

This endpoint uses the `safeDelete` method that properly cleans up related data.

### 2. Database Validation
The Restaurant model now validates ownerId references before saving, preventing future orphaned records.

### 3. Proper User Deletion
When deleting users, ensure you also delete their associated restaurants or reassign them.

## Available Admin Commands

```bash
# List all restaurants with owner status
node scripts/admin-utils.js list

# Find orphaned restaurants
node scripts/admin-utils.js find-orphaned

# Clean up orphaned restaurants (dry run first)
node scripts/admin-utils.js cleanup

# Reassign restaurant to new owner
node scripts/admin-utils.js reassign <restaurantId> <newOwnerId>
```

## Database Schema Changes

### Restaurant Model Updates
- Added pre-save validation for ownerId
- Added safeDelete static method
- Improved indexing for better performance

### API Endpoints
- New DELETE endpoint with proper cleanup
- Better error handling and validation

## Testing the Fix

1. **Run the cleanup script** to remove orphaned records
2. **Try deleting a restaurant** using the new DELETE API
3. **Verify no more timeout errors** in your database explorer
4. **Test user registration** to ensure no duplicate restaurants

## Monitoring

Regularly run the admin utilities to check for any new orphaned records:
```bash
node scripts/admin-utils.js list
```

This will show you the status of all restaurants and their owners.

## Support

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Verify your MongoDB connection string
3. Ensure all models are properly imported
4. Check that the database user has proper permissions

## Files Modified
- `app/api/auth/register/route.ts` - Fixed duplicate restaurant creation
- `models/Restaurant.ts` - Added validation and safeDelete method
- `app/api/restaurants/[id]/route.ts` - Added DELETE endpoint
- `scripts/cleanup-orphaned-restaurants.js` - Cleanup utility
- `scripts/admin-utils.js` - Admin management tools 