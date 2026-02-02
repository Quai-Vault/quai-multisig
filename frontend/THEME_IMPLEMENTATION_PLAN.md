# Light/Dark Theme Implementation Plan

## Overview

Add light theme support to the frontend while maintaining the existing dark theme. The system will:
- Honor the user's system preference by default
- Allow manual override via a toggle at the bottom of the sidebar
- Persist the user's choice across sessions
- Maintain the red/primary accent color scheme in both themes

## Current State Analysis

### Existing Setup
- **Tailwind Config:** Custom colors defined (primary, dark, vault palettes)
- **index.html:** Already has `class="dark"` on `<html>` element
- **index.css:** 8 custom component classes in `@layer components`
- **State Management:** Zustand with persist middleware (see walletStore.ts pattern)
- **Theme System:** None - all colors hardcoded for dark theme

### Color Palettes Available
```
primary: 50-950 (reds - accent colors)
dark: 50-950 (grays - light to dark)
vault: black, dark-1 to dark-4, red-glow, red-accent, red-dark, metallic
```

**Key insight:** The `dark-*` palette already contains light colors (dark-50 through dark-200) that can serve as light theme backgrounds.

---

## Approach: Tailwind `darkMode: 'class'` + CSS Custom Properties

### Why This Approach
1. **Tailwind's `dark:` modifier** is idiomatic and well-documented
2. **CSS custom properties** needed for complex values (gradients, shadows, scrollbar colors)
3. **index.html already has `class="dark"`** - minimal setup change needed
4. **No major refactoring** - just add `dark:` prefixes to existing classes

### How It Works
1. Add `darkMode: 'class'` to tailwind.config.js
2. Default classes become light theme, `dark:` variants become dark theme
3. Toggle `dark` class on `<html>` element via JavaScript
4. CSS variables handle complex values that can't use Tailwind classes

---

## Implementation Phases

### Phase 1: Foundation (4 files)

**1. tailwind.config.js** - Add dark mode configuration
```javascript
export default {
  darkMode: 'class',  // ADD THIS LINE
  content: [...],
  theme: { ... }
}
```

**2. src/store/themeStore.ts** - Create new theme store
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'dark',

      setTheme: (theme) => {
        const resolved = theme === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : theme;

        document.documentElement.classList.toggle('dark', resolved === 'dark');
        set({ theme, resolvedTheme: resolved });
      },

      initializeTheme: () => {
        const { theme } = get();
        const resolved = theme === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : theme;

        document.documentElement.classList.toggle('dark', resolved === 'dark');
        set({ resolvedTheme: resolved });

        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', (e) => {
            if (get().theme === 'system') {
              const newResolved = e.matches ? 'dark' : 'light';
              document.documentElement.classList.toggle('dark', newResolved === 'dark');
              set({ resolvedTheme: newResolved });
            }
          });
      },
    }),
    { name: 'theme-storage', partialize: (state) => ({ theme: state.theme }) }
  )
);
```

**3. index.html** - Add flash prevention script
```html
<html lang="en">  <!-- Remove class="dark", let JS handle it -->
  <head>
    <!-- Add before </head> -->
    <script>
      (function() {
        const stored = localStorage.getItem('theme-storage');
        let theme = 'system';
        try { theme = JSON.parse(stored)?.state?.theme || 'system'; } catch(e) {}
        const isDark = theme === 'dark' ||
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) document.documentElement.classList.add('dark');
      })();
    </script>
  </head>
```

**4. src/main.tsx** - Initialize theme before render
```typescript
import { useThemeStore } from './store/themeStore';

// Initialize theme before render
useThemeStore.getState().initializeTheme();

createRoot(document.getElementById('root')!).render(...)
```

---

### Phase 2: Core CSS (1 file)

**src/index.css** - Add CSS variables and update component classes

#### CSS Custom Properties
```css
:root {
  /* Light theme (default) */
  --body-bg: #fafafa;
  --body-bg-gradient: radial-gradient(ellipse at top, rgba(220, 38, 38, 0.03) 0%, transparent 50%);
  --scrollbar-track: #f5f5f5;
  --scrollbar-thumb: #dc2626;
  --shadow-vault-outer: 0 2px 4px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.05);
  --shadow-vault-card: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-red-glow: none;
  --shadow-red-glow-lg: 0 0 20px rgba(220, 38, 38, 0.1);
  --panel-gradient: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  --panel-accent-line: rgba(220, 38, 38, 0.3);
}

.dark {
  /* Dark theme */
  --body-bg: #000000;
  --body-bg-gradient: radial-gradient(ellipse at top, rgba(220, 38, 38, 0.05) 0%, transparent 50%),
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(220, 38, 38, 0.02) 2px, rgba(220, 38, 38, 0.02) 4px);
  --scrollbar-track: #000000;
  --scrollbar-thumb: #dc2626;
  --shadow-vault-outer: 0 4px 6px rgba(0, 0, 0, 0.7), 0 10px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(220, 38, 38, 0.2);
  --shadow-vault-card: 0 8px 16px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(220, 38, 38, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  --shadow-red-glow: 0 0 20px rgba(220, 38, 38, 0.3), 0 0 40px rgba(220, 38, 38, 0.1);
  --shadow-red-glow-lg: 0 0 40px rgba(220, 38, 38, 0.4), 0 0 80px rgba(220, 38, 38, 0.2);
  --panel-gradient: linear-gradient(135deg, #0a0a0a 0%, #111111 25%, #1a0505 50%, #111111 75%, #0a0a0a 100%);
  --panel-accent-line: rgba(220, 38, 38, 0.5);
}
```

#### Base Layer Updates
```css
@layer base {
  * {
    @apply border-dark-200 dark:border-dark-700;
  }

  body {
    @apply bg-dark-50 dark:bg-vault-black text-dark-800 dark:text-dark-100 font-sans antialiased;
    background-color: var(--body-bg);
    background-image: var(--body-bg-gradient);
    background-attachment: fixed;
  }

  /* Scrollbar - use CSS variables */
  * {
    scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  }
  *::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
  }
}
```

#### Component Class Updates
```css
@layer components {
  .btn-primary {
    /* Keep existing - red works for both themes */
  }

  .btn-secondary {
    @apply px-5 py-2.5 text-base font-semibold
           text-dark-700 dark:text-dark-100
           bg-dark-100 dark:bg-vault-dark-4
           rounded-md
           border border-dark-300 dark:border-dark-600
           hover:bg-dark-200 dark:hover:bg-vault-dark-3
           hover:border-dark-400 dark:hover:border-dark-500
           active:scale-[0.98] transition-all duration-200;
  }

  .card {
    @apply bg-white dark:bg-gradient-to-br dark:from-vault-dark-2 dark:to-vault-dark-3
           rounded-lg border border-dark-200 dark:border-dark-700
           hover:border-primary-400 dark:hover:border-primary-600/30
           transition-all duration-300 relative overflow-hidden;
    box-shadow: var(--shadow-vault-card);
  }

  .input-field {
    @apply px-4 py-2.5
           bg-white dark:bg-vault-dark-3
           border border-dark-300 dark:border-dark-600
           rounded-md
           text-dark-800 dark:text-dark-100
           placeholder-dark-400 dark:placeholder-dark-500
           font-mono text-base
           focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-600/50
           focus:border-primary-500 dark:focus:border-primary-600
           transition-all duration-200;
  }

  .vault-panel {
    @apply border rounded-lg relative overflow-hidden
           bg-white dark:bg-gradient-to-br dark:from-vault-dark-1 dark:via-vault-dark-2 dark:to-vault-dark-1
           border-dark-200 dark:border-dark-700;
    box-shadow: var(--shadow-vault-outer);
  }

  .vault-badge {
    @apply inline-flex items-center px-3 py-1.5 rounded text-base font-semibold
           bg-dark-100 dark:bg-vault-dark-4
           border border-dark-300 dark:border-dark-600
           text-dark-600 dark:text-dark-200;
  }

  .vault-text-glow {
    /* Only glow in dark mode */
  }
  .dark .vault-text-glow {
    text-shadow: 0 0 10px rgba(220, 38, 38, 0.5), 0 0 20px rgba(220, 38, 38, 0.3);
  }

  .vault-divider {
    @apply border-t border-dark-200 dark:border-dark-700 relative;
  }
}
```

---

### Phase 3: Theme Toggle Component (1 new file)

**src/components/ThemeToggle.tsx**
```typescript
import { useThemeStore } from '../store/themeStore';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme) + 1) % 3];
    setTheme(next);
  };

  const icons = {
    light: <SunIcon />,
    dark: <MoonIcon />,
    system: <MonitorIcon />,
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium
                 text-dark-500 dark:text-dark-400
                 hover:text-dark-700 dark:hover:text-dark-200
                 hover:bg-dark-100 dark:hover:bg-vault-dark-4
                 rounded-md transition-all"
    >
      <span className="text-primary-500">{icons[theme]}</span>
      <span className="flex-1 text-left capitalize">{theme}</span>
      {theme === 'system' && (
        <span className="text-xs text-dark-400">({resolvedTheme})</span>
      )}
    </button>
  );
}
```

---

### Phase 4: Layout Components (4 files)

| File | Key Changes |
|------|-------------|
| `Layout.tsx` | Background, animated orbs opacity, navbar, warning banner |
| `Sidebar.tsx` | Background, borders, integrate ThemeToggle at bottom |
| `DocsSidebar.tsx` | Same updates as Sidebar |
| `Modal.tsx` | Backdrop overlay, panel background |

**Layout.tsx specific changes:**
- `bg-vault-black` → `bg-dark-50 dark:bg-vault-black`
- Animated orbs: `bg-primary-600/5` → `bg-primary-600/3 dark:bg-primary-600/5`
- Warning banner: Keep yellow gradient (works for both)
- Navbar: Use `vault-panel` class (already theme-aware after CSS update)

**Sidebar.tsx specific changes:**
- Add `<ThemeToggle />` in a `mt-auto` container at bottom
- `bg-vault-dark-2` → `bg-white dark:bg-vault-dark-2`
- `border-dark-700` → `border-dark-200 dark:border-dark-700`

---

### Phase 5: Shared Components (25 files)

| Component | Key Changes |
|-----------|-------------|
| `NotificationToast.tsx` | Status colors (success/warning/error/info variants) |
| `WalletCard.tsx` | Panel backgrounds, text colors, badges |
| `ConfirmDialog.tsx` | Panel, variant button colors |
| `EmptyState.tsx` | Icon colors, text colors |
| `TransactionList.tsx` | Progress bars, status badges, panels |
| `TransactionPreview.tsx` | Panel, text colors |
| `TransactionFlow.tsx` | Step indicators, backgrounds |
| `WalletCreationFlow.tsx` | Step indicators, backgrounds |
| `CopyButton.tsx` | Icon colors |
| `ExplorerLink.tsx` | Icon colors |
| `SyncStatusBadge.tsx` | Status indicator colors |
| `OwnerManagement.tsx` | Panel, badges, buttons |
| `ModuleManagement.tsx` | Panel, cards, toggles |
| `DailyLimitConfiguration.tsx` | Warning box colors |
| `WhitelistConfiguration.tsx` | Success box colors |
| `SocialRecoveryConfiguration.tsx` | Warning/success boxes |
| `SocialRecoveryManagement.tsx` | Panel, status colors |
| `DepositHistory.tsx` | Panel, text colors |
| `NotificationContainer.tsx` | Container background (if any) |

**Transaction Modals (9 files):**
- `ApproveTransactionModal.tsx`
- `ExecuteTransactionModal.tsx`
- `CancelTransactionModal.tsx`
- `RevokeApprovalModal.tsx`
- `AddOwnerModal.tsx`
- `RemoveOwnerModal.tsx`
- `ChangeThresholdModal.tsx`
- `EnableModuleModal.tsx`
- `DisableModuleModal.tsx`

All modals inherit from `Modal.tsx` so mainly need text color updates.

---

### Phase 6: Page Components (8 files)

| Page | Key Changes |
|------|-------------|
| `Dashboard.tsx` | Welcome panel, empty states |
| `WalletDetail.tsx` | Info panels, owner lists, transaction section |
| `CreateWallet.tsx` | Form panels, step indicators |
| `NewTransaction.tsx` | Form panels, recipient section |
| `TransactionHistory.tsx` | History panels, transaction cards |
| `LookupTransaction.tsx` | Search panel, result display |
| `About.tsx` | Content panels, feature cards |

---

### Phase 7: Docs Pages (8 files)

All docs pages follow similar patterns:
- `DocsIndex.tsx`
- `GettingStarted.tsx`
- `MultisigWallets.tsx`
- `Modules.tsx`
- `SocialRecovery.tsx`
- `Security.tsx`
- `DeveloperGuide.tsx`
- `FrontendGuide.tsx`
- `FAQ.tsx`

Main changes:
- Panel backgrounds
- Code block backgrounds: `bg-vault-dark-4` → `bg-dark-100 dark:bg-vault-dark-4`
- Text colors throughout

---

## Color Mapping Reference

| Element | Light Theme | Dark Theme |
|---------|-------------|------------|
| Body Background | `dark-50` (#fafafa) | `vault-black` (#000000) |
| Panel Background | `white` | `vault-dark-1/2` gradient |
| Card Background | `white` | `vault-dark-2/3` gradient |
| Primary Text | `dark-800` (#262626) | `dark-100` (#f5f5f5) |
| Secondary Text | `dark-600` (#525252) | `dark-300` (#d4d4d4) |
| Muted Text | `dark-400` (#a3a3a3) | `dark-500` (#737373) |
| Borders | `dark-200` (#e5e5e5) | `dark-700` (#404040) |
| Input Background | `white` | `vault-dark-3` (#1a1a1a) |
| Red Accents | Unchanged | Unchanged |
| Red Glow Shadows | None or subtle | Full intensity |
| Code Blocks | `dark-100` (#f5f5f5) | `vault-dark-4` (#222222) |

### Class Conversion Pattern
```tsx
// Before (dark-only)
className="bg-vault-dark-2 text-dark-100 border-dark-700"

// After (theme-aware)
className="bg-white dark:bg-vault-dark-2 text-dark-800 dark:text-dark-100 border-dark-200 dark:border-dark-700"
```

---

## Complete File List

### New Files (2)
- `src/store/themeStore.ts`
- `src/components/ThemeToggle.tsx`

### Modified Files (45+)

**Config/Setup (4):**
- `tailwind.config.js`
- `index.html`
- `src/main.tsx`
- `src/index.css`

**Layout (4):**
- `src/components/Layout.tsx`
- `src/components/Sidebar.tsx`
- `src/components/DocsSidebar.tsx`
- `src/components/Modal.tsx`

**Shared Components (16):**
- `NotificationToast.tsx`, `WalletCard.tsx`, `ConfirmDialog.tsx`, `EmptyState.tsx`
- `TransactionList.tsx`, `TransactionPreview.tsx`, `TransactionFlow.tsx`
- `WalletCreationFlow.tsx`, `CopyButton.tsx`, `ExplorerLink.tsx`
- `SyncStatusBadge.tsx`, `OwnerManagement.tsx`, `ModuleManagement.tsx`
- `DailyLimitConfiguration.tsx`, `WhitelistConfiguration.tsx`
- `SocialRecoveryConfiguration.tsx`, `SocialRecoveryManagement.tsx`, `DepositHistory.tsx`

**Transaction Modals (9):**
- All files in `src/components/transactionModals/`

**Pages (8):**
- `Dashboard.tsx`, `WalletDetail.tsx`, `CreateWallet.tsx`, `NewTransaction.tsx`
- `TransactionHistory.tsx`, `LookupTransaction.tsx`, `About.tsx`

**Docs Pages (9):**
- All files in `src/pages/docs/`

---

## Verification Steps

### 1. System Preference Detection
- [ ] Set OS to dark mode → app loads in dark theme
- [ ] Set OS to light mode → app loads in light theme
- [ ] No flash of wrong theme on page load

### 2. Manual Override
- [ ] Click toggle → cycles through Light → Dark → System
- [ ] Preference persists after page refresh
- [ ] System mode responds to OS preference changes in real-time

### 3. Visual Inspection - Light Theme
- [ ] All text is readable (sufficient contrast)
- [ ] All panels have light backgrounds (white/gray)
- [ ] Red accents are visible and attractive
- [ ] No leftover dark backgrounds anywhere
- [ ] Warning banner (yellow) looks good
- [ ] Forms and inputs are clearly visible
- [ ] Scrollbars are styled appropriately

### 4. Visual Inspection - Dark Theme
- [ ] Unchanged from current appearance
- [ ] Red glows still work correctly
- [ ] No regressions in any component

### 5. Functional Tests
- [ ] All interactive elements work (buttons, forms, modals)
- [ ] Notifications display correctly in both themes
- [ ] Transaction flows work in both themes

### 6. Build Test
- [ ] `npm run build` completes without errors
- [ ] `npm run dev` works correctly
- [ ] No TypeScript errors

---

## Implementation Order

1. **Phase 1:** Foundation (themeStore, tailwind config, index.html, main.tsx)
2. **Phase 2:** Core CSS (index.css with variables and updated classes)
3. **Phase 3:** ThemeToggle component
4. **Phase 4:** Layout components (Layout, Sidebar, DocsSidebar, Modal)
5. **Phase 5:** Shared components (start with most-used: WalletCard, TransactionList)
6. **Phase 6:** Page components
7. **Phase 7:** Docs pages
8. **Phase 8:** Testing and polish

Each phase should be testable independently - the app should work (in dark mode) after each phase until all are complete.
