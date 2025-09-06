-- Create devices table for phone registration
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_code TEXT NOT NULL UNIQUE,
  device_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create locations table for GPS coordinates
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  battery_level INTEGER,
  is_moving BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Allow public read access to devices" 
ON public.devices 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to devices" 
ON public.devices 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to devices" 
ON public.devices 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public read access to locations" 
ON public.locations 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to locations" 
ON public.locations 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_devices_code ON public.devices(device_code);
CREATE INDEX idx_locations_device_id ON public.locations(device_id);
CREATE INDEX idx_locations_timestamp ON public.locations(timestamp DESC);

-- Create function to update last_seen
CREATE OR REPLACE FUNCTION public.update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.devices 
  SET last_seen = NEW.timestamp 
  WHERE id = NEW.device_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic last_seen updates
CREATE TRIGGER update_device_last_seen_trigger
AFTER INSERT ON public.locations
FOR EACH ROW
EXECUTE FUNCTION public.update_device_last_seen();