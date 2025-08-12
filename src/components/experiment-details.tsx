'use client';

import { useState, useEffect } from 'react';
import { Experiment, ServerConfig } from '@/types';
import { useExperimentLogs } from '@/hooks/useExperimentLogs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDateTime, formatDuration, getStatusColor } from '@/lib/utils';
import { 
  ArrowLeft, 
  Trash2, 
  FileText, 
  RefreshCw,
  Download,
  Maximize2
} from 'lucide-react';

interface ExperimentDetailsProps {
  experiment: Experiment;
  serverConfig: ServerConfig;
  onBack: () => void;
  onDeleteExperiment: (id: string) => void;
}

export function ExperimentDetails({ 
  experiment, 
  serverConfig, 
  onBack, 
  onDeleteExperiment 
}: ExperimentDetailsProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [maxLines, setMaxLines] = useState(100);
  const { logs, isLoading, error, fetchLogs } = useExperimentLogs(serverConfig);

  useEffect(() => {
    fetchLogs(experiment.id, maxLines);
  }, [experiment.id, maxLines, fetchLogs]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && experiment.status === 'running') {
      interval = setInterval(() => {
        fetchLogs(experiment.id, maxLines);
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, experiment.status, experiment.id, maxLines, fetchLogs]);

  const handleDeleteExperiment = () => {
    onDeleteExperiment(experiment.id);
  };

  const handleDownloadLogs = () => {
    const blob = new Blob([logs.join('')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${experiment.id}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFullscreenLogs = () => {
    const logContent = logs.join('');
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${experiment.id} - Logs</title>
          <style>
            body { 
              font-family: 'Fira Code', 'Courier New', monospace; 
              background: #0d1117; 
              color: #c9d1d9; 
              padding: 20px; 
              margin: 0;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>${logContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{experiment.id}</h1>
              <p className="text-sm text-muted-foreground">Experiment Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteExperiment}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Stop Tracking
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Experiment Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Experiment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant="outline" className={getStatusColor(experiment.status)}>
                    {experiment.status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Started</span>
                    <span>{formatDateTime(experiment.started_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{formatDuration(experiment.started_at, experiment.last_updated)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{formatDateTime(experiment.last_updated)}</span>
                  </div>
                </div>

                {experiment.pid && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Process ID</span>
                    <span className="font-mono">{experiment.pid}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Command</span>
                  <span className="font-mono text-xs truncate max-w-[200px]" title={experiment.command}>
                    {experiment.command}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Log File</span>
                  <span className="font-mono text-xs truncate max-w-[200px]" title={experiment.log_file}>
                    {experiment.log_file.split('/').pop()}
                  </span>
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Logs */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Experiment Logs</CardTitle>
                    <CardDescription>
                      Showing last {logs.length} lines
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={maxLines}
                      onChange={(e) => setMaxLines(Number(e.target.value))}
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value={50}>50 lines</option>
                      <option value={100}>100 lines</option>
                      <option value={500}>500 lines</option>
                      <option value={1000}>1000 lines</option>
                    </select>
                    
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="rounded border-input"
                      />
                      <span>Auto-refresh</span>
                    </label>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchLogs(experiment.id, maxLines)}
                      disabled={isLoading}
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFullscreenLogs}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadLogs}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <ScrollArea className="h-[600px] w-full rounded-md border bg-muted p-6">
                  {isLoading && logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <FileText className="h-12 w-12 mr-4" />
                      <span>No logs available</span>
                    </div>
                  ) : (
                    <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
                      {logs.join('')}
                    </pre>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}