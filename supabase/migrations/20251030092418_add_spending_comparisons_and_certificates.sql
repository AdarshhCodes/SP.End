/*
  # Add Spending Comparisons and Certificates

  ## Overview
  Adds functionality for weekly/monthly spending comparisons and badge certificates.

  ## New Tables

  ### 1. `spending_comparisons`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `period_type` (text: 'week' or 'month')
  - `period_start` (date)
  - `period_end` (date)
  - `total_spent` (numeric)
  - `category_breakdown` (jsonb - stores spending by category)
  - `created_at` (timestamptz)

  ### 2. `certificates`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `badge_id` (uuid, references badges)
  - `certificate_type` (text: achievement type)
  - `issued_date` (date)
  - `certificate_data` (jsonb - stores certificate details like username, badge name, etc.)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all new tables
  - Users can only access their own data
*/

-- Create spending_comparisons table
CREATE TABLE IF NOT EXISTS spending_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  period_type text NOT NULL CHECK (period_type IN ('week', 'month')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_spent numeric DEFAULT 0,
  category_breakdown jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period_type, period_start, period_end)
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  certificate_type text NOT NULL,
  issued_date date DEFAULT CURRENT_DATE,
  certificate_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE spending_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Spending comparisons policies
CREATE POLICY "Users can view own spending comparisons"
  ON spending_comparisons FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spending comparisons"
  ON spending_comparisons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spending comparisons"
  ON spending_comparisons FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certificates"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own certificates"
  ON certificates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_spending_comparisons_user_id ON spending_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_spending_comparisons_period ON spending_comparisons(period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_badge_id ON certificates(badge_id);