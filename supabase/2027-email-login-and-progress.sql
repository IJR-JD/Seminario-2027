-- Seminario 2027 · Institutional email roster matching and personal practice progress.
-- PRECONDITION: Run supabase/schema.sql first in PROJECT wtqtzfdubrhjudcnmvgf.
-- ADMIN ACTION: import authorized email/name/group pairs into seminar_students using a private channel.
-- NO STUDENT PERSONAL DATA IN THIS PUBLIC MIGRATION.
ALTER TABLE public.seminar_students
  ADD COLUMN IF NOT EXISTS institutional_email text;

CREATE UNIQUE INDEX IF NOT EXISTS seminar_students_email_year_uq
 ON public.seminar_students(lower(institutional_email),academic_year)
 WHERE institutional_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS seminar_students_auth_user_id_idx
 ON public.seminar_students(auth_user_id);

ALTER TABLE public.seminar_students ENABLE ROW LEVEL SECURITY;

-- Authenticated identity can only see an enrollment matched to its VERIFIED institutional account.
DROP POLICY IF EXISTS "student reads matched verified email roster" ON public.seminar_students;
CREATE POLICY "student reads matched verified email roster"
 ON public.seminar_students FOR SELECT TO authenticated
 USING (
    institutional_email IS NOT NULL
    AND lower(institutional_email) = lower((auth.jwt() ->> 'email'))
    AND split_part(lower(institutional_email),'@',2) = 'ijr.edu.co'
    AND (auth_user_id IS NULL OR auth_user_id = (SELECT auth.uid()))
 );

-- Authenticated student may claim ONLY the auth_user_id column of their own roster entry.
-- Do not grant UPDATE on name, email, group or year.
DROP POLICY IF EXISTS "student links own roster identity" ON public.seminar_students;
CREATE POLICY "student links own roster identity"
 ON public.seminar_students FOR UPDATE TO authenticated
 USING (
   institutional_email IS NOT NULL
   AND lower(institutional_email) = lower((auth.jwt() ->> 'email'))
   AND (auth_user_id IS NULL OR auth_user_id = (SELECT auth.uid()))
 )
 WITH CHECK (
   institutional_email IS NOT NULL
   AND lower(institutional_email) = lower((auth.jwt() ->> 'email'))
   AND auth_user_id = (SELECT auth.uid())
 );

REVOKE ALL ON TABLE public.seminar_students FROM anon;
GRANT SELECT ON TABLE public.seminar_students TO authenticated;
GRANT UPDATE (auth_user_id) ON TABLE public.seminar_students TO authenticated;

-- Learning progress is self-reported / output-checked. It is NOT an official grade.
CREATE TABLE IF NOT EXISTS public.seminar_practice_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_slug text NOT NULL CHECK (length(topic_slug) BETWEEN 2 AND 80),
  stage_key text NOT NULL CHECK (length(stage_key) BETWEEN 2 AND 90),
  completed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seminar_practice_progress_owner_stage_uq UNIQUE(auth_user_id,topic_slug,stage_key)
);
CREATE INDEX IF NOT EXISTS seminar_practice_progress_user_idx
 ON public.seminar_practice_progress(auth_user_id,topic_slug);
ALTER TABLE public.seminar_practice_progress ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.seminar_practice_progress FROM anon;
GRANT SELECT,INSERT,UPDATE ON TABLE public.seminar_practice_progress TO authenticated;

DROP POLICY IF EXISTS "students read own practice" ON public.seminar_practice_progress;
CREATE POLICY "students read own practice" ON public.seminar_practice_progress
 FOR SELECT TO authenticated
 USING (
   auth_user_id = (SELECT auth.uid())
   AND EXISTS (
     SELECT 1 FROM public.seminar_students s
      WHERE s.auth_user_id = (SELECT auth.uid()) AND s.academic_year=2027
   )
 );
DROP POLICY IF EXISTS "students write own practice" ON public.seminar_practice_progress;
CREATE POLICY "students write own practice" ON public.seminar_practice_progress
 FOR INSERT TO authenticated
 WITH CHECK (
   auth_user_id = (SELECT auth.uid())
   AND EXISTS (
     SELECT 1 FROM public.seminar_students s
     WHERE s.auth_user_id = (SELECT auth.uid()) AND s.academic_year=2027
   )
 );
DROP POLICY IF EXISTS "students update own practice" ON public.seminar_practice_progress;
CREATE POLICY "students update own practice" ON public.seminar_practice_progress
 FOR UPDATE TO authenticated
 USING (auth_user_id = (SELECT auth.uid()))
 WITH CHECK (auth_user_id = (SELECT auth.uid()));
-- Keep any future official grading in a separate backend-authenticated table/service.
