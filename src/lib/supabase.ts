import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  monthly_budget: number;
  created_at: string;
  updated_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  item_name: string;
  amount: number;
  category: 'Food' | 'Shopping' | 'Travel' | 'Bills' | 'Other';
  expense_type: 'need' | 'want';
  date: string;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
};

export type Nudge = {
  id: string;
  user_id: string;
  message: string;
  category: string | null;
  is_read: boolean;
  created_at: string;
};

export type Badge = {
  id: string;
  user_id: string;
  badge_name: string;
  badge_type: string;
  earned_at: string;
};

export type SpendingInsight = {
  id: string;
  user_id: string;
  month: string;
  total_spent: number;
  smart_spend_score: number;
  insights_data: Record<string, any>;
  created_at: string;
};

export type SpendingComparison = {
  id: string;
  user_id: string;
  period_type: 'week' | 'month';
  period_start: string;
  period_end: string;
  total_spent: number;
  category_breakdown: Record<string, number>;
  created_at: string;
};

export type Certificate = {
  id: string;
  user_id: string;
  badge_id: string | null;
  certificate_type: string;
  issued_date: string;
  certificate_data: Record<string, any>;
  created_at: string;
};
