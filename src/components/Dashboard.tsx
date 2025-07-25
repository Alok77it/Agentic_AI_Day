import { User, Report, AppView } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Map, 
  Plus, 
  FileText, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface DashboardProps {
  user: User | null;
  reports: Report[];
  setCurrentView: (view: AppView) => void;
  handleLogout: () => void;
}

export function Dashboard({ user, reports, setCurrentView, handleLogout }: DashboardProps) {
  const userReports = reports.filter(r => r.userId === user?.id);
  const pendingReports = reports.filter(r => r.status === 'pending');
  const inProgressReports = reports.filter(r => r.status === 'in_progress');
  const resolvedReports = reports.filter(r => r.status === 'resolved');

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <TrendingUp className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">CityPulse</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-city-blue text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                </div>
                <div className="w-12 h-12 bg-city-blue-lighter rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-city-blue" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingReports.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{inProgressReports.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{resolvedReports.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('map')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-city-blue-lighter rounded-full flex items-center justify-center">
                  <Map className="w-6 h-6 text-city-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View Map</h3>
                  <p className="text-sm text-gray-600">See incidents in your area</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('report')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-city-green-lighter rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-city-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Report Issue</h3>
                  <p className="text-sm text-gray-600">Submit a new incident</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('status')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Track Reports</h3>
                  <p className="text-sm text-gray-600">Monitor your submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panel Access */}
        {user?.role === 'admin' && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Admin Dashboard</h3>
                  <p className="text-sm text-gray-600">Access administrative controls and advanced filtering</p>
                </div>
                <Button onClick={() => setCurrentView('admin')} className="bg-city-blue hover:bg-city-blue-light">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>
              {user?.role === 'admin' ? 'Latest incidents across the city' : 'Your recent submissions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(user?.role === 'admin' ? reports : userReports).slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-full">
                      {getStatusIcon(report.status)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-600">{report.location.address}</p>
                      <p className="text-xs text-gray-500">
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getUrgencyColor(report.urgency)}>
                      {report.urgency}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {report.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
              {(user?.role === 'admin' ? reports : userReports).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No reports yet</p>
                  <p className="text-sm">Get started by reporting an incident</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
