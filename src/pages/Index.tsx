import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DeviceDashboard } from '@/components/DeviceDashboard';
import { LocationTracker } from '@/components/LocationTracker';
import { MapPin, Smartphone, Monitor } from 'lucide-react';

const Index = () => {
  const [phoneCode, setPhoneCode] = useState('');
  const [isPhoneRegistered, setIsPhoneRegistered] = useState(false);

  const generateRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setPhoneCode(code);
  };

  const registerPhone = () => {
    if (phoneCode.trim()) {
      setIsPhoneRegistered(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary rounded-2xl shadow-lg">
              <MapPin className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Locatr
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track any phone's location in real-time using unique codes. 
            Perfect for family safety, device monitoring, and location sharing.
          </p>
        </div>

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Track Device
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Phone Tracker
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <DeviceDashboard />
            </TabsContent>

            <TabsContent value="phone" className="space-y-6">
              {!isPhoneRegistered ? (
                <Card className="max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Register Your Phone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Device Code</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter or generate code"
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(e.target.value.toUpperCase())}
                          maxLength={6}
                        />
                        <Button variant="outline" onClick={generateRandomCode}>
                          Generate
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={registerPhone}
                      disabled={!phoneCode.trim()}
                      className="w-full"
                    >
                      Start Tracking
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      This code will be used to identify your device for location tracking.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="max-w-md mx-auto space-y-4">
                  <LocationTracker deviceCode={phoneCode} />
                  
                  <Card>
                    <CardContent className="pt-6 text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Your device code: <strong>{phoneCode}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Share this code with others to let them track your location.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsPhoneRegistered(false);
                          setPhoneCode('');
                        }}
                      >
                        Change Code
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto pt-12">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Real-time Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Get live location updates every 30 seconds with high accuracy GPS positioning.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Background Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Works even when the app is in the background, perfect for continuous monitoring.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Monitor className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Web Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Track from any browser using device codes. View location history and live maps.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
