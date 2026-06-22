import { getUser, getPosts } from './actions'
import { BlogClient } from '@/components/blog/blog-client'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [user, { posts }] = await Promise.all([
    getUser(),
    getPosts()
  ])

  return <BlogClient initialPosts={posts} isAuthenticated={!!user} />
}
