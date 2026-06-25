// Shared, framework-agnostic helpers usable from app/, server/, and lib/.

// A job is a "strong match" when its Gemini match_score is at or above this.
// Single source of truth — never hardcode 70. Feature 11's High/Low Match filter
// and the find-agent's "strong matches" count both read this.
export const MATCH_THRESHOLD = 70

// Human-friendly "time ago" for a job's found_at (and reusable on job details).
// Falls back to an absolute date once it's more than a week old.
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const seconds = Math.floor((Date.now() - then) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
