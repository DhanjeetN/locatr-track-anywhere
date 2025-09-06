-- Fix the function search path security issue by dropping trigger first
DROP TRIGGER IF EXISTS update_device_last_seen_trigger ON public.locations;
DROP FUNCTION IF EXISTS public.update_device_last_seen();

-- Recreate function with correct search path
CREATE OR REPLACE FUNCTION public.update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.devices 
  SET last_seen = NEW.timestamp 
  WHERE id = NEW.device_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_device_last_seen_trigger
AFTER INSERT ON public.locations
FOR EACH ROW
EXECUTE FUNCTION public.update_device_last_seen();