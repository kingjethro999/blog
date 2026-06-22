'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from './header'
import { Footer } from './footer'
import { CategoryFilter } from './category-filter'
import { PostCard } from './post-card'
import { SubmitModal } from './submit-modal'
import type { Post } from '@/types/blog'

interface BlogClientProps {
  initialPosts: Post[]
  isAuthenticated: boolean
}

export function BlogClient({ initialPosts, isAuthenticated }: BlogClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const router = useRouter()

  const filteredPosts = selectedCategory === 'all' 
    ? initialPosts 
    : initialPosts.filter(post => post.category === selectedCategory)

  const handlePostSuccess = useCallback(() => {
    router.refresh()
  }, [router])

  return (
    <div className="flex min-h-screen flex-col">
      <Header 
        isAuthenticated={isAuthenticated} 
        onPostClick={() => setIsModalOpen(true)} 
      />
      
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <section className="mb-10 text-center">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              Where Whispers Become Words
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
              Your anonymous space to share opinions, spill the tea, and say what everyone&apos;s thinking but no one dares to say out loud.
            </p>
          </section>

          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          <div className="mt-6 space-y-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} isAuthenticated={isAuthenticated} />
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No posts yet. The silence is deafening...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      {isAuthenticated && (
        <SubmitModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onSuccess={handlePostSuccess}
        />
      )}
    </div>
  )
}
