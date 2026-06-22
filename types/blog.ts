export interface Comment {
  id: string
  post_id: string
  content: string
  created_at: string
  alias: string
  parent_id: string | null
  is_admin: boolean
  replies?: Comment[]
}

export interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  category: 'opinion' | 'gossip' | 'campus-life' | 'hot-take'
  created_at: string
  reactions_fire: number
  reactions_tea: number
  reactions_cap: number
}

export interface SubmissionForm {
  title: string
  content: string
  category: Post['category']
}
