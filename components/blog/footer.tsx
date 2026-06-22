export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <p className="font-serif text-lg font-medium text-foreground">
          The Masked Voice
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Where campus whispers find their voice. Completely anonymous. Always unfiltered.
        </p>
        <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground">
          <span>All posts are anonymous</span>
          <span>•</span>
          <span>No tracking</span>
          <span>•</span>
          <span>Speak freely</span>
        </div>
      </div>
    </footer>
  )
}
