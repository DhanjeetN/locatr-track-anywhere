-- Fix the function search path security issue
DROP FUNCTION IF EXISTS public.update_device_last_seen();

CREATE OR REPLACE FUNCTION public.update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.devices 
  SET last_seen = NEW.timestamp 
  WHERE id = NEW.device_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;