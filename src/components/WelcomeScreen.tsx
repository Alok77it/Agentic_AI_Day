import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, MapPin, Bell, Users } from 'lucide-react';

interface WelcomeScreenProps {
  onLogin: (email: string, password: string) => void;
  onSignup: (email: string, password: string, name: string) => void;
  loading: boolean;
}

export function WelcomeScreen({ onLogin, onSignup, loading }: WelcomeScreenProps) {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginData.email, loginData.password);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(signupData.email, signupData.password, signupData.name);
  };

  const fillDemoCredentials = (type: 'citizen' | 'admin') => {
    const email = type === 'admin' ? 'admin@demo.com' : 'citizen@demo.com';
    setLoginData({ email, password: 'demo123' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-city-blue rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CityPulse</h1>
            <p className="text-gray-600 mt-2">
              Your voice in building a better city
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-city-blue-lighter rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-5 h-5 text-city-blue" />
            </div>
            <p className="text-sm text-gray-600">Real-time mapping</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-city-green-lighter rounded-full flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5 text-city-green" />
            </div>
            <p className="text-sm text-gray-600">Instant alerts</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-city-blue-lighter rounded-full flex items-center justify-center mx-auto">
              <Users className="w-5 h-5 text-city-blue" />
            </div>
            <p className="text-sm text-gray-600">Community driven</p>
          </div>
        </div>

        {/* Auth forms */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="citizen@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-city-blue hover:bg-city-blue-light"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupData.name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="citizen@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-city-green hover:bg-city-green-light"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo accounts */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-center text-muted-foreground mb-3">
              Try the demo:
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('citizen')}
                className="w-full text-left justify-start"
                disabled={loading}
              >
                <span className="flex-1">Citizen Demo</span>
                <span className="text-xs text-muted-foreground">citizen@demo.com</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('admin')}
                className="w-full text-left justify-start"
                disabled={loading}
              >
                <span className="flex-1">Admin Demo</span>
                <span className="text-xs text-muted-foreground">admin@demo.com</span>
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Or create your own account using the Sign Up tab
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}