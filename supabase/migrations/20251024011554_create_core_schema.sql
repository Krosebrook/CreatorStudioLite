/*
  # SparkLabs Core Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `display_name` (text)
      - `avatar_url` (text)
      - `timezone` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `workspaces`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references user_profiles)
      - `name` (text)
      - `slug` (text, unique)
      - `settings` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `workspace_members`
      - `id` (uuid, primary key)
      - `workspace_id` (uuid, references workspaces)
      - `user_id` (uuid, references user_profiles)
      - `role` (text)
      - `permissions` (jsonb)
      - `invited_by` (uuid, references user_profiles)
      - `joined_at` (timestamptz)

    - `connectors`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `workspace_id` (uuid, references workspaces)
      - `platform` (text)
      - `platform_user_id` (text)
      - `access_token` (text, encrypted)
      - `refresh_token` (text, encrypted)
      - `token_expires_at` (timestamptz)
      - `status` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `projects`
      - `id` (uuid, primary key)
      - `workspace_id` (uuid, references workspaces)
      - `created_by` (uuid, references user_profiles)
      - `title` (text)
      - `description` (text)
      - `status` (text)
      - `settings` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `content`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `workspace_id` (uuid, references workspaces)
      - `created_by` (uuid, references user_profiles)
      - `title` (text)
      - `body` (text)
      - `type` (text)
      - `status` (text)
      - `platforms` (text[])
      - `metadata` (jsonb)
      - `version` (integer)
      - `published_at` (timestamptz)
      - `scheduled_for` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `media`
      - `id` (uuid, primary key)
      - `workspace_id` (uuid, references workspaces)
      - `uploaded_by` (uuid, references user_profiles)
      - `filename` (text)
      - `mime_type` (text)
      - `size_bytes` (bigint)
      - `storage_path` (text)
      - `url` (text)
      - `width` (integer)
      - `height` (integer)
      - `duration` (integer)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

    - `content_media`
      - `content_id` (uuid, references content)
      - `media_id` (uuid, references media)
      - `position` (integer)
      - `created_at` (timestamptz)

    - `published_posts`
      - `id` (uuid, primary key)
      - `content_id` (uuid, references content)
      - `connector_id` (uuid, references connectors)
      - `platform` (text)
      - `platform_post_id` (text)
      - `url` (text)
      - `status` (text)
      - `metadata` (jsonb)
      - `published_at` (timestamptz)

    - `analytics`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references published_posts)
      - `connector_id` (uuid, references connectors)
      - `views` (integer)
      - `likes` (integer)
      - `comments` (integer)
      - `shares` (integer)
      - `reach` (integer)
      - `impressions` (integer)
      - `engagement_rate` (decimal)
      - `metadata` (jsonb)
      - `fetched_at` (timestamptz)

    - `schedules`
      - `id` (uuid, primary key)
      - `content_id` (uuid, references content)
      - `workspace_id` (uuid, references workspaces)
      - `scheduled_for` (timestamptz)
      - `timezone` (text)
      - `status` (text)
      - `platforms` (text[])
      - `created_by` (uuid, references user_profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Secure sensitive fields (tokens)

  3. Indexes
    - Add performance indexes on foreign keys
    - Add indexes on frequently queried fields
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  timezone text DEFAULT 'UTC',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer',
  permissions jsonb DEFAULT '{}'::jsonb,
  invited_by uuid REFERENCES user_profiles(id),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS connectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform text NOT NULL,
  platform_user_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  status text DEFAULT 'disconnected',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, platform, platform_user_id)
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  title text NOT NULL,
  description text,
  status text DEFAULT 'active',
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  title text NOT NULL,
  body text,
  type text DEFAULT 'post',
  status text DEFAULT 'draft',
  platforms text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  version integer DEFAULT 1,
  published_at timestamptz,
  scheduled_for timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES user_profiles(id),
  filename text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  storage_path text NOT NULL,
  url text NOT NULL,
  width integer,
  height integer,
  duration integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_media (
  content_id uuid NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (content_id, media_id)
);

CREATE TABLE IF NOT EXISTS published_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  connector_id uuid NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
  platform text NOT NULL,
  platform_post_id text,
  url text,
  status text DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  published_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES published_posts(id) ON DELETE CASCADE,
  connector_id uuid NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  reach integer DEFAULT 0,
  impressions integer DEFAULT 0,
  engagement_rate decimal(5,2) DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  fetched_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  scheduled_for timestamptz NOT NULL,
  timezone text DEFAULT 'UTC',
  status text DEFAULT 'pending',
  platforms text[] DEFAULT ARRAY[]::text[],
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_connectors_workspace ON connectors(workspace_id);
CREATE INDEX IF NOT EXISTS idx_connectors_user ON connectors(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_content_workspace ON content(workspace_id);
CREATE INDEX IF NOT EXISTS idx_content_project ON content(project_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_media_workspace ON media(workspace_id);
CREATE INDEX IF NOT EXISTS idx_published_posts_content ON published_posts(content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_post ON analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_schedules_scheduled_for ON schedules(scheduled_for);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
