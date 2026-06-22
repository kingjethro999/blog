'use client'

import { create } from 'zustand'
import type { Post, Comment } from '@/types/blog'
import { generateId, generateAlias } from '@/lib/utils'

interface BlogState {
  posts: Post[]
  selectedCategory: Post['category'] | 'all'
  isSubmitModalOpen: boolean
}

interface BlogActions {
  addPost: (post: Omit<Post, 'id' | 'created_at' | 'reactions_fire' | 'reactions_tea' | 'reactions_cap'>) => void
  addComment: (postId: string, content: string) => void
  addReaction: (postId: string, type: 'fire' | 'tea' | 'cap') => void
  setSelectedCategory: (category: BlogState['selectedCategory']) => void
  toggleSubmitModal: () => void
  getFilteredPosts: () => Post[]
}

const initialPosts: Post[] = [
  {
    id: '1',
    title: 'The Library WiFi Situation Needs to Change',
    content: 'Let me be real - trying to submit an assignment at the library is like playing Russian roulette with your GPA. The WiFi cuts out every 15 minutes and nobody seems to care. I\'ve seen people literally crying at 11:59 PM because their paper won\'t upload. Administration keeps saying they\'re "working on it" but I\'ve been hearing that since freshman year. At this point, I trust the campus squirrels more than the network connection.',
    excerpt: 'The WiFi situation is getting out of hand and we need to talk about it...',
    category: 'opinion',
    created_at: new Date('2024-12-01').toISOString(),
    reactions_fire: 234,
    reactions_tea: 89,
    reactions_cap: 12
  },
  {
    id: '2',
    title: 'Spotted: That One Professor Who Actually Cares',
    content: 'Y\'all know who I\'m talking about. The one who holds extra office hours, actually responds to emails, and genuinely wants you to succeed. Saw them tutoring students at the coffee shop AGAIN yesterday. They weren\'t even getting paid for it. We don\'t deserve them. If you have Professor M for anything, consider yourself blessed. That\'s all. That\'s the post.',
    excerpt: 'A rare appreciation post for the professor who goes above and beyond...',
    category: 'gossip',
    created_at: new Date('2024-11-28').toISOString(),
    reactions_fire: 567,
    reactions_tea: 23,
    reactions_cap: 3
  },
  {
    id: '3',
    title: 'Hot Take: The New Cafeteria Food Hits Different',
    content: 'I know everyone loves to hate on campus food but hear me out - the new chef they hired actually understands seasoning. The Thursday special is unironically better than some restaurants I\'ve been to. Yeah I said it. Fight me in the comments but you know I\'m right. Also whoever decided to add real coffee to the machines deserves a raise.',
    excerpt: 'Controversial opinion incoming about the cafeteria...',
    category: 'hot-take',
    created_at: new Date('2024-11-25').toISOString(),
    reactions_fire: 145,
    reactions_tea: 234,
    reactions_cap: 178
  },
  {
    id: '4',
    title: 'The Unwritten Rules of the Study Room',
    content: 'Since some people clearly missed the memo: 1) Your group project meeting does NOT need to be louder than a concert. 2) If you\'re sleeping, you\'re not studying - go home. 3) Phone calls belong OUTSIDE. 4) Stop leaving your stuff to "save" a spot for 3 hours. We see you. We judge you. Do better.',
    excerpt: 'Some of you need a refresher on basic etiquette...',
    category: 'campus-life',
    created_at: new Date('2024-11-20').toISOString(),
    reactions_fire: 892,
    reactions_tea: 156,
    reactions_cap: 8
  }
]

export const useBlogStore = create<BlogState & BlogActions>((set, get) => ({
  posts: initialPosts,
  selectedCategory: 'all',
  isSubmitModalOpen: false,

  addPost: (postData) => {
    const newPost: Post = {
      ...postData as any,
      id: generateId(),
      created_at: new Date().toISOString(),
      reactions_fire: 0,
      reactions_tea: 0,
      reactions_cap: 0
    }
    set((state) => ({ posts: [newPost, ...state.posts] }))
  },

  addComment: (postId, content) => {
    // Note: Local store comment adding is not fully implemented for threaded comments
    // but we update the type to avoid errors
  },

  addReaction: (postId, type) => {
    const column = `reactions_${type}` as const
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? { ...post, [column]: (post as any)[column] + 1 }
          : post
      )
    }))
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  toggleSubmitModal: () => set((state) => ({ isSubmitModalOpen: !state.isSubmitModalOpen })),

  getFilteredPosts: () => {
    const { posts, selectedCategory } = get()
    if (selectedCategory === 'all') return posts
    return posts.filter((post) => post.category === selectedCategory)
  }
}))
