# Platform Connector Guide

**Status:** [Not Started]  
**Priority:** HIGH  
**Owner:** Connector Team / Backend Lead  
**Estimated Effort:** 10 hours

## Purpose

This document will provide platform-by-platform capabilities, platform limitations and requirements, OAuth setup procedures, error handling strategies, and rate limits for all social media connectors.

## Required Content

### Connector Architecture Overview
- [ ] Base connector pattern
- [ ] Connector registry
- [ ] Adding new connectors
- [ ] Connector lifecycle

### Platform-by-Platform Guide

Each platform section should include:
- Platform capabilities
- Content requirements
- Rate limits
- OAuth setup
- Error handling
- Troubleshooting

---

#### Instagram

**Capabilities**
- [ ] Post types: Photo, Video, Carousel, Reels, Stories
- [ ] Scheduling: Supported
- [ ] Direct publishing: Requires approval
- [ ] Analytics: Supported

**Content Requirements**
- [ ] Image: JPG/PNG, max 8MB, aspect ratio 1.91:1 to 4:5
- [ ] Video: MP4, max 100MB, 3-60 seconds
- [ ] Caption: Max 2,200 characters
- [ ] Hashtags: Max 30
- [ ] Location tagging: Supported
- [ ] User tagging: Supported (max 20)

**Rate Limits**
- [ ] API calls: 200 per hour per user
- [ ] Posts: 25 per day per account
- [ ] Stories: Unlimited

**OAuth Setup**
- [ ] Step 1: Create Facebook App
- [ ] Step 2: Add Instagram API
- [ ] Step 3: Configure OAuth
- [ ] Step 4: Request permissions
- [ ] Required permissions: `instagram_basic`, `instagram_content_publish`

**Error Handling**
- [ ] Rate limit exceeded
- [ ] Invalid media format
- [ ] Caption too long
- [ ] Account not business account

---

#### Facebook

**Capabilities**
- [ ] Post types: Text, Photo, Video, Link
- [ ] Scheduling: Supported
- [ ] Direct publishing: Supported
- [ ] Analytics: Supported
- [ ] Page publishing: Supported
- [ ] Group publishing: Limited

**Content Requirements**
- [ ] Image: JPG/PNG, max 10MB
- [ ] Video: MP4, max 1GB, 240 minutes max
- [ ] Caption: Max 63,206 characters
- [ ] Link preview: Automatic

**Rate Limits**
- [ ] API calls: 200 per hour per user
- [ ] Posts: Unlimited

**OAuth Setup**
- [ ] Step 1: Create Facebook App
- [ ] Step 2: Configure OAuth
- [ ] Step 3: Request permissions
- [ ] Required permissions: `pages_manage_posts`, `pages_read_engagement`

**Error Handling**
- [ ] Token expired
- [ ] Page access revoked
- [ ] Content blocked by policy

---

#### TikTok

**Capabilities**
- [ ] Post types: Video only
- [ ] Scheduling: Limited support
- [ ] Direct publishing: Supported
- [ ] Analytics: Supported
- [ ] Duet/Stitch: Not supported via API

**Content Requirements**
- [ ] Video: MP4/MOV, 50MB-500MB
- [ ] Duration: 3-180 seconds (3 minutes)
- [ ] Caption: Max 2,200 characters
- [ ] Hashtags: Recommended 3-5
- [ ] Sound: Original or library

**Rate Limits**
- [ ] API calls: 1,000 per day
- [ ] Posts: Unlimited

**OAuth Setup**
- [ ] Step 1: Register app on TikTok Developers
- [ ] Step 2: Configure OAuth callback
- [ ] Step 3: Request permissions
- [ ] Required permissions: `video.upload`, `user.info.basic`

**Error Handling**
- [ ] Video processing failed
- [ ] Copyright violation
- [ ] Community guidelines violation

---

#### YouTube

**Capabilities**
- [ ] Post types: Video, Short
- [ ] Scheduling: Supported
- [ ] Direct publishing: Supported
- [ ] Analytics: Supported
- [ ] Playlist management: Supported

**Content Requirements**
- [ ] Video: Multiple formats, max 256GB
- [ ] Duration: Up to 12 hours (verified accounts: unlimited)
- [ ] Title: Max 100 characters
- [ ] Description: Max 5,000 characters
- [ ] Tags: Max 500 characters
- [ ] Thumbnail: JPG/PNG, 2MB, 1280x720

**Rate Limits**
- [ ] API quota: 10,000 units per day
- [ ] Video upload: 1 unit = ~1,600 quota units
- [ ] Daily uploads: ~6 videos per day

**OAuth Setup**
- [ ] Step 1: Create Google Cloud Project
- [ ] Step 2: Enable YouTube Data API
- [ ] Step 3: Configure OAuth
- [ ] Required scopes: `youtube.upload`, `youtube.readonly`

**Error Handling**
- [ ] Quota exceeded
- [ ] Copyright claim
- [ ] Video processing timeout

---

#### LinkedIn

**Capabilities**
- [ ] Post types: Text, Image, Video, Article
- [ ] Scheduling: Supported
- [ ] Direct publishing: Supported
- [ ] Analytics: Supported
- [ ] Company page: Supported

**Content Requirements**
- [ ] Image: JPG/PNG, max 10MB
- [ ] Video: MP4, max 5GB, 3-300 seconds
- [ ] Post text: Max 3,000 characters (1,300 recommended)
- [ ] Hashtags: Supported

**Rate Limits**
- [ ] API calls: 1,000 per day per user
- [ ] Posts: Unlimited

**OAuth Setup**
- [ ] Step 1: Create LinkedIn App
- [ ] Step 2: Configure OAuth
- [ ] Required permissions: `w_member_social`, `r_liteprofile`

**Error Handling**
- [ ] Token expired
- [ ] Invalid media type
- [ ] Content policy violation

---

#### Twitter/X

**Capabilities**
- [ ] Post types: Text, Image, Video, Poll
- [ ] Scheduling: Supported (via platform)
- [ ] Direct publishing: Supported
- [ ] Analytics: Supported
- [ ] Threads: Supported

**Content Requirements**
- [ ] Text: Max 280 characters (or 4,000 with subscription)
- [ ] Image: JPG/PNG/GIF, max 5MB
- [ ] Video: MP4, max 512MB, 140 seconds
- [ ] Images per tweet: Max 4

**Rate Limits**
- [ ] API v2 tweets: 50 per 24 hours (free tier)
- [ ] API v2 reads: Various limits

**OAuth Setup**
- [ ] Step 1: Create Twitter App
- [ ] Step 2: Configure OAuth 1.0a or 2.0
- [ ] Required permissions: `tweet.read`, `tweet.write`

**Error Handling**
- [ ] Rate limit exceeded
- [ ] Duplicate content
- [ ] Suspended account

---

#### Pinterest

**Capabilities**
- [ ] Post types: Pin (Image), Video Pin, Idea Pin
- [ ] Scheduling: Supported
- [ ] Direct publishing: Supported
- [ ] Analytics: Supported
- [ ] Board management: Supported

**Content Requirements**
- [ ] Image: JPG/PNG, max 20MB, aspect ratio 2:3 to 1:3.5
- [ ] Video: MP4/MOV, max 2GB, 4-1800 seconds
- [ ] Title: Max 100 characters
- [ ] Description: Max 500 characters
- [ ] Link: Required

**Rate Limits**
- [ ] API calls: 1,000 per day
- [ ] Pin creation: 200 per day

**OAuth Setup**
- [ ] Step 1: Create Pinterest App
- [ ] Step 2: Configure OAuth
- [ ] Required scopes: `pins:read`, `pins:write`

**Error Handling**
- [ ] Invalid image format
- [ ] Spam detected
- [ ] Board not found

---

### Common Patterns

#### Retry Logic
- [ ] Exponential backoff
- [ ] Max retry attempts
- [ ] Retry status codes (429, 500, 502, 503)

#### Error Categories
- [ ] Authentication errors
- [ ] Authorization errors
- [ ] Validation errors
- [ ] Rate limit errors
- [ ] Platform errors
- [ ] Network errors

#### Publishing Workflow
1. [ ] Validate content
2. [ ] Format for platform
3. [ ] Upload media
4. [ ] Publish or schedule
5. [ ] Handle response
6. [ ] Update status

### Testing Connectors
- [ ] Unit testing with mocks
- [ ] Integration testing with sandboxes
- [ ] Manual testing checklist
- [ ] Test account setup

### Adding New Connectors
- [ ] Step-by-step guide
- [ ] Connector template
- [ ] Required methods
- [ ] Testing requirements
- [ ] Documentation requirements

## Production Impact

**Without this documentation:**
- Unclear platform limitations
- Publishing failures
- Poor error handling
- User confusion
- Support burden

## Related Documents

- docs/ARCHITECTURE.md
- API.md
- API_ERROR_CODES.md
- docs/DEVELOPMENT.md

---

**Note:** This is a placeholder document. Content must be created for successful multi-platform publishing.
