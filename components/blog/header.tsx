'use client'

import { Plus, PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  isAuthenticated: boolean
  onPostClick: () => void
}

export function Header({ isAuthenticated, onPostClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <PenLine className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">
              The Masked Voice
            </h1>
            <p className="text-xs text-muted-foreground">Campus whispers, unfiltered</p>
          </div>
        </div>

        {isAuthenticated && (
          <Button
            onClick={onPostClick}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-5 w-5 md:hidden" />
            <span className="hidden items-center gap-2 md:flex">
              <PenLine className="h-4 w-4" />
              New Post
            </span>
          </Button>
        )}
      </div>
    </header>
  )
}
