
-- Subscriptions (Stripe-ready, plan-driven)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','team')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','past_due','canceled','trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Per-user monthly usage counter
CREATE TABLE public.usage_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period_start date NOT NULL,
  blueprints_generated int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_start)
);
GRANT SELECT ON public.usage_counters TO authenticated;
GRANT ALL ON public.usage_counters TO service_role;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own usage" ON public.usage_counters FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER set_usage_counters_updated_at BEFORE UPDATE ON public.usage_counters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Versioned blueprint snapshots (audit trail)
CREATE TABLE public.blueprint_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id uuid NOT NULL REFERENCES public.blueprints(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  version int NOT NULL,
  snapshot jsonb NOT NULL,
  change_summary text,
  approved boolean NOT NULL DEFAULT false,
  approved_at timestamptz,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blueprint_id, version)
);
GRANT SELECT, INSERT, UPDATE ON public.blueprint_versions TO authenticated;
GRANT ALL ON public.blueprint_versions TO service_role;
ALTER TABLE public.blueprint_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own blueprint versions" ON public.blueprint_versions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own blueprint versions" ON public.blueprint_versions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users approve own blueprint versions" ON public.blueprint_versions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_blueprint_versions_blueprint ON public.blueprint_versions(blueprint_id, version DESC);

-- Granular audit log
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  blueprint_id uuid REFERENCES public.blueprints(id) ON DELETE CASCADE,
  actor text NOT NULL DEFAULT 'user' CHECK (actor IN ('user','agent','system')),
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own audit log" ON public.audit_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own audit log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_audit_log_blueprint ON public.audit_log(blueprint_id, created_at DESC);
