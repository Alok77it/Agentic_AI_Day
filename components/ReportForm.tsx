import { useState } from 'react';
import { User, Report, AppView } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Camera, 
  Video, 
  Mic, 
  Upload, 
  X,
  Plus,
  Paperclip,
  MicIcon
} from 'lucide-react';

interface ReportFormProps {
  user: User | null;
  setCurrentView: (view: AppView) => void;
  onSubmit: (report: Omit<Report, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  onUploadFile: (file: File) => Promise<string>;
}

export function ReportForm({ user, setCurrentView, onSubmit, onUploadFile }: ReportFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    urgency: '',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: ''
    }
  });
  
  const [mediaFiles, setMediaFiles] = useState<Array<{
    id: string;
    type: 'image' | 'video' | 'audio';
    name: string;
    file: File | null;
    url: string;
    uploading?: boolean;
  }>>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            }
          }));
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter the address manually.');
          setLocationLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setLocationLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Add file to list with uploading state
      const newFile = {
        id: fileId,
        type,
        name: file.name,
        file,
        url: '',
        uploading: true
      };
      
      setMediaFiles(prev => [...prev, newFile]);
      
      try {
        // Upload file to backend
        const uploadedUrl = await onUploadFile(file);
        
        // Update file with uploaded URL
        setMediaFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, url: uploadedUrl, uploading: false }
            : f
        ));
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload file: ' + error.message);
        
        // Remove file from list if upload failed
        setMediaFiles(prev => prev.filter(f => f.id !== fileId));
      }
    }
  };

  const removeFile = (id: string) => {
    setMediaFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file && file.url) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const startRecording = () => {
    setIsRecording(true);
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks: BlobPart[] = [];
          
          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };
          
          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioFile = new File([audioBlob], 'voice-note.wav', { type: 'audio/wav' });
            
            const fileId = Date.now().toString();
            
            // Add audio file to list with uploading state
            const newFile = {
              id: fileId,
              type: 'audio' as const,
              name: 'voice-note.wav',
              file: audioFile,
              url: '',
              uploading: true
            };
            
            setMediaFiles(prev => [...prev, newFile]);
            
            try {
              // Upload audio file
              const uploadedUrl = await onUploadFile(audioFile);
              
              // Update file with uploaded URL
              setMediaFiles(prev => prev.map(f => 
                f.id === fileId 
                  ? { ...f, url: uploadedUrl, uploading: false }
                  : f
              ));
            } catch (error) {
              console.error('Audio upload error:', error);
              alert('Failed to upload voice note: ' + error.message);
              setMediaFiles(prev => prev.filter(f => f.id !== fileId));
            }
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
          };
          
          mediaRecorder.start();
          
          // Stop recording after 30 seconds maximum
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
              setIsRecording(false);
            }
          }, 30000);
          
          // Stop recording after 3 seconds for demo
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
              setIsRecording(false);
            }
          }, 3000);
        })
        .catch(error => {
          console.error('Microphone access error:', error);
          alert('Unable to access microphone. Please check your browser permissions.');
          setIsRecording(false);
        });
    } else {
      // Fallback for browsers without MediaRecorder support
      alert('Voice recording is not supported in this browser.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if any files are still uploading
    const uploadingFiles = mediaFiles.filter(f => f.uploading);
    if (uploadingFiles.length > 0) {
      alert('Please wait for all files to finish uploading before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reportData = {
        ...formData,
        type: formData.type as Report['type'],
        urgency: formData.urgency as Report['urgency'],
        media: mediaFiles.map(f => ({
          type: f.type,
          url: f.url,
          fileName: f.name
        }))
      };
      
      await onSubmit(reportData);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300';
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
              <h1 className="text-xl font-semibold text-gray-900">Report an Issue</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Issue Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="traffic">Traffic</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                    <SelectTrigger className={getUrgencyColor(formData.urgency)}>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="flex space-x-2">
                  <Input
                    id="address"
                    placeholder="Enter address or description"
                    value={formData.location.address}
                    onChange={(e) => handleLocationChange('address', e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="shrink-0"
                  >
                    {locationLoading ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={formData.location.lat}
                    onChange={(e) => handleLocationChange('lat', e.target.value)}
                    className="bg-gray-50"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={formData.location.lng}
                    onChange={(e) => handleLocationChange('lng', e.target.value)}
                    className="bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Media Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Photos</Label>
                  <label 
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Add photos</p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'image')}
                    />
                  </label>
                </div>

                {/* Video Upload */}
                <div className="space-y-2">
                  <Label htmlFor="video-upload">Videos</Label>
                  <label 
                    htmlFor="video-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Video className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Add videos</p>
                    </div>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'video')}
                    />
                  </label>
                </div>

                {/* Voice Recording */}
                <div className="space-y-2">
                  <Label>Voice Note</Label>
                  <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`${isRecording ? 'bg-red-50 border-red-300' : ''}`}
                    >
                      {isRecording ? (
                        <>
                          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <MicIcon className="w-4 h-4 mr-2" />
                          Record
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Media Preview */}
              {mediaFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mediaFiles.map((file) => (
                      <div key={file.id} className="relative group">
                        <div className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white rounded-full">
                              {file.uploading ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <>
                                  {file.type === 'image' && <Camera className="w-4 h-4" />}
                                  {file.type === 'video' && <Video className="w-4 h-4" />}
                                  {file.type === 'audio' && <Mic className="w-4 h-4" />}
                                </>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500 capitalize">
                                {file.uploading ? 'Uploading...' : file.type}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={file.uploading}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentView('dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.description || !formData.type || !formData.urgency || mediaFiles.some(f => f.uploading)}
              className="bg-city-green hover:bg-city-green-light"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}