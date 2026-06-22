'use client'

import { cn, getCategoryLabel } from '@/lib/utils'

const categories = ['all', 'opinion', 'gossip', 'campus-life', 'hot-take'] as const

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-all',
            selectedCategory === category
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card text-foreground hover:bg-muted'
          )}
        >
          {category === 'all' ? 'All Posts' : getCategoryLabel(category)}
        </button>
      ))}
    </div>
  )
}
