/*
  # Row Level Security Policies

  1. User Profiles
    - Users can read their own profile
    - Users can update their own profile
    - Public profiles are readable by authenticated users

  2. Workspaces
    - Owners can do everything with their workspaces
    - Members can read workspaces they belong to
    - Only owners can delete workspaces

  3. Workspace Members
    - Workspace members can read other members
    - Owners and admins can invite members
    - Members can leave workspaces

  4. Connectors
    - Users can manage their own connectors
    - Workspace members can read workspace connectors

  5. Projects, Content, Media
    - Workspace members can access based on their role
    - Creators can manage their own content
    - Editors can edit content
    - Viewers can only read

  6. Analytics and Schedules
    - Workspace members can read analytics
    - Only editors and above can create schedules
*/

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Workspace owners can do everything"
  ON workspaces FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace members can read workspace"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can read other members"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners and admins can manage members"
  ON workspace_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_members.workspace_id
      AND w.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'admin'
    )
  );

CREATE POLICY "Users can read own connectors"
  ON connectors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own connectors"
  ON connectors FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Workspace members can read workspace connectors"
  ON connectors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = connectors.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can read projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace editors can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Project creators can update their projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Workspace members can read content"
  ON content FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = content.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace contributors can create content"
  ON content FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = content.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor', 'contributor')
    )
  );

CREATE POLICY "Content creators can update their content"
  ON content FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = content.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Content creators can delete their content"
  ON content FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = content.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace members can read media"
  ON media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = media.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace contributors can upload media"
  ON media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = media.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor', 'contributor')
    )
  );

CREATE POLICY "Workspace members can read content_media"
  ON content_media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM content c
      JOIN workspace_members wm ON wm.workspace_id = c.workspace_id
      WHERE c.id = content_media.content_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Content creators can manage content_media"
  ON content_media FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM content c
      WHERE c.id = content_media.content_id
      AND (
        c.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = c.workspace_id
          AND wm.user_id = auth.uid()
          AND wm.role IN ('owner', 'admin', 'editor')
        )
      )
    )
  );

CREATE POLICY "Workspace members can read published posts"
  ON published_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM content c
      JOIN workspace_members wm ON wm.workspace_id = c.workspace_id
      WHERE c.id = published_posts.content_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage published posts"
  ON published_posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM content c
      WHERE c.id = published_posts.content_id
      AND (
        c.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = c.workspace_id
          AND wm.user_id = auth.uid()
          AND wm.role IN ('owner', 'admin', 'editor')
        )
      )
    )
  );

CREATE POLICY "Workspace members can read analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM published_posts pp
      JOIN content c ON c.id = pp.content_id
      JOIN workspace_members wm ON wm.workspace_id = c.workspace_id
      WHERE pp.id = analytics.post_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics"
  ON analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Workspace members can read schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = schedules.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace editors can create schedules"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = schedules.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Schedule creators can update schedules"
  ON schedules FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = schedules.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Schedule creators can delete schedules"
  ON schedules FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = schedules.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );
