'use client'

import { memo, useState, useCallback } from 'react'
import { formatDate, generateAlias, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { addComment } from '@/app/actions'
import { Heart, Reply } from 'lucide-react'
import type { Comment } from '@/types/blog'

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  onCommentAdded: () => void
  isAuthenticated?: boolean
}

export const CommentSection = memo(function CommentSection({ 
  postId, 
  comments, 
  onCommentAdded,
  isAuthenticated = false 
}: CommentSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent, parentId?: string | null) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    const alias = isAuthenticated ? 'The Voice' : generateAlias()
    await addComment(postId, newComment.trim(), alias, parentId)
    setNewComment('')
    setReplyingTo(null)
    setIsSubmitting(false)
    onCommentAdded()
  }, [postId, newComment, isSubmitting, onCommentAdded, isAuthenticated])

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const countAllComments = (comments: Comment[]): number => {
    return comments.reduce((count, comment) => {
      return count + 1 + (comment.replies ? countAllComments(comment.replies) : 0)
    }, 0)
  }

  const totalComments = countAllComments(comments)

  return (
    <div className="w-full">
      <button
        onClick={toggleOpen}
        className="text-sm font-medium text-primary hover:underline transition-all"
      >
        {isOpen ? 'Hide comments' : `View comments (${totalComments})`}
      </button>

      {isOpen && (
        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <CommentThread 
                  key={comment.id} 
                  comment={comment}
                  depth={0}
                  isLast={index === comments.length - 1}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  isSubmitting={isSubmitting}
                  handleSubmit={handleSubmit}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No comments yet. Be the first to share your thoughts!</p>
          )}

          {/* Root comment form */}
          {!replyingTo && (
            <form onSubmit={(e) => handleSubmit(e, null)} className="flex gap-2 group">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add an anonymous comment..."
                className="flex-1 rounded-2xl border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                maxLength={500}
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="rounded-2xl px-6"
              >
                {isSubmitting ? '...' : 'Post'}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  )
})

interface CommentThreadProps {
  comment: Comment
  depth: number
  isLast: boolean
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  newComment: string
  setNewComment: (value: string) => void
  isSubmitting: boolean
  handleSubmit: (e: React.FormEvent, parentId?: string | null) => Promise<void>
}

const CommentThread = memo(function CommentThread({ 
  comment, 
  depth,
  isLast,
  replyingTo,
  setReplyingTo,
  newComment,
  setNewComment,
  isSubmitting,
  handleSubmit
}: CommentThreadProps) {
  const isReplying = replyingTo === comment.id
  const maxDepth = 3
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className="relative">
      {/* Curved line logic for nested comments */}
      {depth > 0 && (
        <div className="absolute -left-[26px] top-0 bottom-0 w-[26px] pointer-events-none" aria-hidden="true">
          {/* Vertical track line */}
          <div 
            className={cn(
              "absolute left-0 top-0 w-[2px] bg-border/60",
              isLast ? "h-5" : "h-full"
            )} 
          />
          {/* Horizontal hook with curve */}
          <div 
            className={cn(
              "absolute left-0 top-5 h-[2px] bg-border/60",
              isLast ? "w-4 rounded-bl-full" : "w-6"
            )}
            style={isLast ? { borderBottomLeftRadius: '12px', borderLeftWidth: '2px', height: '12px', top: '8px', borderLeftColor: 'var(--border)' } : {}}
          />
          {/* Refined curve using border trick for the last child */}
          {isLast && (
            <div className="absolute left-0 top-0 w-6 h-5 border-l-2 border-b-2 border-border/60 rounded-bl-xl" />
          )}
          {!isLast && (
             <div className="absolute left-0 top-5 w-6 h-0 border-b-2 border-border/60" />
          )}
        </div>
      )}

      <div className="flex gap-2 items-start relative group">
        {/* Avatar Section */}
        <div className="relative flex flex-col items-center flex-shrink-0 w-10">
          <div className="relative z-10 w-10 h-10 rounded-full bg-secondary flex items-center justify-center border-2 border-background shadow-sm transition-transform group-hover:scale-105">
            <span className="text-sm font-bold text-secondary-foreground select-none">
              {comment.alias.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Vertical line that starts under the avatar if there are replies */}
          {hasReplies && (
            <div className="absolute top-10 bottom-0 w-[2px] bg-border/60" aria-hidden="true" />
          )}
        </div>

        {/* Content Box Section */}
        <div className="flex-1 min-w-0">
          <div className="bg-muted/40 hover:bg-muted/60 transition-all rounded-2xl p-4 shadow-sm border border-border/40">
            {/* Header: Alias and Date */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-bold text-foreground/90 tracking-tight">{comment.alias}</span>
              {comment.is_admin && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black text-primary border border-primary/20 uppercase tracking-widest">
                  Admin
                </span>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto font-medium opacity-70">
                {formatDate(new Date(comment.created_at))}
              </span>
            </div>
            
            {/* Content Text */}
            <p className="text-sm text-foreground/80 leading-relaxed break-words font-medium">
              {comment.content}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-5 mt-2 ml-3">
            <button className="group flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-primary transition-all">
              <Heart className="w-3.5 h-3.5 transition-transform group-active:scale-125" />
              <span>LIKE</span>
            </button>
            {depth < maxDepth && (
              <button
                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                className={cn(
                  "flex items-center gap-1.5 text-[11px] font-bold transition-all",
                  isReplying ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <Reply className="w-3.5 h-3.5" />
                <span>REPLY</span>
              </button>
            )}
          </div>

          {/* Inline Reply Form */}
          {isReplying && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <form 
                onSubmit={(e) => handleSubmit(e, comment.id)} 
                className="flex gap-2 p-1 bg-muted/30 rounded-2xl border border-border/50"
              >
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Write a reply to ${comment.alias}...`}
                  className="flex-1 bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
                  maxLength={500}
                  disabled={isSubmitting}
                  autoFocus
                />
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl px-5 font-bold"
                  disabled={!newComment.trim() || isSubmitting}
                >
                  {isSubmitting ? '...' : 'Send'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Recursive Replies Container */}
      {hasReplies && (
        <div className="ml-10 mt-4 space-y-6">
          {comment.replies!.map((reply, index) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              isLast={index === comment.replies!.length - 1}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              newComment={newComment}
              setNewComment={setNewComment}
              isSubmitting={isSubmitting}
              handleSubmit={handleSubmit}
            />
          ))}
        </div>
      )}
    </div>
  )
})


