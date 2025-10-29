/*
  # SmartSpend Database Schema

  ## Overview
  Complete database schema for SmartSpend personal finance app with ethical nudge engine.

  ## New Tables

  ### 1. `users` (handled by Supabase Auth)
  - Uses built-in auth.users table
  - Extended with profiles table for additional user data

  ### 2. `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `name` (text)
  - `monthly_budget` (numeric, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `expenses`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `item_name` (text)
  - `amount` (numeric)
  - `category` (text: Food, Shopping, Travel, Bills, Other)
  - `expense_type` (text: need/want - for context-aware categorization)
  - `date` (date)
  - `created_at` (timestamptz)

  ### 4. `goals`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `target_amount` (numeric)
  - `current_amount` (numeric, default 0)
  - `deadline` (date)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `nudges`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `message` (text)
  - `category` (text)
  - `is_read` (boolean, default false)
  - `created_at` (timestamptz)

  ### 6. `badges`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `badge_name` (text)
  - `badge_type` (text: savings_streak, budget_keeper, smart_spender)
  - `earned_at` (timestamptz)

  ### 7. `spending_insights`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `month` (date)
  - `total_spent` (numeric)
  - `smart_spend_score` (integer, 0-100)
  - `insights_data` (jsonb - stores category breakdowns, trends)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Policies for authenticated users only
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  monthly_budget numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_name text NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  expense_type text DEFAULT 'want',
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  target_amount numeric NOT NULL,
  current_amount numeric DEFAULT 0,
  deadline date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create nudges table
CREATE TABLE IF NOT EXISTS nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  category text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_name text NOT NULL,
  badge_type text NOT NULL,
  earned_at timestamptz DEFAULT now()
);

-- Create spending_insights table
CREATE TABLE IF NOT EXISTS spending_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  month date NOT NULL,
  total_spent numeric DEFAULT 0,
  smart_spend_score integer DEFAULT 0,
  insights_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_insights ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Expenses policies
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Nudges policies
CREATE POLICY "Users can view own nudges"
  ON nudges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nudges"
  ON nudges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nudges"
  ON nudges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own nudges"
  ON nudges FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Users can view own badges"
  ON badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Spending insights policies
CREATE POLICY "Users can view own insights"
  ON spending_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON spending_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON spending_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_nudges_user_id ON nudges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_spending_insights_user_id ON spending_insights(user_id);