'use client'

import { memo, useState, useCallback, useEffect } from 'react'
import { formatDate, getCategoryLabel, getCategoryColor, cn } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { CommentSection } from './comment-section'
import { updateReaction, getComments, deletePost } from '@/app/actions'
import type { Post, Comment } from '@/types/blog'
import { Trash2, Share2, Link as LinkIcon, Twitter, Facebook } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PostCardProps {
  post: Post
  isAuthenticated?: boolean
}

function PostCardComponent({ post, isAuthenticated = false }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { toast } = useToast()
  
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/#post-${post.id}` : ''

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl)
    toast({
      description: "Link copied to clipboard",
    })
  }, [shareUrl, toast])

  const handleShareTwitter = useCallback(() => {
    const text = encodeURIComponent(`Check out this post: ${post.title}`)
    const url = encodeURIComponent(shareUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }, [post.title, shareUrl])

  const handleShareFacebook = useCallback(() => {
    const url = encodeURIComponent(shareUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }, [shareUrl])
  const [comments, setComments] = useState<Comment[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [reactions, setReactions] = useState({
    fire: post.reactions_fire,
    tea: post.reactions_tea,
    cap: post.reactions_cap,
  })

  useEffect(() => {
    getComments(post.id).then(({ comments }) => {
      setComments(comments as Comment[])
    })
  }, [post.id])

  const handleReaction = useCallback(async (type: 'fire' | 'tea' | 'cap') => {
    setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }))
    await updateReaction(post.id, type)
  }, [post.id])

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    await deletePost(post.id)
    setIsDeleting(false)
  }, [post.id])

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const refreshComments = useCallback(async () => {
    const { comments } = await getComments(post.id)
    setComments(comments as Comment[])
  }, [post.id])

  const countAllComments = (comments: Comment[]): number => {
    return comments.reduce((count, comment) => {
      return count + 1 + (comment.replies ? countAllComments(comment.replies) : 0)
    }, 0)
  }

  const totalComments = countAllComments(comments)

  return (
    <Card id={`post-${post.id}`} className={cn("overflow-hidden border-border bg-card transition-shadow hover:shadow-md", isDeleting && "opacity-50 pointer-events-none")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('inline-block rounded-full px-3 py-1 text-xs font-medium', getCategoryColor(post.category))}>
                {getCategoryLabel(post.category)}
              </span>
              {isAuthenticated && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button 
                      className="ml-auto text-muted-foreground hover:text-destructive transition-colors p-1"
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the post
                        &quot;{post.title}&quot; and all its comments.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <h2 className="font-serif text-xl font-bold leading-tight text-foreground">
              {post.title}
            </h2>
          </div>
          <time className="shrink-0 text-xs text-muted-foreground">
            {formatDate(new Date(post.created_at))}
          </time>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className={cn('text-foreground/90 leading-relaxed', !isExpanded && 'line-clamp-3')}>
          {post.content}
        </p>
        {post.content.length > 200 && (
          <button
            onClick={toggleExpand}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t border-border bg-muted/30 pt-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-2">
            <ReactionButton
              emoji="🔥"
              count={reactions.fire}
              label="Fire"
              onClick={() => handleReaction('fire')}
            />
            <ReactionButton
              emoji="☕"
              count={reactions.tea}
              label="Tea"
              onClick={() => handleReaction('tea')}
            />
            <ReactionButton
              emoji="🧢"
              count={reactions.cap}
              label="Cap"
              onClick={() => handleReaction('cap')}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-sm transition-colors hover:bg-secondary"
                  aria-label="Share post"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="font-medium text-foreground">Share</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  <span>Copy Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareTwitter}>
                  <Twitter className="mr-2 h-4 w-4" />
                  <span>Twitter</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareFacebook}>
                  <Facebook className="mr-2 h-4 w-4" />
                  <span>Facebook</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <span className="text-xs text-muted-foreground">
            {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
          </span>
        </div>

        <CommentSection postId={post.id} comments={comments} onCommentAdded={refreshComments} isAuthenticated={isAuthenticated} />
      </CardFooter>
    </Card>
  )
}

interface ReactionButtonProps {
  emoji: string
  count: number
  label: string
  onClick: () => void
}

const ReactionButton = memo(function ReactionButton({ emoji, count, label, onClick }: ReactionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-sm transition-colors hover:bg-secondary"
      aria-label={`React with ${label}`}
    >
      <span>{emoji}</span>
      <span className="font-medium text-foreground">{count}</span>
    </button>
  )
})

export const PostCard = memo(PostCardComponent)
