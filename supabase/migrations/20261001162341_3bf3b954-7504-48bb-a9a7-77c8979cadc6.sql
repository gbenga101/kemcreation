CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 20),
  email text CHECK (email IS NULL OR char_length(email) <= 255),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN ('bespoke','ready_to_wear','occasion')),
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  occasion text CHECK (occasion IS NULL OR char_length(occasion) <= 60),
  event_date date,
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','reschedule_requested','rescheduled','completed','cancelled','no_show')),
  payment_status text NOT NULL DEFAULT 'not_required' CHECK (payment_status IN ('not_required','pending','paid')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- One active booking per slot (holds the time while pending)
CREATE UNIQUE INDEX appointments_active_slot ON public.appointments (appointment_date, appointment_time)
  WHERE status NOT IN ('cancelled','no_show','rescheduled');

CREATE OR REPLACE FUNCTION public.slot_hours(_d date)
RETURNS TABLE(open_t time, close_t time) LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE WHEN extract(isodow FROM _d) IN (4,6) THEN time '10:30' ELSE time '09:00' END,
         CASE WHEN extract(isodow FROM _d) IN (4,6) THEN time '18:30' ELSE time '18:00' END
  WHERE extract(isodow FROM _d) <> 7;
$$;

CREATE OR REPLACE FUNCTION public.get_booked_slots(_date date)
RETURNS SETOF time LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT appointment_time FROM public.appointments
  WHERE appointment_date = _date AND status NOT IN ('cancelled','no_show','rescheduled');
$$;
REVOKE ALL ON FUNCTION public.get_booked_slots(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booked_slots(date) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_booking(
  _service text, _date date, _time time, _full_name text, _phone text,
  _email text, _occasion text, _event_date date, _notes text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _o time; _c time; _cust uuid; _ref text;
  _today date := (now() AT TIME ZONE 'Africa/Lagos')::date;
  _nowt time := (now() AT TIME ZONE 'Africa/Lagos')::time;
BEGIN
  IF _service NOT IN ('bespoke','ready_to_wear','occasion') THEN RAISE EXCEPTION 'invalid_service'; END IF;
  SELECT open_t, close_t INTO _o, _c FROM public.slot_hours(_date);
  IF _o IS NULL THEN RAISE EXCEPTION 'closed_day'; END IF;
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
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'slot_taken';
  END;
  RETURN _ref;
END;
$$;
REVOKE ALL ON FUNCTION public.create_booking(text,date,time,text,text,text,text,date,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_booking(text,date,time,text,text,text,text,date,text) TO anon, authenticated;