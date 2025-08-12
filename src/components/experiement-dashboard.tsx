'use client';

import { useState } from 'react';
import { Experiment, ServerConfig } from '@/types';
import { useExperiments } from '@/hooks/useExperiments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ExperimentDetails } from '@/components/experiment-details';
import { ThemeToggle } from '@/components/theme-toggle';
import { formatFileSize, formatDateTime, formatDuration, getStatusColor, getStatusIcon } from '@/lib/utils';
import { FileText, Trash2, Clock, HardDrive, Activity } from 'lucide-react';

interface ExperimentDashboardProps {
  serverConfig: ServerConfig;
  onLogout: () => void;
  onServerConfig: () => void;
}

export function ExperimentDashboard({ serverConfig, onLogout, onServerConfig }: ExperimentDashboardProps) {
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const { experiments, isLoading, error, deleteExperiment } = useExperiments(serverConfig);

  const handleDeleteExperiment = async (experimentId: string) => {
    if (!confirm('Are you sure you want to stop tracking this experiment?')) return;

    try {
      await deleteExperiment(experimentId);
    } catch (err) {
      console.error('Failed to delete experiment:', err);
    }
  };

  if (selectedExperiment) {
    return (
      <ExperimentDetails
        experiment={selectedExperiment}
        serverConfig={serverConfig}
        onBack={() => setSelectedExperiment(null)}
        onDeleteExperiment={handleDeleteExperiment}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <h1 className="text-lg font-semibold">Experiment Log Monitor</h1>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <p className="text-sm text-muted-foreground">
                Connected to: {serverConfig.url}
              </p>
            </div>
            <nav className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onServerConfig}
              >
                Server Config
              </Button>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
              >
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Experiments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{experiments.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {experiments.filter(e => e.status === 'running').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {experiments.filter(e => e.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Log Size</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatFileSize(experiments.reduce((acc, exp) => acc + exp.size, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Experiments List */}
        <Card>
          <CardHeader>
            <CardTitle>Tracked Experiments</CardTitle>
            <CardDescription>
              Experiments are automatically detected from log files in the configured directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" className="mr-4" />
                <span className="text-muted-foreground">Loading experiments...</span>
              </div>
            ) : experiments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No experiments found</h3>
                <p className="text-muted-foreground mb-4">
                  Create log files in the server's log directory to start tracking experiments.
                </p>
                <p className="text-sm text-muted-foreground">
                  Example: <code className="bg-muted px-1 py-0.5 rounded">echo "hello" {'>>'} logs/exp_$(date +%s)_$$.log</code>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {experiments.map((experiment) => (
                  <div
                    key={experiment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedExperiment(experiment)}
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getStatusIcon(experiment.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium truncate">{experiment.name}</span>
                          <Badge variant="outline" className={getStatusColor(experiment.status)}>
                            {experiment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDateTime(experiment.created_at)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <HardDrive className="h-3 w-3" />
                            <span>{formatFileSize(experiment.size)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>{experiment.lines} lines</span>
                          </span>
                          {experiment.pid && (
                            <span className="flex items-center space-x-1">
                              <Activity className="h-3 w-3" />
                              <span>PID: {experiment.pid}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExperiment(experiment);
                        }}
                      >
                        View Logs
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExperiment(experiment.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}