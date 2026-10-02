DROP FUNCTION public.lookup_booking(text, text);
CREATE FUNCTION public.lookup_booking(_ref text, _phone text)
 RETURNS TABLE(reference text, service_type text, appointment_date date, appointment_time time, occasion text, event_date date, notes text, status text, full_name text, production_stage text, payment_status text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT a.reference, a.service_type, a.appointment_date, a.appointment_time, a.occasion, a.event_date, a.notes, a.status, c.full_name, a.production_stage, a.payment_status
  FROM public.appointments a JOIN public.customers c ON c.id = a.customer_id
  WHERE a.id = public._match_booking(_ref, _phone);
$$;
GRANT EXECUTE ON FUNCTION public.lookup_booking(text, text) TO anon, authenticated;