import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocationMap } from './LocationMap';
import { Search, MapPin, Clock, Battery } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  battery_level?: number;
}

interface Device {
  id: string;
  device_code: string;
  device_name: string;
  last_seen: string;
}

export const DeviceDashboard = () => {
  const [searchCode, setSearchCode] = useState('');
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set up real-time subscription for location updates
    const channel = supabase
      .channel('location-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'locations'
        },
        (payload) => {
          if (currentDevice && payload.new.device_id === currentDevice.id) {
            setLocations(prev => [...prev, payload.new as Location]);
            toast({ title: "New location update received!" });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDevice]);

  const searchDevice = async () => {
    if (!searchCode.trim()) {
      toast({ title: "Please enter a device code", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Find device by code
      const { data: device, error: deviceError } = await supabase
        .from('devices')
        .select('*')
        .eq('device_code', searchCode.trim())
        .single();

      if (deviceError) {
        toast({ title: "Device not found", variant: "destructive" });
        return;
      }

      setCurrentDevice(device);

      // Fetch locations for this device (last 100 locations)
      const { data: deviceLocations, error: locationsError } = await supabase
        .from('locations')
        .select('*')
        .eq('device_id', device.id)
        .order('timestamp', { ascending: true })
        .limit(100);

      if (locationsError) {
        console.error('Error fetching locations:', locationsError);
        toast({ title: "Error loading locations", variant: "destructive" });
        return;
      }

      setLocations(deviceLocations || []);
      toast({ title: `Found device: ${device.device_name || device.device_code}` });

    } catch (error) {
      console.error('Error searching device:', error);
      toast({ title: "Error searching for device", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchDevice();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Track Device
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter device code to track..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={searchDevice} disabled={loading}>
              {loading ? 'Searching...' : 'Track'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentDevice && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Device Code:</span>
                <Badge variant="outline">{currentDevice.device_code}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Device Name:</span>
                <span className="text-sm">{currentDevice.device_name || 'Unknown'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Last Seen:
                </span>
                <span className="text-sm">{new Date(currentDevice.last_seen).toLocaleString()}</span>
              </div>

              {locations.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Locations:</span>
                    <Badge variant="secondary">{locations.length}</Badge>
                  </div>
                  
                  {locations[locations.length - 1]?.battery_level && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Battery className="w-4 h-4" />
                        Last Battery Level:
                      </span>
                      <Badge variant={locations[locations.length - 1].battery_level > 20 ? "default" : "destructive"}>
                        {locations[locations.length - 1].battery_level}%
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {locations.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Live Location Map</h3>
              <LocationMap deviceCode={currentDevice.device_code} locations={locations} />
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No location data available for this device yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Make sure the device is actively tracking and sending location updates.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};