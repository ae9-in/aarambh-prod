-- Arambh initial schema
-- Generated from system prompt specification

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ORGANIZATIONS
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#FF6B35',
  plan TEXT DEFAULT 'free'
    CHECK (plan IN ('free','starter','pro','enterprise')),
  max_users INTEGER DEFAULT 10,
  max_storage_gb INTEGER DEFAULT 5,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) 
    ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'New User',
  email TEXT NOT NULL,
  role TEXT DEFAULT 'EMPLOYEE'
    CHECK (role IN (
      'SUPER_ADMIN','ADMIN','MANAGER',
      'EMPLOYEE','VIEWER'
    )),
  department TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','inactive','pending')),
  xp_points INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Fresher',
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active DATE,
  score INTEGER DEFAULT 0,
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  rank_change INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) 
    ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#FF6B35',
  order_index INTEGER DEFAULT 0,
  parent_id UUID REFERENCES categories(id) 
    ON DELETE SET NULL,
  lesson_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) 
    ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTENT (LESSONS)
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) 
    ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) 
    ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL
    CHECK (type IN (
      'VIDEO','PDF','AUDIO','IMAGE',
      'PPT','NOTE','LINK','QUIZ'
    )),
  file_url TEXT,
  firebase_path TEXT,
  file_size BIGINT DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 50,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES profiles(id) 
    ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTENT ACCESS CONTROL
CREATE TABLE content_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) 
    ON DELETE CASCADE,
  allowed_roles TEXT[] DEFAULT ARRAY['EMPLOYEE'],
  allowed_user_ids UUID[] DEFAULT '{}',
  blocked_user_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER PROGRESS
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) 
    ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) 
    ON DELETE CASCADE,
  status TEXT DEFAULT 'NOT_STARTED'
    CHECK (status IN (
      'NOT_STARTED','IN_PROGRESS','COMPLETED'
    )),
  progress_percent INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  is_bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- QUIZZES
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) 
    ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) 
    ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  time_limit_seconds INTEGER DEFAULT 600,
  pass_percent INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  xp_reward_pass INTEGER DEFAULT 100,
  xp_reward_fail INTEGER DEFAULT 25,
  difficulty TEXT DEFAULT 'Medium'
    CHECK (difficulty IN ('Easy','Medium','Hard')),
  avg_score INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) 
    ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUIZ ATTEMPTS
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) 
    ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) 
    ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  time_taken_seconds INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  attempt_number INTEGER DEFAULT 1,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- CERTIFICATES
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) 
    ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) 
    ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) 
    ON DELETE SET NULL,
  course_name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  certificate_number TEXT UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- BADGES
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) 
    ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  condition_type TEXT NOT NULL
    CHECK (condition_type IN (
      'LESSONS_COMPLETED','XP_EARNED',
      'STREAK_DAYS','QUIZ_PASSED',
      'PERFECT_SCORE','FIRST_LESSON',
      'SPEED_LEARNER','CONSISTENT'
    )),
  condition_value INTEGER DEFAULT 1,
  xp_bonus INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common'
    CHECK (rarity IN ('common','rare','epic','legendary')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER BADGES
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) 
    ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) 
    ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) 
    ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) 
    ON DELETE CASCADE,
  type TEXT NOT NULL
    CHECK (type IN (
      'achievement','content','quiz',
      'system','reminder','social'
    )),
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACCESS LOGS (for heatmap + audit)
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) 
    ON DELETE SET NULL,
  content_id UUID REFERENCES content(id) 
    ON DELETE SET NULL,
  org_id UUID REFERENCES organizations(id) 
    ON DELETE CASCADE,
  action TEXT NOT NULL
    CHECK (action IN (
      'VIEW','COMPLETE','DOWNLOAD',
      'SHARE','QUIZ_START','QUIZ_COMPLETE',
      'LOGIN','LOGOUT'
    )),
  ip_address TEXT,
  user_agent TEXT,
  duration_seconds INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI CHUNKS (for RAG)
CREATE TABLE ai_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) 
    ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) 
    ON DELETE CASCADE,
  allowed_roles TEXT[] DEFAULT ARRAY['EMPLOYEE'],
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON ai_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- AI CHAT SESSIONS
CREATE TABLE ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) 
    ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) 
    ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI CHAT MESSAGES
CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES ai_chat_sessions(id) 
    ON DELETE CASCADE,
  role TEXT NOT NULL 
    CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WEEKLY ACTIVITY (for charts)
CREATE TABLE weekly_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) 
    ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) 
    ON DELETE CASCADE,
  date DATE NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  minutes_spent INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- PERMISSIONS
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) 
    ON DELETE CASCADE,
  role TEXT NOT NULL,
  permission_key TEXT NOT NULL,
  is_allowed BOOLEAN DEFAULT true,
  UNIQUE(org_id, role, permission_key)
);

-- ════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_activity ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles in org"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('ADMIN','SUPER_ADMIN','MANAGER')
      AND p.org_id = profiles.org_id
    )
  );

-- Content policies
CREATE POLICY "Users read published content in org"
  ON content FOR SELECT
  USING (
    is_published = true
    AND org_id IN (
      SELECT org_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins manage content"
  ON content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('ADMIN','SUPER_ADMIN','MANAGER')
    )
  );

-- Progress policies
CREATE POLICY "Users manage own progress"
  ON user_progress FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins read all progress"
  ON user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('ADMIN','SUPER_ADMIN','MANAGER')
    )
  );

-- Notifications policies
CREATE POLICY "Users manage own notifications"
  ON notifications FOR ALL
  USING (user_id = auth.uid());

-- Quiz attempts policies
CREATE POLICY "Users manage own attempts"
  ON quiz_attempts FOR ALL
  USING (user_id = auth.uid());

-- Certificates policies
CREATE POLICY "Users read own certificates"
  ON certificates FOR SELECT
  USING (user_id = auth.uid());

-- User badges policies
CREATE POLICY "Users read own badges"
  ON user_badges FOR SELECT
  USING (user_id = auth.uid());

-- Weekly activity policies
CREATE POLICY "Users manage own activity"
  ON weekly_activity FOR ALL
  USING (user_id = auth.uid());

-- AI chat policies
CREATE POLICY "Users manage own chat"
  ON ai_chat_messages FOR ALL
  USING (
    session_id IN (
      SELECT id FROM ai_chat_sessions
      WHERE user_id = auth.uid()
    )
  );

-- AI chunks readable by org members
CREATE POLICY "Org members read ai chunks"
  ON ai_chunks FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles
      WHERE id = auth.uid()
    )
  );

-- ════════════════════════════════════
-- FUNCTIONS AND TRIGGERS
-- ════════════════════════════════════

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role, org_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'role', 
      'EMPLOYEE'
    ),
    CASE 
      WHEN NEW.raw_user_meta_data->>'org_id' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'org_id')::UUID
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update category lesson count trigger
CREATE OR REPLACE FUNCTION update_category_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories 
    SET lesson_count = lesson_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET lesson_count = GREATEST(lesson_count - 1, 0)
    WHERE id = OLD.category_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_content_lesson_count
  AFTER INSERT OR DELETE ON content
  FOR EACH ROW EXECUTE FUNCTION update_category_lesson_count();

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_count INT DEFAULT 5,
  filter_org_id UUID DEFAULT NULL,
  filter_role TEXT DEFAULT 'EMPLOYEE'
)
RETURNS TABLE (
  id UUID,
  content_id UUID,
  chunk_text TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.id,
    ac.content_id,
    ac.chunk_text,
    1 - (ac.embedding <=> query_embedding) AS similarity
  FROM ai_chunks ac
  WHERE
    (filter_org_id IS NULL OR ac.org_id = filter_org_id)
    AND filter_role = ANY(ac.allowed_roles)
  ORDER BY ac.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

