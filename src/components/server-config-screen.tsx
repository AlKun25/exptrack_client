'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useServerConfig } from '@/hooks/useServerConfig';
import { ServerConfig } from '@/types';

export function ServerConfigScreen({
  onConfigured,
  onBack,
}: {
  onConfigured: (config: ServerConfig) => void;
  onBack: () => void;
}) {
  const [formData, setFormData] = useState({
    serverUrl: '',
    apiKey: '',
  });
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { testConnection, isLoading, error, loadConfig } = useServerConfig();

  useEffect(() => {
    // Load saved config on mount
    const savedConfig = loadConfig();
    if (savedConfig) {
      setFormData({
        serverUrl: savedConfig.url,
        apiKey: savedConfig.apiKey || '',
      });
    }
  }, [loadConfig]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.serverUrl) {
      newErrors.serverUrl = 'Server URL is required';
    } else {
      try {
        new URL(formData.serverUrl);
      } catch {
        newErrors.serverUrl = 'Please enter a valid URL';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) return;
    
    setTestResult(null);
    
    const result = await testConnection(formData.serverUrl, formData.apiKey || undefined);
    
    setTestResult({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const config: ServerConfig = {
      url: formData.serverUrl,
      apiKey: formData.apiKey || undefined,
    };
    
    onConfigured(config);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear test result when form changes
    setTestResult(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Server Configuration</CardTitle>
          <CardDescription>
            Connect to your experiment log monitor server
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div>
                <Input
                  id="server-url"
                  name="serverUrl"
                  type="url"
                  placeholder="https://your-server.com:8000"
                  value={formData.serverUrl}
                  onChange={handleChange}
                  className={errors.serverUrl ? 'border-red-500' : ''}
                />
                {errors.serverUrl && (
                  <p className="text-sm text-red-500 mt-1">{errors.serverUrl}</p>
                )}
              </div>
              
              <div>
                <Input
                  id="api-key"
                  name="apiKey"
                  type="password"
                  placeholder="API Key (Optional)"
                  value={formData.apiKey}
                  onChange={handleChange}
                  className={errors.apiKey ? 'border-red-500' : ''}
                />
                {errors.apiKey && (
                  <p className="text-sm text-red-500 mt-1">{errors.apiKey}</p>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {testResult && (
              <Alert className={testResult.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={testResult.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isLoading || !formData.serverUrl}
                className="flex-1"
              >
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : 'Test Connection'}
              </Button>
              
              <Button
                type="submit"
                disabled={!formData.serverUrl}
                className="flex-1"
              >
                Connect
              </Button>
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="text-sm"
              >
                ← Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}