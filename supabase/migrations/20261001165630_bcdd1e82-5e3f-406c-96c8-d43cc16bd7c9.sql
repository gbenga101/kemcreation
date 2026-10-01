CREATE TYPE public.app_role AS ENUM ('owner');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- First signed-in account claims the owner role; afterwards nobody else can.
CREATE OR REPLACE FUNCTION public.claim_owner()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner') THEN
    RETURN public.has_role(auth.uid(), 'owner');
  END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (auth.uid(), 'owner');
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_owner() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.claim_owner() TO authenticated;

CREATE OR REPLACE FUNCTION public.owner_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner')
$$;

GRANT SELECT, UPDATE ON public.appointments TO authenticated;
GRANT SELECT ON public.customers TO authenticated;
CREATE POLICY "owner reads appointments" ON public.appointments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "owner updates appointments" ON public.appointments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "owner reads customers" ON public.customers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'));

CREATE TABLE public.blocked_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date NOT NULL,
  blocked_time time,
  reason text CHECK (reason IS NULL OR char_length(reason) <= 200),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX blocked_slots_unique ON public.blocked_slots (blocked_date, coalesce(blocked_time, '00:00:00'::time), (blocked_time IS NULL));
GRANT SELECT, INSERT, DELETE ON public.blocked_slots TO authenticated;
GRANT ALL ON public.blocked_slots TO service_role;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages blocks" ON public.blocked_slots FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE OR REPLACE FUNCTION public.get_booked_slots(_date date)
RETURNS SETOF time LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT appointment_time FROM public.appointments
  WHERE appointment_date = _date AND status NOT IN ('cancelled','no_show','rescheduled')
  UNION
  SELECT blocked_time FROM public.blocked_slots WHERE blocked_date = _date AND blocked_time IS NOT NULL
  UNION
  SELECT g::time FROM public.slot_hours(_date) h, generate_series(_date + h.open_t, _date + h.close_t - interval '30 minutes', interval '30 minutes') g
  WHERE EXISTS (SELECT 1 FROM public.blocked_slots WHERE blocked_date = _date AND blocked_time IS NULL);
$$;

CREATE OR REPLACE FUNCTION public.get_blocked_days()
RETURNS SETOF date LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT blocked_date FROM public.blocked_slots
  WHERE blocked_time IS NULL AND blocked_date >= (now() AT TIME ZONE 'Africa/Lagos')::date;
$$;

CREATE OR REPLACE FUNCTION public.create_booking(_service text, _date date, _time time without time zone, _full_name text, _phone text, _email text, _occasion text, _event_date date, _notes text)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _o time; _c time; _cust uuid; _ref text;
  _today date := (now() AT TIME ZONE 'Africa/Lagos')::date;
  _nowt time := (now() AT TIME ZONE 'Africa/Lagos')::time;
BEGIN
  IF _service NOT IN ('bespoke','ready_to_wear','occasion') THEN RAISE EXCEPTION 'invalid_service'; END IF;
  SELECT open_t, close_t INTO _o, _c FROM public.slot_hours(_date);
  IF _o IS NULL THEN RAISE EXCEPTION 'closed_day'; END IF;
  IF EXISTS (SELECT 1 FROM public.blocked_slots WHERE blocked_date = _date AND blocked_time IS NULL) THEN RAISE EXCEPTION 'closed_day'; END IF;
  IF EXISTS (SELECT 1 FROM public.blocked_slots WHERE blocked_date = _date AND blocked_time = _time) THEN RAISE EXCEPTION 'slot_taken'; END IF;
  IF _date < _today OR _date > _today + 90 OR (_date = _today AND _time <= _nowt) THEN RAISE EXCEPTION 'invalid_date'; END IF;
  IF _time < _o OR _time > _c - interval '30 minutes' OR extract(minute FROM _time)::int % 30 <> 0 OR extract(second FROM _time) <> 0 THEN
    RAISE EXCEPTION 'invalid_time'; END IF;
  IF _phone !~ '^(\+234|234|0)[789][01][0-9]{8}$' THEN RAISE EXCEPTION 'invalid_phone'; END IF;
  IF char_length(trim(_full_name)) < 2 THEN RAISE EXCEPTION 'invalid_name'; END IF;
  INSERT INTO public.customers(full_name, phone, email)
  VALUES (trim(_full_name), _phone, nullif(trim(_email), '')) RETURNING id INTO _cust;
  LOOP
    _ref := 'KC-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.appointments WHERE reference = _ref);
  END LOOP;
  BEGIN
    INSERT INTO public.appointments(reference, customer_id, service_type, appointment_date, appointment_time, occasion, event_date, notes)
    VALUES (_ref, _cust, _service, _date, _time, nullif(trim(_occasion), ''), _event_date, nullif(trim(_notes), ''));
  EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'slot_taken';
  END;
  RETURN _ref;
END;
$function$;