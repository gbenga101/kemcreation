CREATE OR REPLACE FUNCTION public.set_rtw_stage() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.service_type = 'ready_to_wear' AND NEW.production_stage NOT IN ('fitting_ready','completed') THEN
    NEW.production_stage := 'fitting_ready';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER appointments_rtw_stage BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_rtw_stage();
UPDATE public.appointments SET production_stage = 'fitting_ready' WHERE service_type = 'ready_to_wear' AND production_stage NOT IN ('fitting_ready','completed');