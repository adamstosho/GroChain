'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Settings, 
  Activity, 
  TrendingUp, 
  Play, 
  Pause, 
  MessageSquare, 
  Trash2, 
  Edit, 
  Cloud, 
  Zap, 
  Target 
} from 'lucide-react';

interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'nlp';
  status: 'training' | 'deployed' | 'archived' | 'failed';
  accuracy: number;
  lastUpdated: string;
  version: string;
  dataset: string;
}

interface TrainingJob {
  id: string;
  modelName: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  startTime: string;
  estimatedCompletion: string;
  gpuUsage: number;
  memoryUsage: number;
}

const mockModels: MLModel[] = [
  {
    id: '1',
    name: 'Crop Yield Predictor v2.1',
    type: 'regression',
    status: 'deployed',
    accuracy: 94.2,
    lastUpdated: '2025-01-22T10:30:00Z',
    version: '2.1.0',
    dataset: 'Nigeria Crop Data 2024'
  },
  {
    id: '2',
    name: 'Disease Classifier',
    type: 'classification',
    status: 'training',
    accuracy: 87.5,
    lastUpdated: '2025-01-22T09:15:00Z',
    version: '1.3.2',
    dataset: 'Plant Disease Images'
  },
  {
    id: '3',
    name: 'Market Price Forecaster',
    type: 'regression',
    status: 'deployed',
    accuracy: 91.8,
    lastUpdated: '2025-01-21T16:45:00Z',
    version: '1.8.0',
    dataset: 'Market Price History'
  },
  {
    id: '4',
    name: 'Soil Quality Analyzer',
    type: 'clustering',
    status: 'archived',
    accuracy: 89.3,
    lastUpdated: '2025-01-20T14:20:00Z',
    version: '1.2.1',
    dataset: 'Soil Samples 2023'
  }
];

const mockTrainingJobs: TrainingJob[] = [
  {
    id: '1',
    modelName: 'Disease Classifier',
    status: 'running',
    progress: 65,
    startTime: '2025-01-22T08:00:00Z',
    estimatedCompletion: '2025-01-22T18:00:00Z',
    gpuUsage: 78,
    memoryUsage: 45
  },
  {
    id: '2',
    modelName: 'New Crop Predictor',
    status: 'queued',
    progress: 0,
    startTime: '2025-01-22T19:00:00Z',
    estimatedCompletion: '2025-01-23T05:00:00Z',
    gpuUsage: 0,
    memoryUsage: 0
  },
  {
    id: '3',
    modelName: 'Weather Impact Model',
    status: 'completed',
    progress: 100,
    startTime: '2025-01-21T10:00:00Z',
    estimatedCompletion: '2025-01-21T22:00:00Z',
    gpuUsage: 0,
    memoryUsage: 0
  }
];

export function AdvancedMLDashboard() {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelType, setNewModelType] = useState<string>('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'classification': return <Target className="h-4 w-4" />;
      case 'regression': return <TrendingUp className="h-4 w-4" />;
      case 'clustering': return <Activity className="h-4 w-4" />;
      case 'nlp': return <MessageSquare className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced ML Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage machine learning models and training jobs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Brain className="h-4 w-4 mr-2" />
            New Model
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockModels.filter(m => m.status === 'deployed').length}</div>
            <p className="text-xs text-muted-foreground">
              {mockModels.filter(m => m.status === 'deployed').length} of {mockModels.length} models
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTrainingJobs.filter(j => j.status === 'running').length}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockModels.reduce((acc, m) => acc + m.accuracy, 0) / mockModels.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all models
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPU Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTrainingJobs.filter(j => j.status === 'running').reduce((acc, j) => Math.max(acc, j.gpuUsage), 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Peak utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">ML Models</TabsTrigger>
          <TabsTrigger value="training">Training Jobs</TabsTrigger>
          <TabsTrigger value="deploy">Deploy Model</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4">
            {mockModels.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(model.type)}
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription>
                          Version {model.version} • {model.dataset}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium">{model.accuracy}%</div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Last updated: {new Date(model.lastUpdated).toLocaleString()}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Cloud className="h-4 w-4 mr-2" />
                        Deploy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="grid gap-4">
            {mockTrainingJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.modelName}</CardTitle>
                      <CardDescription>Training Job #{job.id}</CardDescription>
                    </div>
                    <Badge className={getJobStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {job.status === 'running' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <div>{new Date(job.startTime).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ETA:</span>
                        <div>{new Date(job.estimatedCompletion).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">GPU:</span>
                        <div>{job.gpuUsage}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Memory:</span>
                        <div>{job.memoryUsage}%</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {job.status === 'running' && (
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      {job.status === 'queued' && (
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deploy New Model</CardTitle>
              <CardDescription>
                Upload and configure a new machine learning model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model-name">Model Name</Label>
                  <Input
                    id="model-name"
                    placeholder="Enter model name"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model-type">Model Type</Label>
                  <Select value={newModelType} onValueChange={setNewModelType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classification">Classification</SelectItem>
                      <SelectItem value="regression">Regression</SelectItem>
                      <SelectItem value="clustering">Clustering</SelectItem>
                      <SelectItem value="nlp">NLP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model-file">Model File</Label>
                <Input
                  id="model-file"
                  type="file"
                  accept=".pkl,.joblib,.h5,.onnx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataset">Dataset</Label>
                <Input
                  id="dataset"
                  placeholder="Enter dataset name"
                />
              </div>
              <Button className="w-full">
                <Cloud className="h-4 w-4 mr-2" />
                Deploy Model
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts */}
      <Alert>
        <AlertDescription>
          <strong>System Status:</strong> All ML services are running normally. 
          GPU cluster utilization is at 78% with 2 active training jobs.
        </AlertDescription>
      </Alert>
    </div>
  );
}
