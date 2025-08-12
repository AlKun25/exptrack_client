import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString()
}

export function formatDuration(startTime: string, endTime?: string): string {
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date()
  const diff = end.getTime() - start.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'running': return 'bg-chart-3/10 text-chart-3 border-chart-3/20'
    case 'completed': return 'bg-primary/10 text-primary border-primary/20'
    case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20'
    default: return 'bg-muted text-muted-foreground border-border'
  }
}

export function getStatusIcon(status: string): { className: string; size: string } {
  switch (status) {
    case 'running':
      return {
        className: "flex-shrink-0 rounded-full bg-chart-3 animate-pulse",
        size: "h-3 w-3"
      }
    case 'completed':
      return {
        className: "flex-shrink-0 rounded-full bg-primary",
        size: "h-3 w-3"
      }
    case 'failed':
      return {
        className: "flex-shrink-0 rounded-full bg-destructive",
        size: "h-3 w-3"
      }
    default:
      return {
        className: "flex-shrink-0 rounded-full bg-muted-foreground",
        size: "h-3 w-3"
      }
  }
}