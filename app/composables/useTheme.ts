export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'jobizzy-theme'

/**
 * Light/dark theme, applied by toggling `data-theme="dark"` on <html> — the
 * attribute the design's token system keys off. State is shared across the app
 * via useState and persisted to localStorage.
 *
 * Light is the SSR default (it matches the CSS `:root` palette, so no flash for
 * light users). The stored preference is read on the client after mount, which
 * is the only place localStorage exists.
 */
export function useTheme() {
  const theme = useState<Theme>('jobizzy-theme', () => 'light')

  function apply(value: Theme): void {
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', value)
    }
  }

  function set(value: Theme): void {
    theme.value = value
    apply(value)
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY, value)
      } catch {
        // Private-mode / disabled storage — preference just won't persist.
      }
    }
  }

  function toggle(): void {
    set(theme.value === 'light' ? 'dark' : 'light')
  }

  // Adopt the stored preference once, on the client.
  function init(): void {
    if (!import.meta.client) return
    let stored: Theme | null = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === 'light' || raw === 'dark') stored = raw
    } catch {
      // ignore
    }
    if (stored) {
      theme.value = stored
    }
    apply(theme.value)
  }

  const isDark = computed(() => theme.value === 'dark')

  return { theme, isDark, set, toggle, init }
}
