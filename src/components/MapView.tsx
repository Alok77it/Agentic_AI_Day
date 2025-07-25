import { useState } from 'react';
import { User, Report, AppView } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ArrowLeft, 
  MapPin, 
  Filter, 
  Layers,
  Navigation,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface MapViewProps {
  user: User | null;
  reports: Report[];
  setCurrentView: (view: AppView) => void;
}

export function MapView({ user, reports, setCurrentView }: MapViewProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredReports = reports.filter(report => {
    if (filterType !== 'all' && report.type !== filterType) return false;
    if (filterUrgency !== 'all' && report.urgency !== filterUrgency) return false;
    if (filterStatus !== 'all' && report.status !== filterStatus) return false;
    return true;
  });

  const getMarkerColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'in_progress': return <TrendingUp className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      case 'rejected': return <AlertTriangle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">City Incident Map</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('report')}
                className="bg-city-green text-white hover:bg-city-green-light"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Report Here
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar with filters and report list */}
        <div className="w-80 bg-white shadow-lg overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Filters</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="traffic">Traffic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="All urgencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgencies</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Layers className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Reports</h2>
              <Badge variant="secondary">{filteredReports.length}</Badge>
            </div>
            
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <Card 
                  key={report.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedReport?.id === report.id ? 'ring-2 ring-city-blue' : ''
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-3 h-3 ${getMarkerColor(report.urgency)} rounded-full mt-2`} />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{report.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{report.location.address}</p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              report.urgency === 'critical' ? 'border-red-300 text-red-700' :
                              report.urgency === 'high' ? 'border-orange-300 text-orange-700' :
                              report.urgency === 'medium' ? 'border-yellow-300 text-yellow-700' :
                              'border-green-300 text-green-700'
                            }`}
                          >
                            {report.urgency}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            {getStatusIcon(report.status)}
                            <span className="capitalize">{report.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            {/* Mock map interface */}
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden">
              {/* Grid pattern to simulate map */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-20 grid-rows-20 w-full h-full">
                  {Array.from({ length: 400 }).map((_, i) => (
                    <div key={i} className="border border-gray-300" />
                  ))}
                </div>
              </div>
              
              {/* Street lines */}
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-300" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300" />
                <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gray-300" />
                <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-gray-300" />
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300" />
                <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-gray-300" />
              </div>
              
              {/* Report markers */}
              {filteredReports.map((report, index) => (
                <div
                  key={report.id}
                  className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                    selectedReport?.id === report.id ? 'z-20 scale-125' : 'z-10'
                  }`}
                  style={{
                    left: `${30 + (index * 15) % 60}%`,
                    top: `${25 + (index * 12) % 50}%`,
                  }}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className={`w-6 h-6 ${getMarkerColor(report.urgency)} rounded-full shadow-lg border-2 border-white flex items-center justify-center`}>
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  {selectedReport?.id === report.id && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl p-4 border">
                      <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 ${getMarkerColor(report.urgency)} rounded-full mt-2`} />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{report.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                          <p className="text-xs text-gray-500 mb-2">{report.location.address}</p>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                report.urgency === 'critical' ? 'border-red-300 text-red-700' :
                                report.urgency === 'high' ? 'border-orange-300 text-orange-700' :
                                report.urgency === 'medium' ? 'border-yellow-300 text-yellow-700' :
                                'border-green-300 text-green-700'
                              }`}
                            >
                              {report.urgency}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              {getStatusIcon(report.status)}
                              <span className="capitalize">{report.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Reported: {report.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Map controls */}
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
                <Button variant="outline" size="sm">
                  <Navigation className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Layers className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Legend */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Legend</h3>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm text-gray-600">Critical</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-sm text-gray-600">High</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="text-sm text-gray-600">Medium</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-600">Low</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}