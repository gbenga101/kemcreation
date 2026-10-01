ALTER TABLE public.appointments ADD COLUMN reminder_sent_at timestamptz;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;