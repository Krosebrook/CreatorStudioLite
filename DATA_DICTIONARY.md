# Data Dictionary

**Status:** [Not Started]  
**Priority:** HIGH  
**Owner:** Backend Lead + Database Specialist  
**Estimated Effort:** 10 hours

## Purpose

This document will provide complete field definitions, data types, constraints, enum values, and data lifecycle documentation for all database tables.

## Required Content

### Field Definitions
- [ ] Complete field definitions for all tables
- [ ] Business meaning of each field
- [ ] Data types and PostgreSQL types
- [ ] Constraints (NOT NULL, UNIQUE, CHECK, etc.)
- [ ] Default values and their rationale

### Enum Values & Meanings
- [ ] All enum types documented
- [ ] Enum value meanings
- [ ] When to use each enum value
- [ ] Enum value transitions (state machines)
- [ ] Deprecated enum values

### Relationships
- [ ] Foreign key relationships
- [ ] One-to-many relationships
- [ ] Many-to-many relationships
- [ ] Self-referential relationships
- [ ] Polymorphic relationships (if any)

### Data Lifecycle
- [ ] Data creation rules
- [ ] Data update rules
- [ ] Data retention policies by table
- [ ] Archival procedures
- [ ] Data deletion procedures
- [ ] Soft delete vs hard delete
- [ ] Anonymization procedures

### Deprecated Fields
- [ ] List of deprecated fields
- [ ] Deprecation timeline
- [ ] Migration path from deprecated fields
- [ ] When deprecated fields will be removed

### Special Fields
- [ ] Computed fields
- [ ] Generated fields
- [ ] Virtual columns
- [ ] Trigger-managed fields
- [ ] System fields (created_at, updated_at, etc.)

### Data Quality
- [ ] Data validation rules
- [ ] Data consistency checks
- [ ] Data integrity constraints
- [ ] Data quality metrics

## Tables to Document

### Core Tables
- users
- workspaces
- workspace_members
- roles
- permissions

### Content Tables
- content
- content_versions
- scheduled_posts
- published_posts
- templates

### Analytics Tables
- analytics_events
- content_performance
- platform_metrics
- audience_insights
- viral_predictions

### Integration Tables
- social_accounts
- oauth_tokens
- platform_connections

### Payment Tables
- subscriptions
- invoices
- payment_methods
- usage_records

### System Tables
- audit_logs
- notifications
- jobs
- migrations

## Production Impact

**Without this documentation:**
- Developers misunderstand data meanings
- Incorrect data entry
- Data quality issues
- Poor query design
- Difficulty onboarding new developers

## Related Documents

- DATABASE_SCHEMA.md
- MIGRATION_GUIDE.md
- docs/ARCHITECTURE.md
- API.md

---

**Note:** This is a placeholder document. Content must be created for data integrity and developer productivity.
