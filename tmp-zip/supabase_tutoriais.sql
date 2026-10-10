CREATE TABLE IF NOT EXISTS public.tutoriais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_slug text NOT NULL DEFAULT 'fiscal-connect',
  titulo text NOT NULL,
  youtube_url text NOT NULL,
  ordem int NOT NULL DEFAULT 1,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tutoriais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tutoriais_select_auth ON public.tutoriais;
CREATE POLICY tutoriais_select_auth ON public.tutoriais
  FOR SELECT TO authenticated
  USING (ativo = true OR EXISTS (SELECT 1 FROM public.admins a WHERE lower(a.email) = lower(coalesce(auth.jwt()->>'email',''))));

DROP POLICY IF EXISTS tutoriais_admin_all ON public.tutoriais;
CREATE POLICY tutoriais_admin_all ON public.tutoriais
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE lower(a.email) = lower(coalesce(auth.jwt()->>'email',''))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE lower(a.email) = lower(coalesce(auth.jwt()->>'email',''))));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutoriais TO authenticated;
GRANT ALL ON public.tutoriais TO service_role;

NOTIFY pgrst, 'reload schema';
