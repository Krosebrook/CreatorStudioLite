# API Documentation

This document describes the API endpoints and services available in the Amplify Creator Platform.

## Table of Contents

- [Authentication](#authentication)
- [Content Management](#content-management)
- [Analytics](#analytics)
- [Connectors](#connectors)
- [Payments](#payments)
- [Team Management](#team-management)
- [Media Management](#media-management)

## Base URL

```
Development: http://localhost:5173
Production: https://your-domain.com
```

## Authentication

All API requests require authentication via Supabase Auth.

### Sign Up

```typescript
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Sign In

```typescript
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Sign Out

```typescript
POST /auth/logout
Authorization: Bearer {access_token}
```

## Content Management

### Create Content

```typescript
POST /api/content
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "My Post Title",
  "content": "Post content goes here...",
  "type": "post",
  "platforms": ["instagram", "facebook"],
  "scheduledDate": "2025-01-01T12:00:00Z",
  "status": "draft"
}
```

**Response:**
```json
{
  "id": "content_123",
  "title": "My Post Title",
  "content": "Post content goes here...",
  "type": "post",
  "status": "draft",
  "platforms": ["instagram", "facebook"],
  "scheduledDate": "2025-01-01T12:00:00Z",
  "createdAt": "2024-12-15T10:00:00Z",
  "updatedAt": "2024-12-15T10:00:00Z"
}
```

### Get All Content

```typescript
GET /api/content?page=1&limit=20&status=draft
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (draft, scheduled, published, failed)
- `platform` (optional): Filter by platform

**Response:**
```json
{
  "data": [
    {
      "id": "content_123",
      "title": "My Post Title",
      "content": "Post content...",
      "status": "draft"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Get Single Content

```typescript
GET /api/content/{contentId}
Authorization: Bearer {access_token}
```

### Update Content

```typescript
PUT /api/content/{contentId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "scheduled"
}
```

### Delete Content

```typescript
DELETE /api/content/{contentId}
Authorization: Bearer {access_token}
```

### Publish Content

```typescript
POST /api/content/{contentId}/publish
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "platforms": ["instagram", "facebook"]
}
```

## Analytics

### Get Dashboard Metrics

```typescript
GET /api/analytics/dashboard?timeRange=30d&platform=all
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `timeRange`: 7d, 30d, 90d, 12m
- `platform`: all, instagram, facebook, twitter, linkedin, tiktok, youtube

**Response:**
```json
{
  "summary": {
    "totalViews": 125000,
    "totalLikes": 8500,
    "totalComments": 450,
    "engagementRate": 7.16,
    "growth": {
      "views": 12.5,
      "likes": 8.3,
      "comments": -2.1
    }
  },
  "platformBreakdown": [
    {
      "platform": "instagram",
      "views": 75000,
      "likes": 5000,
      "comments": 300
    }
  ],
  "topContent": [
    {
      "id": "content_123",
      "title": "Best Post Ever",
      "views": 25000,
      "engagement": 12.5
    }
  ]
}
```

### Get Content Performance

```typescript
GET /api/analytics/content/{contentId}
Authorization: Bearer {access_token}
```

### Export Analytics

```typescript
GET /api/analytics/export?format=csv&timeRange=30d
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `format`: csv, json
- `timeRange`: 7d, 30d, 90d, 12m

## Connectors

### List Connected Accounts

```typescript
GET /api/connectors
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "connectors": [
    {
      "id": "connector_123",
      "platform": "instagram",
      "accountName": "@myaccount",
      "status": "connected",
      "lastSync": "2024-12-15T09:00:00Z"
    }
  ]
}
```

### Connect Platform

```typescript
POST /api/connectors/connect
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "platform": "instagram"
}
```

**Response:**
```json
{
  "authUrl": "https://api.instagram.com/oauth/authorize?...",
  "state": "random_state_token"
}
```

### Disconnect Platform

```typescript
DELETE /api/connectors/{connectorId}
Authorization: Bearer {access_token}
```

### Get Platform Metrics

```typescript
GET /api/connectors/{connectorId}/metrics
Authorization: Bearer {access_token}
```

## Payments

### Get Subscription Plans

```typescript
GET /api/payments/plans
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "price": 9.99,
      "interval": "month",
      "features": [
        "10 posts/month",
        "5GB storage",
        "100 AI credits"
      ]
    }
  ]
}
```

### Create Subscription

```typescript
POST /api/payments/subscriptions
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "planId": "starter",
  "paymentMethodId": "pm_123"
}
```

### Get Current Subscription

```typescript
GET /api/payments/subscription
Authorization: Bearer {access_token}
```

### Cancel Subscription

```typescript
POST /api/payments/subscription/cancel
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "cancelAtPeriodEnd": true
}
```

### Update Payment Method

```typescript
PUT /api/payments/payment-method
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "paymentMethodId": "pm_456"
}
```

## Team Management

### Get Team Members

```typescript
GET /api/team/members
Authorization: Bearer {access_token}
```

### Invite Team Member

```typescript
POST /api/team/invite
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "email": "newmember@example.com",
  "role": "editor"
}
```

**Roles:**
- `admin`: Full access
- `editor`: Create and edit content
- `viewer`: Read-only access

### Remove Team Member

```typescript
DELETE /api/team/members/{memberId}
Authorization: Bearer {access_token}
```

### Update Member Role

```typescript
PUT /api/team/members/{memberId}/role
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "role": "editor"
}
```

## Media Management

### Upload Media

```typescript
POST /api/media/upload
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "file": <binary data>,
  "type": "image"
}
```

**Response:**
```json
{
  "id": "media_123",
  "url": "https://storage.supabase.co/...",
  "type": "image",
  "size": 1024000,
  "dimensions": {
    "width": 1080,
    "height": 1920
  }
}
```

### List Media

```typescript
GET /api/media?type=image&page=1&limit=20
Authorization: Bearer {access_token}
```

### Delete Media

```typescript
DELETE /api/media/{mediaId}
Authorization: Bearer {access_token}
```

### Get Media Details

```typescript
GET /api/media/{mediaId}
Authorization: Bearer {access_token}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "invalid_request",
  "message": "Missing required field: title"
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Content not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

API requests are rate limited:
- **Free Tier**: 100 requests per hour
- **Starter Plan**: 1,000 requests per hour
- **Professional Plan**: 10,000 requests per hour
- **Enterprise Plan**: Unlimited

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

## Webhooks

Configure webhooks to receive real-time notifications:

### Available Events

- `content.published`
- `content.failed`
- `analytics.updated`
- `subscription.created`
- `subscription.cancelled`
- `team.member_added`
- `team.member_removed`

### Webhook Payload

```json
{
  "event": "content.published",
  "timestamp": "2024-12-15T10:00:00Z",
  "data": {
    "contentId": "content_123",
    "platforms": ["instagram", "facebook"],
    "status": "published"
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Create content
const { data, error } = await supabase
  .from('content')
  .insert({
    title: 'My Post',
    content: 'Content here...',
    status: 'draft'
  })
```

### cURL

```bash
curl -X POST https://your-domain.com/api/content \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Post",
    "content": "Content here...",
    "status": "draft"
  }'
```

## Testing

Use the following test credentials for development:
- Email: `test@example.com`
- Password: `testPassword123`

**Note**: These credentials only work in development environment.

## Support

For API issues or questions:
- Check [GitHub Issues](https://github.com/Krosebrook/CreatorStudioLite/issues)
- Review [README.md](README.md) for setup instructions
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides

---

**API Version**: 1.0.0  
**Last Updated**: 2025
