'use client'

import { useState, useCallback } from 'react'
import { createPost } from '@/app/actions'
import { getCategoryLabel } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const categories = ['opinion', 'gossip', 'campus-life', 'hot-take'] as const
type Category = typeof categories[number]

interface SubmitModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function SubmitModal({ isOpen, onClose, onSuccess }: SubmitModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<Category>('opinion')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)
    setError(null)
    
    const result = await createPost({
      title: title.trim(),
      content: content.trim(),
      excerpt: content.trim().slice(0, 150) + (content.length > 150 ? '...' : ''),
      category
    })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setTitle('')
    setContent('')
    setCategory('opinion')
    setIsSubmitting(false)
    onSuccess()
    onClose()
  }, [title, content, category, onClose, onSuccess])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setError(null)
      onClose()
    }
  }, [isSubmitting, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      <div className="relative w-full max-w-lg rounded-xl bg-card p-6 shadow-xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="font-serif text-2xl font-bold text-foreground">Share Your Voice</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Post anonymously to the campus.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-foreground">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="content" className="mb-1.5 block text-sm font-medium text-foreground">
              Your Post
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Let it all out... anonymously."
              rows={5}
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={2000}
              required
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {content.length}/2000
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
