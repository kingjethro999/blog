import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

const adjectives = ['Anonymous', 'Silent', 'Masked', 'Hidden', 'Secret', 'Mysterious', 'Quiet', 'Shadowy']
const animals = ['Owl', 'Fox', 'Bear', 'Wolf', 'Raven', 'Hawk', 'Mouse', 'Deer', 'Lynx', 'Crow']

export function generateAlias(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${adj} ${animal}`
}

export function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'opinion': 'Opinion',
    'gossip': 'Tea Time',
    'campus-life': 'Campus Life',
    'hot-take': 'Hot Take'
  }
  return labels[category] || category
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'opinion': 'bg-primary text-primary-foreground',
    'gossip': 'bg-accent text-accent-foreground',
    'campus-life': 'bg-secondary text-secondary-foreground',
    'hot-take': 'bg-destructive text-destructive-foreground'
  }
  return colors[category] || 'bg-muted text-muted-foreground'
}
