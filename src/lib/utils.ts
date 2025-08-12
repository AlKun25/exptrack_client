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
    case 'running': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }
}

export function getStatusIcon(status: string): React.ReactElement {
  switch (status) {
    case 'running':
      return (
        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      )
    case 'completed':
      return (
        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-500" />
      )
    case 'failed':
      return (
        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-red-500" />
      )
    default:
      return (
        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-gray-500" />
      )
  }
}