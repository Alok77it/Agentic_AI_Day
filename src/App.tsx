import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { Dashboard } from '@/components/Dashboard';
import { MapView } from '@/components/MapView';
import { ReportForm } from '@/components/ReportForm';
import { ReportStatus } from '@/components/ReportStatus';
import { AdminDashboard } from '@/components/AdminDashboard';
import { NotificationPanel } from '@/components/NotificationPanel';

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'admin';
};

export type Report = {
  id: string;
  title: string;
  description: string;
  type: 'infrastructure' | 'safety' | 'environment' | 'traffic' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  userId: string;
  createdAt: string;
  updatedAt: string;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    fileName?: string;
  }[];
};

export type AppView = 'welcome' | 'dashboard' | 'map' | 'report' | 'status' | 'admin';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-b5bcac8d`;

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Check for existing session on load
  useEffect(() => {
    checkSession();
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    if (user && accessToken) {
      loadReports();
      loadNotifications();
      setCurrentView('dashboard');
    }
  }, [user, accessToken]);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        setLoading(false);
        return;
      }

      if (session?.access_token) {
        setAccessToken(session.access_token);
        await loadUserProfile(session.access_token);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setLoading(false);
    }
  };

  const loadUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { user: userData } = await response.json();
        setUser(userData);
      } else {
        console.error('Failed to load user profile');
      }
    } catch (error) {
      console.error('Load user profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    if (!accessToken) return;

    try {
      // Development mode with mock data
      if (import.meta.env.DEV && accessToken === 'mock-token') {
        const mockReports: Report[] = [
          {
            id: '1',
            title: 'Pothole on Main Street',
            description: 'Large pothole causing damage to vehicles',
            type: 'infrastructure',
            urgency: 'high',
            status: 'pending',
            location: {
              lat: 40.7128,
              lng: -74.0060,
              address: '123 Main Street, New York, NY'
            },
            userId: user?.id || '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Broken Street Light',
            description: 'Street light not working on Oak Avenue',
            type: 'safety',
            urgency: 'medium',
            status: 'in_progress',
            location: {
              lat: 40.7589,
              lng: -73.9851,
              address: '456 Oak Avenue, New York, NY'
            },
            userId: user?.id || '1',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setReports(mockReports);
        return;
      }

      const response = await fetch(`${API_BASE}/reports`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { reports: reportData } = await response.json();
        setReports(reportData.map((report: any) => ({
          ...report,
          createdAt: new Date(report.createdAt),
          updatedAt: new Date(report.updatedAt)
        })));
      } else {
        console.error('Failed to load reports');
      }
    } catch (error) {
      console.error('Load reports error:', error);
    }
  };

  const loadNotifications = async () => {
    if (!accessToken) return;

    try {
      // Development mode with mock data
      if (import.meta.env.DEV && accessToken === 'mock-token') {
        const mockNotifications = [
          {
            id: '1',
            title: 'Report Update',
            message: 'Your pothole report has been assigned to the infrastructure team',
            timestamp: new Date(),
            read: false,
            type: 'update'
          },
          {
            id: '2',
            title: 'Welcome to CityPulse',
            message: 'Thanks for joining our civic engagement platform!',
            timestamp: new Date(Date.now() - 3600000),
            read: true,
            type: 'welcome'
          }
        ];
        setNotifications(mockNotifications);
        return;
      }

      const response = await fetch(`${API_BASE}/notifications`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { notifications: notificationData } = await response.json();
        setNotifications(notificationData.map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        })));
      } else {
        console.error('Failed to load notifications');
      }
    } catch (error) {
      console.error('Load notifications error:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Development mode bypass - use mock authentication if Supabase fails
      const isDevelopment = import.meta.env.DEV;

      if (isDevelopment && (email === 'demo@demo.com' || email === 'admin@demo.com')) {
        // Mock successful login for demo
        const mockUser: User = {
          id: '1',
          email: email,
          name: email === 'admin@demo.com' ? 'Admin User' : 'Demo User',
          role: email === 'admin@demo.com' ? 'admin' : 'citizen'
        };
        setUser(mockUser);
        setAccessToken('mock-token');
        setCurrentView('dashboard');
        setLoading(false);
        return;
      }

      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          details: error
        });

        // In development, fall back to demo mode
        if (isDevelopment) {
          console.log('Falling back to demo mode due to Supabase error');
          alert('Supabase authentication failed. Using demo mode.\nTry: demo@demo.com or admin@demo.com with any password');
          setLoading(false);
          return;
        }

        alert(`Login failed: ${error.message}\nDetails: ${error.status ? `Status ${error.status}` : 'Network or configuration error'}`);
        return;
      }

      if (session?.access_token) {
        setAccessToken(session.access_token);
        await loadUserProfile(session.access_token);
      }
    } catch (error) {
      console.error('Login error:', error);

      // In development, show helpful message
      if (import.meta.env.DEV) {
        alert('Authentication error. For demo, try:\ndemo@demo.com or admin@demo.com\nwith any password');
      } else {
        alert('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);

      // Development mode bypass
      const isDevelopment = import.meta.env.DEV;

      if (isDevelopment) {
        // Mock successful signup for demo
        const mockUser: User = {
          id: Math.random().toString(),
          email: email,
          name: name,
          role: 'citizen'
        };
        setUser(mockUser);
        setAccessToken('mock-token');
        setCurrentView('dashboard');
        setLoading(false);
        alert('Demo signup successful! You are now logged in.');
        return;
      }

      // Create user via API
      const signupResponse = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });

      if (!signupResponse.ok) {
        const { error } = await signupResponse.json();
        throw new Error(error || 'Signup failed');
      }

      // Sign in the user
      await handleLogin(email, password);
    } catch (error) {
      console.error('Signup error:', error);

      if (import.meta.env.DEV) {
        alert('Signup error. In demo mode, just fill out the form and it will work automatically.');
      } else {
        alert('Signup failed: ' + error.message);
      }
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
      setReports([]);
      setNotifications([]);
      setCurrentView('welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCreateReport = async (reportData: Omit<Report, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        const { report } = await response.json();
        setReports(prev => [...prev, {
          ...report,
          createdAt: new Date(report.createdAt),
          updatedAt: new Date(report.updatedAt)
        }]);
        setCurrentView('status');
        
        // Show success notification
        alert('Report submitted successfully!');
      } else {
        const { error } = await response.json();
        throw new Error(error || 'Failed to create report');
      }
    } catch (error) {
      console.error('Create report error:', error);
      alert('Failed to submit report: ' + error.message);
    }
  };

  const handleUpdateReport = async (reportId: string, updates: Partial<Report>) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const { report } = await response.json();
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { ...report, createdAt: new Date(report.createdAt), updatedAt: new Date(report.updatedAt) }
            : r
        ));
        
        // Reload notifications to get the new status update notification
        loadNotifications();
      } else {
        const { error } = await response.json();
        throw new Error(error || 'Failed to update report');
      }
    } catch (error) {
      console.error('Update report error:', error);
      alert('Failed to update report: ' + error.message);
    }
  };

  const handleUploadFile = async (file: File): Promise<string> => {
    if (!accessToken) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    if (response.ok) {
      const { url } = await response.json();
      return url;
    } else {
      const { error } = await response.json();
      throw new Error(error || 'Failed to upload file');
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map((n: any) => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
      }
    } catch (error) {
      console.error('Mark notification as read error:', error);
    }
  };

  const commonProps = {
    user,
    reports,
    notifications,
    setCurrentView,
    handleLogout,
    handleUpdateReport,
    setNotifications: setNotifications
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-city-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CityPulse...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'welcome') {
    return (
      <WelcomeScreen 
        onLogin={handleLogin} 
        onSignup={handleSignup}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NotificationPanel 
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
      />
      
      {currentView === 'dashboard' && <Dashboard {...commonProps} />}
      {currentView === 'map' && <MapView {...commonProps} />}
      {currentView === 'report' && (
        <ReportForm 
          {...commonProps} 
          onSubmit={handleCreateReport}
          onUploadFile={handleUploadFile}
        />
      )}
      {currentView === 'status' && <ReportStatus {...commonProps} />}
      {currentView === 'admin' && <AdminDashboard {...commonProps} />}
    </div>
  );
}
