'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Post, Comment } from '@/types/blog'

export async function createPost(formData: {
  title: string
  content: string
  excerpt: string
  category: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase.from('posts').insert({
    title: formData.title,
    content: formData.content,
    excerpt: formData.excerpt,
    category: formData.category,
    user_id: user.id,
  })

  if (error) {
    console.error('Error creating post:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function addComment(
  postId: string, 
  content: string, 
  alias: string,
  parentId?: string | null
) {
  const supabase = await createClient()
  
  // Check if user is authenticated (admin)
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = !!user

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    content,
    alias,
    parent_id: parentId || null,
    is_admin: isAdmin,
  })

  if (error) {
    console.error('Error adding comment:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function updateReaction(postId: string, reactionType: 'fire' | 'tea' | 'cap') {
  // Use admin client to bypass RLS for anonymous reactions
  const supabase = await createAdminClient()

  const column = `reactions_${reactionType}`
  
  // First get current value
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select(column)
    .eq('id', postId)
    .single()

  if (fetchError || !post) {
    console.error('Error fetching post for reaction:', fetchError)
    return { error: 'Post not found' }
  }

  const currentValue = (post as any)[column] || 0

  const { error: updateError } = await supabase
    .from('posts')
    .update({ [column]: currentValue + 1 })
    .eq('id', postId)

  if (updateError) {
    console.error('Error updating reaction count:', updateError)
    return { error: updateError.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function getPosts(category?: string): Promise<{ posts: Post[], error?: string }> {
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, posts: [] }
  }

  return { posts: (data || []) as Post[] }
}

export async function getComments(postId: string): Promise<{ comments: Comment[], error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    return { error: error.message, comments: [] }
  }

  // Build threaded comment tree
  const rawComments = (data || []) as Comment[]
  const commentMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  // First pass: create map of all comments
  rawComments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // Second pass: build tree structure
  rawComments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id)
      if (parent) {
        parent.replies = parent.replies || []
        parent.replies.push(commentWithReplies)
      }
    } else {
      rootComments.push(commentWithReplies)
    }
  })

  return { comments: rootComments }
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Comments will be deleted automatically if cascade is set up, 
  // but let's be explicit if needed. Usually Supabase FKs handle this.
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/')
}
