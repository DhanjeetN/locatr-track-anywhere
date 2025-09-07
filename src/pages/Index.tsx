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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 mobile-safe">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-6 sm:py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative p-3 bg-gradient-to-br from-primary to-primary-glow rounded-2xl shadow-elegant">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-glow rounded-2xl blur-lg opacity-30 animate-pulse"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text">
              Locatr
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Track any device's location in real-time with secure codes. 
            <span className="block sm:inline"> Perfect for family safety and device monitoring.</span>
          </p>
        </div>

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 glass-effect h-12 p-1">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 text-sm font-medium transition-smooth data-[state=active]:shadow-soft">
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Track Device</span>
                <span className="sm:hidden">Track</span>
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2 text-sm font-medium transition-smooth data-[state=active]:shadow-soft">
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Phone Tracker</span>
                <span className="sm:hidden">Phone</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <DeviceDashboard />
            </TabsContent>

            <TabsContent value="phone" className="space-y-6">
              {!isPhoneRegistered ? (
                <Card className="max-w-md mx-auto glass-effect shadow-elegant">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="flex items-center justify-center gap-2 text-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Smartphone className="w-5 h-5 text-primary" />
                      </div>
                      Register Your Device
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Device Code</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter 6-digit code"
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(e.target.value.toUpperCase())}
                          maxLength={6}
                          className="text-center text-lg font-mono tracking-wider"
                        />
                        <Button variant="outline" onClick={generateRandomCode} className="px-3">
                          <span className="hidden sm:inline">Generate</span>
                          <span className="sm:hidden">Gen</span>
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={registerPhone}
                      disabled={!phoneCode.trim()}
                      className="w-full h-12 text-base font-medium transition-bounce"
                    >
                      Start Tracking
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      This unique code identifies your device for secure location tracking and sharing.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="max-w-md mx-auto space-y-4">
                  <LocationTracker deviceCode={phoneCode} />
                  
                  <Card className="glass-effect">
                    <CardContent className="pt-6 text-center space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Your device code</p>
                        <p className="text-2xl font-mono font-bold text-primary tracking-wider">
                          {phoneCode}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Share this code with trusted contacts to allow location tracking.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsPhoneRegistered(false);
                          setPhoneCode('');
                        }}
                        className="transition-smooth"
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
        <div className="max-w-4xl mx-auto pt-8 sm:pt-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="text-center glass-effect shadow-soft hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6 pb-6">
                <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-3 text-lg">Real-time Tracking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Live location updates every 30 seconds with high-accuracy GPS positioning.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center glass-effect shadow-soft hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6 pb-6">
                <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-3 text-lg">Background Tracking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Continuous monitoring even when the app runs in the background.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center glass-effect shadow-soft hover:shadow-elegant transition-smooth sm:col-span-2 lg:col-span-1">
              <CardContent className="pt-6 pb-6">
                <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto mb-4">
                  <Monitor className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-3 text-lg">Web Dashboard</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Track from any browser with secure codes. View history and live maps.
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
