CREATE TABLE public.blueprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Blueprint',
  status TEXT NOT NULL DEFAULT 'pending',
  analysis JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blueprints TO authenticated;
GRANT ALL ON public.blueprints TO service_role;

ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own blueprints" ON public.blueprints FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own blueprints" ON public.blueprints FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own blueprints" ON public.blueprints FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own blueprints" ON public.blueprints FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX blueprints_user_created_idx ON public.blueprints(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_blueprints_updated_at
BEFORE UPDATE ON public.blueprints
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();