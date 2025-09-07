import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Battery, Signal, Play, Pause } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LocationTrackerProps {
  deviceCode: string;
  onLocationUpdate?: (location: any) => void;
}

export const LocationTracker = ({ deviceCode, onLocationUpdate }: LocationTrackerProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState<any>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    registerDevice();
    getBatteryInfo();
  }, [deviceCode]);

  const registerDevice = async () => {
    try {
      // Check if device already exists
      const { data: existingDevice } = await supabase
        .from('devices')
        .select('id')
        .eq('device_code', deviceCode)
        .single();

      if (existingDevice) {
        setDeviceId(existingDevice.id);
      } else {
        // Register new device
        const deviceInfo = await Device.getInfo();
        const { data: newDevice, error } = await supabase
          .from('devices')
          .insert({
            device_code: deviceCode,
            device_name: `${deviceInfo.model || 'Unknown'} - ${deviceInfo.platform || 'Unknown'}`
          })
          .select('id')
          .single();

        if (error) throw error;
        setDeviceId(newDevice.id);
        toast({ title: "Device registered successfully!" });
      }
    } catch (error) {
      console.error('Error registering device:', error);
      toast({ title: "Error registering device", variant: "destructive" });
    }
  };

  const getBatteryInfo = async () => {
    try {
      const batteryInfo = await Device.getBatteryInfo();
      setBatteryLevel(batteryInfo.batteryLevel ? Math.round(batteryInfo.batteryLevel * 100) : null);
    } catch (error) {
      console.error('Error getting battery info:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permissions = await Geolocation.requestPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  };

  const sendLocationToSupabase = async (location: any) => {
    if (!deviceId) return;

    try {
      const { error } = await supabase
        .from('locations')
        .insert({
          device_id: deviceId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: location.timestamp,
          battery_level: batteryLevel
        });

      if (error) throw error;

      setLastLocation(location);
      setAccuracy(location.accuracy);
      onLocationUpdate?.(location);

    } catch (error) {
      console.error('Error sending location:', error);
      toast({ title: "Error sending location", variant: "destructive" });
    }
  };

  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      toast({ title: "Location permission required", variant: "destructive" });
      return;
    }

    setIsTracking(true);
    toast({ title: "Location tracking started" });

    // Send initial location
    try {
      const location = await getCurrentLocation();
      await sendLocationToSupabase(location);
    } catch (error) {
      console.error('Error getting initial location:', error);
    }

    // Set up periodic location updates (every 30 seconds)
    const interval = setInterval(async () => {
      if (isTracking) {
        try {
          const location = await getCurrentLocation();
          await sendLocationToSupabase(location);
          await getBatteryInfo(); // Update battery level
        } catch (error) {
          console.error('Error in periodic location update:', error);
        }
      }
    }, 30000);

    // Store interval in a way that can be cleared
    (window as any).trackingInterval = interval;
  };

  const stopTracking = () => {
    setIsTracking(false);
    if ((window as any).trackingInterval) {
      clearInterval((window as any).trackingInterval);
    }
    toast({ title: "Location tracking stopped" });
  };

  return (
    <Card className="w-full glass-effect shadow-elegant">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          Location Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Device Code:</span>
          <Badge variant="outline">{deviceCode}</Badge>
        </div>

        {batteryLevel !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Battery className="w-4 h-4" />
              Battery:
            </span>
            <Badge variant={batteryLevel > 20 ? "default" : "destructive"}>
              {batteryLevel}%
            </Badge>
          </div>
        )}

        {accuracy !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Signal className="w-4 h-4" />
              Accuracy:
            </span>
            <Badge variant="secondary">{accuracy.toFixed(0)}m</Badge>
          </div>
        )}

        {lastLocation && (
          <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              Last Location
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latitude:</span>
                <span className="font-mono">{lastLocation.latitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Longitude:</span>
                <span className="font-mono">{lastLocation.longitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(lastLocation.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={isTracking ? stopTracking : startTracking}
          className="w-full h-12 text-base font-medium transition-bounce"
          variant={isTracking ? "destructive" : "default"}
        >
          {isTracking ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Stop Tracking
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start Tracking
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};