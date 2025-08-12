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
import { formatDateTime, formatDuration, getStatusColor, getStatusIcon } from '@/lib/utils';
import { FileText, Trash2, Clock, Activity } from 'lucide-react';

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
                Connected to: {serverConfig?.url || 'Unknown'}
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
      <main className="container py-8 px-6">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Total Experiments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{experiments.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-chart-3">
                {experiments.filter(e => e.status === 'running').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-primary">
                {experiments.filter(e => e.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-destructive">
                {experiments.filter(e => e.status === 'failed').length}
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
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="lg" className="mr-4" />
                <span className="text-muted-foreground">Loading experiments...</span>
              </div>
            ) : (experiments?.length || 0) === 0 ? (
              <div className="text-center py-16">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No experiments found</h3>
                <p className="text-muted-foreground mb-4">
                  Create log files in the server's log directory to start tracking experiments.
                </p>
                <p className="text-sm text-muted-foreground">
                  Example: <code className="bg-muted px-2 py-1 rounded">echo "hello" {'>>'} logs/exp_$(date +%s)_$$.log</code>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {experiments.map((experiment) => (
                  <div
                    key={experiment.id}
                    className="flex items-center justify-between p-5 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedExperiment(experiment)}
                  >
                    <div className="flex items-center space-x-5 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className={`${getStatusIcon(experiment.status).className} ${getStatusIcon(experiment.status).size}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium truncate">{experiment.id}</span>
                          <Badge variant="outline" className={getStatusColor(experiment.status)}>
                            {experiment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatDateTime(experiment.started_at)}</span>
                          </span>
                          <span className="flex items-center space-x-2 max-w-[200px] truncate">
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <span title={experiment.command}>{experiment.command}</span>
                          </span>
                          {experiment.pid && (
                            <span className="flex items-center space-x-2">
                              <Activity className="h-3 w-3" />
                              <span>PID: {experiment.pid}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
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