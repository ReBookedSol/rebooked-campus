-- Add credits column to profiles table to track user rewards
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 0;

-- Create offerwall_completions table to track completed offers
CREATE TABLE IF NOT EXISTS public.offerwall_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id TEXT NOT NULL,
  reward_amount INTEGER NOT NULL DEFAULT 1,
  currency TEXT NOT NULL DEFAULT 'credits',
  provider TEXT,
  raw_payload JSONB,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on offerwall_completions
ALTER TABLE public.offerwall_completions ENABLE ROW LEVEL SECURITY;

-- Users can view their own completions
CREATE POLICY "Users can view own completions"
  ON public.offerwall_completions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_offerwall_completions_user_id ON public.offerwall_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_completions_offer_id ON public.offerwall_completions(offer_id);

-- Create function to increment user credits
CREATE OR REPLACE FUNCTION public.increment_user_credits(p_user_id UUID, p_amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET credits = COALESCE(credits, 0) + p_amount
  WHERE id = p_user_id;
END;
$$;