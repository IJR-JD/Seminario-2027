-- Ejecutar solo dentro del proyecto Supabase institucional correcto, tras revisar los permisos.
-- No contiene datos personales. La carga de matrícula se realiza exclusivamente desde un entorno privado.
create extension if not exists pgcrypto;
create table if not exists public.seminar_students (
 id uuid primary key default gen_random_uuid(),
 full_name text not null,
 class_group text not null check (class_group in ('10A','10B','10C')),
 academic_year integer not null default 2027 check (academic_year >= 2027),
 auth_user_id uuid unique references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 unique (full_name, academic_year)
);
create table if not exists public.seminar_workshop_attempts (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.seminar_students(id) on delete cascade,
 workshop_code text not null,
 answers jsonb not null default '{}'::jsonb,
 score integer not null check (score >= 0),
 total integer not null check (total > 0 and score <= total),
 submitted_at timestamptz not null default now()
);
create index if not exists seminar_workshop_attempts_student_idx on public.seminar_workshop_attempts(student_id,submitted_at desc);
alter table public.seminar_students enable row level security;
alter table public.seminar_workshop_attempts enable row level security;
-- Solo el usuario autenticado asociado a la matrícula puede leer su propio perfil.
create policy "student reads own profile" on public.seminar_students for select to authenticated
using (auth_user_id = (select auth.uid()));
-- Solo el estudiante asociado puede consultar sus intentos.
create policy "student reads own attempts" on public.seminar_workshop_attempts for select to authenticated
using (exists(select 1 from public.seminar_students s where s.id=student_id and s.auth_user_id=(select auth.uid())));
-- No se abre escritura directa a clientes. Los envíos oficiales requieren endpoint validado
-- (identidad, autoría, clave de respuestas en servidor, límites de intentos, permisos docentes).
revoke all on public.seminar_students from anon;
revoke all on public.seminar_workshop_attempts from anon;
grant select on public.seminar_students to authenticated;
grant select on public.seminar_workshop_attempts to authenticated;
