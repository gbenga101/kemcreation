DROP INDEX IF EXISTS public.appointments_active_slot;
CREATE UNIQUE INDEX appointments_active_slot ON public.appointments (appointment_date, appointment_time)
  WHERE status NOT IN ('cancelled','no_show');

CREATE OR REPLACE FUNCTION public.get_booked_slots(_date date)
 RETURNS SETOF time without time zone LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT appointment_time FROM public.appointments
  WHERE appointment_date = _date AND status NOT IN ('cancelled','no_show')
  UNION
  SELECT blocked_time FROM public.blocked_slots WHERE blocked_date = _date AND blocked_time IS NOT NULL
  UNION
  SELECT g::time FROM public.slot_hours(_date) h, generate_series(_date + h.open_t, _date + h.close_t - interval '30 minutes', interval '30 minutes') g
  WHERE EXISTS (SELECT 1 FROM public.blocked_slots WHERE blocked_date = _date AND blocked_time IS NULL);
$$;

CREATE OR REPLACE FUNCTION public._match_booking(_ref text, _phone text)
 RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT a.id FROM public.appointments a JOIN public.customers c ON c.id = a.customer_id
  WHERE a.reference = upper(trim(_ref))
    AND right(regexp_replace(c.phone, '\D', '', 'g'), 10) = right(regexp_replace(coalesce(_phone,''), '\D', '', 'g'), 10)
    AND char_length(regexp_replace(coalesce(_phone,''), '\D', '', 'g')) >= 10
  LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public._match_booking(text, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.lookup_booking(_ref text, _phone text)
 RETURNS TABLE(reference text, service_type text, appointment_date date, appointment_time time, occasion text, event_date date, notes text, status text, full_name text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT a.reference, a.service_type, a.appointment_date, a.appointment_time, a.occasion, a.event_date, a.notes, a.status, c.full_name
  FROM public.appointments a JOIN public.customers c ON c.id = a.customer_id
  WHERE a.id = public._match_booking(_ref, _phone);
$$;

CREATE OR REPLACE FUNCTION public.cancel_booking(_ref text, _phone text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE _id uuid := public._match_booking(_ref, _phone); _s text;
BEGIN
  IF _id IS NULL THEN RAISE EXCEPTION 'not_found'; END IF;
  SELECT status INTO _s FROM public.appointments WHERE id = _id;
  IF _s IN ('cancelled','completed','no_show') THEN RAISE EXCEPTION 'not_allowed'; END IF;
  UPDATE public.appointments SET status = 'cancelled' WHERE id = _id;
END $$;

CREATE OR REPLACE FUNCTION public.reschedule_booking(_ref text, _phone text, _date date, _time time)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE _id uuid := public._match_booking(_ref, _phone); _s text; _o time; _c time;
  _today date := (now() AT TIME ZONE 'Africa/Lagos')::date;
  _nowt time := (now() AT TIME ZONE 'Africa/Lagos')::time;
BEGIN
  IF _id IS NULL THEN RAISE EXCEPTION 'not_found'; END IF;
  SELECT status INTO _s FROM public.appointments WHERE id = _id;
  IF _s IN ('cancelled','completed','no_show') THEN RAISE EXCEPTION 'not_allowed'; END IF;
  SELECT open_t, close_t INTO _o, _c FROM public.slot_hours(_date);
  IF _o IS NULL OR EXISTS (SELECT 1 FROM public.blocked_slots WHERE blocked_date = _date AND blocked_time IS NULL) THEN RAISE EXCEPTION 'closed_day'; END IF;
  IF EXISTS (SELECT 1 FROM public.blocked_slots WHERE blocked_date = _date AND blocked_time = _time) THEN RAISE EXCEPTION 'slot_taken'; END IF;
  IF _date < _today OR _date > _today + 90 OR (_date = _today AND _time <= _nowt) THEN RAISE EXCEPTION 'invalid_date'; END IF;
  IF _time < _o OR _time > _c - interval '30 minutes' OR extract(minute FROM _time)::int % 30 <> 0 OR extract(second FROM _time) <> 0 THEN RAISE EXCEPTION 'invalid_time'; END IF;
  BEGIN
    UPDATE public.appointments SET appointment_date = _date, appointment_time = _time, status = 'rescheduled' WHERE id = _id;
  EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'slot_taken';
  END;
END $$;

GRANT EXECUTE ON FUNCTION public.lookup_booking(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_booking(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_booking(text, text, date, time) TO anon, authenticated;