# SKOUTEX Chat Page - Design Specification

**Claude-inspired Scout Assistant interface with SKOUTEX premium branding**

Route: `/dashboard/chat`
Purpose: AI Scout Assistant conversation interface
Style: Minimal, fast, premium, zero distractions

---

## 1. Page Structure

### Desktop (1024px+)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header: Club Logo + Name]                           [⋮ Menu]   │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                    │
│ Conversation │  Chat Thread                                      │
│ List         │  (scrollable)                                     │
│ (280px)      │                                                    │
│              │                                                    │
│ [+ New]      │  ┌──────────────────────────────────────────┐   │
│              │  │ Assistant message bubble                  │   │
│ • Today      │  │ (left-aligned, gray bg)                   │   │
│   Conv 1     │  └──────────────────────────────────────────┘   │
│   Conv 2     │                                                    │
│              │                      ┌──────────────────────┐     │
│ • Yesterday  │                      │ User message bubble  │     │
│   Conv 3     │                      │ (right, blue bg)     │     │
│              │                      └──────────────────────┘     │
│              │                                                    │
│              │                                                    │
│              │                                                    │
├──────────────┴──────────────────────────────────────────────────┤
│ [Message Composer - Fixed Bottom]                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Ask about players, transfers, tactics...          [Send ↑]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile (<1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│ [☰]  Club Name                                       [⋮ Menu]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Chat Thread (full width)                                        │
│  (scrollable)                                                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ Assistant message                                       │     │
│  │ (gray bg, left)                                         │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│                         ┌────────────────────────────────┐       │
│                         │ User message                    │       │
│                         │ (blue bg, right)                │       │
│                         └────────────────────────────────┘       │
│                                                                   │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│ [Composer - Fixed Bottom with safe area]                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Ask me anything...                             [Send ↑]     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Mobile conversation list:** Slide-over from left (☰ hamburger), 80% width, backdrop blur

---

## 2. Component Specifications

### A. Header

#### Desktop

```
Fixed top, 64px height, border-b border-gray-200 bg-white z-50
```

**Layout:**
```html
<header className="fixed top-0 left-0 right-0 h-16 border-b border-gray-200 bg-white z-50">
  <div className="h-full px-6 flex items-center justify-between max-w-[1920px] mx-auto">
    <!-- Left: Club info -->
    <div className="flex items-center gap-3">
      <!-- Club logo (if available) -->
      <img src={clubLogoUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
      <!-- Club name -->
      <span className="text-base font-semibold text-gray-900">{clubName}</span>
      <!-- Fallback if no club -->
      <span className="text-base font-semibold text-gray-900">SKOUTEX</span>
    </div>

    <!-- Right: Menu -->
    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
      <MoreVertical className="w-5 h-5 text-gray-600" />
    </button>
  </div>
</header>
```

**Microcopy:**
- Fallback club name: `"SKOUTEX"`
- Menu tooltip (optional): `"Chat options"`

#### Mobile

Same height (64px), add hamburger on left:

```html
<button className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden">
  <Menu className="w-5 h-5 text-gray-600" />
</button>
```

---

### B. Conversation List (Sidebar)

#### Desktop

```
Fixed left sidebar, 280px width, from top-16 to bottom, bg-gray-50 border-r border-gray-200
```

**Structure:**

```html
<aside className="fixed left-0 top-16 bottom-0 w-[280px] bg-gray-50 border-r border-gray-200 overflow-y-auto">
  <!-- New conversation button -->
  <div className="p-4 border-b border-gray-200 bg-white">
    <button className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
      <Plus className="w-4 h-4" />
      New Conversation
    </button>
  </div>

  <!-- Conversation groups -->
  <div className="p-3 space-y-6">
    <!-- Today -->
    <div>
      <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Today
      </h3>
      <div className="space-y-1">
        <!-- Conversation item -->
        <button className="w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 transition-colors group">
          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
            Best strikers under 25
          </p>
          <p className="text-xs text-gray-500 mt-0.5">3 messages</p>
        </button>
        <!-- Active conversation (blue bg) -->
        <button className="w-full px-3 py-2.5 rounded-lg text-left bg-blue-50 border border-blue-200">
          <p className="text-sm font-medium text-blue-900 truncate">
            Transfers from La Liga
          </p>
          <p className="text-xs text-blue-600 mt-0.5">12 messages</p>
        </button>
      </div>
    </div>

    <!-- Yesterday -->
    <div>
      <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Yesterday
      </h3>
      <div className="space-y-1">
        <!-- ... more items ... -->
      </div>
    </div>

    <!-- Last 7 days -->
    <div>
      <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Last 7 Days
      </h3>
      <div className="space-y-1">
        <!-- ... more items ... -->
      </div>
    </div>

    <!-- Older -->
    <div>
      <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Older
      </h3>
      <div className="space-y-1">
        <!-- ... more items ... -->
      </div>
    </div>
  </div>
</aside>
```

**Conversation Item States:**
- **Default:** `hover:bg-gray-100 text-gray-900`
- **Active:** `bg-blue-50 border border-blue-200 text-blue-900`
- **Hover (inactive):** `bg-gray-100 text-blue-600` (only title changes color)

**Microcopy:**
- Button: `"New Conversation"`
- Group headers: `"Today"`, `"Yesterday"`, `"Last 7 Days"`, `"Older"`
- Message count: `"{n} messages"` (singular: `"1 message"`)
- Empty state: `"No conversations yet"` (centered, text-gray-500, py-12)

#### Mobile (Slide-over)

```html
<!-- Backdrop -->
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" />

<!-- Slide-over panel -->
<aside className="fixed left-0 top-0 bottom-0 w-[80vw] max-w-[320px] bg-gray-50 z-50 md:hidden transform transition-transform duration-300">
  <!-- Header -->
  <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 bg-white">
    <span className="text-base font-semibold text-gray-900">Conversations</span>
    <button className="p-2 rounded-lg hover:bg-gray-100">
      <X className="w-5 h-5 text-gray-600" />
    </button>
  </div>

  <!-- Same content as desktop sidebar -->
  <!-- ... -->
</aside>
```

**Animation:**
- Closed: `translate-x-[-100%]`
- Open: `translate-x-0`
- Backdrop fade: `opacity-0` → `opacity-100` (300ms)

---

### C. Chat Thread (Main Area)

#### Desktop

```
Main content area, margin-left 280px, from top-16 to bottom-24 (composer height), bg-white
```

**Structure:**

```html
<main className="ml-[280px] mt-16 mb-24 min-h-[calc(100vh-10rem)] bg-white">
  <!-- Messages container -->
  <div className="max-w-[800px] mx-auto px-6 py-8 space-y-6">

    <!-- Welcome message (empty state) -->
    <div className="py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Scout Assistant
      </h2>
      <p className="text-gray-600 max-w-md mx-auto">
        Ask me about players, transfers, tactics, or anything related to football scouting.
      </p>
    </div>

    <!-- Assistant message -->
    <div className="flex items-start gap-3">
      <!-- Avatar -->
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-blue-600" />
      </div>
      <!-- Message bubble -->
      <div className="flex-1 max-w-[600px]">
        <div className="rounded-2xl rounded-tl-sm bg-gray-50 px-4 py-3 text-[15px] text-gray-900 leading-relaxed">
          <!-- Markdown content -->
          <p>I can help you with player analysis, transfer recommendations, and tactical insights. What would you like to know?</p>
        </div>
        <!-- Timestamp (optional, hidden by default) -->
        <span className="text-xs text-gray-400 ml-1 mt-1.5 hidden">2:34 PM</span>
      </div>
    </div>

    <!-- User message -->
    <div className="flex items-start gap-3 justify-end">
      <!-- Message bubble (no avatar) -->
      <div className="flex-1 max-w-[600px] flex justify-end">
        <div className="rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-[15px] text-white leading-relaxed">
          <p>Show me the best central midfielders under 23 years old</p>
        </div>
      </div>
    </div>

    <!-- Typing indicator -->
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 max-w-[600px]">
        <div className="rounded-2xl rounded-tl-sm bg-gray-50 px-4 py-3 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0ms"></span>
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 150ms"></span>
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>
    </div>

  </div>
</main>
```

**Message Bubble Specs:**

| Element | Assistant | User |
|---------|-----------|------|
| **Container** | `flex items-start gap-3` | `flex items-start gap-3 justify-end` |
| **Max width** | `max-w-[600px]` | `max-w-[600px]` |
| **Bubble bg** | `bg-gray-50` | `bg-blue-600` |
| **Text color** | `text-gray-900` | `text-white` |
| **Padding** | `px-4 py-3` | `px-4 py-3` |
| **Border radius** | `rounded-2xl rounded-tl-sm` | `rounded-2xl rounded-tr-sm` |
| **Font size** | `text-[15px]` | `text-[15px]` |
| **Line height** | `leading-relaxed` | `leading-relaxed` |
| **Avatar** | Yes (left, blue circle with Bot icon) | No |

**Spacing:**
- Messages: `space-y-6` (24px vertical gap)
- Paragraph spacing inside bubble: `space-y-3`
- Code blocks: `my-3` (first/last: `mt-0`/`mb-0`)

**Markdown Support:**

```html
<!-- Bold -->
<strong className="font-semibold">text</strong>

<!-- Italic -->
<em className="italic">text</em>

<!-- Code inline -->
<code className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-900 text-[14px] font-mono">code</code>

<!-- Code block -->
<pre className="my-3 p-4 rounded-xl bg-gray-900 text-gray-100 text-[14px] font-mono overflow-x-auto">
  <code>code block</code>
</pre>

<!-- Link -->
<a href="#" className="text-blue-600 hover:text-blue-700 underline">link</a>

<!-- List -->
<ul className="space-y-1.5 ml-5 list-disc">
  <li>item</li>
</ul>
```

**User message markdown:** Same classes but colors adjusted for dark background:
- Code inline: `bg-blue-700 text-white`
- Links: `text-blue-100 hover:text-white underline`

#### Mobile

```
Full width, no left margin, mt-16, mb-20 (shorter composer)
```

Same structure, but:
- Container: `px-4 py-6` (less padding)
- Max width: `max-w-full` (remove 800px limit)
- Bubble max width: `max-w-[85%]` (more screen-friendly)

---

### D. Message Composer (Fixed Bottom)

#### Desktop

```
Fixed bottom, full width (with left margin for sidebar), height 96px, bg-white border-t border-gray-200
```

**Structure:**

```html
<div className="fixed bottom-0 left-0 right-0 ml-[280px] h-24 bg-white border-t border-gray-200 z-40">
  <div className="h-full max-w-[800px] mx-auto px-6 flex items-center gap-3">

    <!-- Textarea -->
    <div className="flex-1 relative">
      <textarea
        placeholder="Ask about players, transfers, tactics..."
        rows="1"
        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none text-[15px] text-gray-900 placeholder:text-gray-400 leading-relaxed transition-all max-h-[120px] overflow-y-auto"
      />
      <!-- Send button (inside textarea) -->
      <button
        className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        disabled={isEmpty}
      >
        <ArrowUp className="w-5 h-5 text-white" />
      </button>
    </div>

  </div>
</div>
```

**Textarea Behavior:**
- **Enter:** Send message (if not empty)
- **Shift + Enter:** New line
- **Auto-expand:** Grows from 1 row to max 4 rows (max-h-[120px])
- **Disabled state:** `border-gray-200 bg-gray-50 cursor-not-allowed` when sending

**Send Button States:**
- **Empty:** `bg-gray-300 cursor-not-allowed` (disabled)
- **Has text:** `bg-blue-600 hover:bg-blue-700`
- **Sending:** `bg-blue-600` with loading spinner instead of arrow

**Microcopy:**
- Placeholder: `"Ask about players, transfers, tactics..."`
- Keyboard hint (optional, bottom-right, text-xs, text-gray-400): `"Enter to send, Shift+Enter for new line"`

#### Mobile

```
No left margin, height 80px, safe area padding bottom (pb-safe)
```

Same structure but:
- Remove `ml-[280px]`
- Height: `h-20`
- Padding: `px-4 pb-safe` (iOS notch)
- Placeholder: `"Ask me anything..."` (shorter)
- Max height: `max-h-[100px]` (max 3 rows)

---

## 3. Microinteractions

### A. Typing Indicator

**Trigger:** Assistant is generating response

**Visual:**

```html
<div className="flex items-start gap-3 animate-fade-in">
  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
    <Bot className="w-5 h-5 text-blue-600" />
  </div>
  <div className="flex-1 max-w-[600px]">
    <div className="rounded-2xl rounded-tl-sm bg-gray-50 px-4 py-3 flex items-center gap-1">
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0ms"></span>
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 150ms"></span>
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 300ms"></span>
    </div>
  </div>
</div>
```

**Animation:**
- Bounce: `@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`
- Duration: `400ms`
- Easing: `ease-in-out`
- Infinite loop

**Timing:**
- Appears immediately when user sends message
- Disappears when first token of response arrives (replaced with actual message)

---

### B. Smooth Scroll to Bottom

**Trigger:**
- New message sent (user or assistant)
- User clicks "Scroll to bottom" button (if not at bottom)

**Behavior:**

```typescript
// Smooth scroll
messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
```

**Scroll-to-bottom button:**
- Appears when user scrolls up >200px from bottom
- Fixed position: `fixed bottom-28 right-8 z-30` (desktop), `bottom-24 right-4` (mobile)
- Style: `w-10 h-10 rounded-full bg-white border border-gray-300 shadow-lg hover:shadow-xl flex items-center justify-center transition-all`
- Icon: `<ChevronDown className="w-5 h-5 text-gray-600" />`
- Animation: Fade in/out 200ms

**Microcopy:**
- Tooltip (optional): `"Jump to latest"`

---

### C. Message Fade-in

**Trigger:** New message appears (assistant or user)

**Animation:**

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 300ms ease-out;
}
```

**Usage:** Add `animate-fade-in` to message container div

---

### D. Textarea Auto-expand

**Trigger:** User types, textarea content wraps to new line

**Behavior:**
- Default: 1 row (40px height)
- Max: 4 rows (120px height) on desktop, 3 rows (100px) on mobile
- Overflow: `overflow-y-auto` with custom scrollbar

**Custom Scrollbar (Webkit):**

```css
textarea::-webkit-scrollbar {
  width: 6px;
}
textarea::-webkit-scrollbar-track {
  background: transparent;
}
textarea::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
textarea::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
```

---

### E. Send Button Loading State

**Trigger:** Message is being sent to backend

**Visual:**

```html
<button className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
  <Loader2 className="w-5 h-5 text-white animate-spin" />
</button>
```

**Timing:**
- Starts when user presses Enter/clicks Send
- Ends when typing indicator appears
- Duration: Usually <500ms

---

## 4. Mobile-Specific Rules

### A. Conversation List Slide-over

**Open triggers:**
- Tap hamburger menu (☰) in header
- Swipe right from left edge (optional, 20px hit zone)

**Close triggers:**
- Tap backdrop
- Tap X button
- Tap conversation item (switches conversation + closes)
- Swipe left (optional)

**Animations:**
- Panel: `translate-x-[-100%]` → `translate-x-0` (300ms, ease-out)
- Backdrop: `opacity-0` → `opacity-100` (300ms)

**z-index:**
- Backdrop: `z-40`
- Panel: `z-50`

---

### B. Touch Targets

**Minimum touch target:** 48×48px

| Element | Size | Padding/Area |
|---------|------|--------------|
| Send button | 40×40px | (within 48px tap zone) |
| Header menu button | 40×40px | `p-2` (total 44px) |
| Conversation item | Full width × 44px min | `py-2.5` (ensures 44px+) |
| Hamburger menu | 40×40px | `p-2` |

---

### C. Keyboard Behavior

**When textarea is focused:**
- Keyboard pushes composer up (not overlapping)
- Chat thread scrolls to bottom automatically
- Scroll-to-bottom button hidden (user is at bottom)

**iOS Safari specific:**
- Add `viewport-fit=cover` meta tag
- Use `pb-safe` (safe-area-inset-bottom) for composer
- Prevent zoom on input focus: `<meta name="viewport" content="... maximum-scale=1">`

---

### D. Swipe Gestures (Optional)

**Swipe right (from left edge):**
- Opens conversation list slide-over
- 20px hit zone from left edge
- Requires 60px minimum swipe distance
- 80% follow-through (panel follows finger during swipe)

**Swipe left (on slide-over):**
- Closes conversation list
- Any horizontal swipe >40px triggers close

---

## 5. Exact Tailwind Classes Reference

### Layout

| Element | Classes |
|---------|---------|
| **Page container** | `flex h-screen overflow-hidden bg-white` |
| **Sidebar (desktop)** | `fixed left-0 top-16 bottom-0 w-[280px] bg-gray-50 border-r border-gray-200 overflow-y-auto hidden md:block` |
| **Main area (desktop)** | `flex-1 md:ml-[280px] mt-16 overflow-hidden` |
| **Chat thread** | `h-[calc(100vh-10rem)] overflow-y-auto` |
| **Messages container** | `max-w-[800px] mx-auto px-6 py-8 space-y-6` |
| **Composer (desktop)** | `fixed bottom-0 left-0 right-0 md:ml-[280px] h-24 bg-white border-t border-gray-200 z-40` |
| **Composer (mobile)** | `fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 z-40 pb-safe` |

### Message Bubbles

| Element | Classes |
|---------|---------|
| **Assistant container** | `flex items-start gap-3` |
| **User container** | `flex items-start gap-3 justify-end` |
| **Assistant avatar** | `w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0` |
| **Assistant bubble** | `rounded-2xl rounded-tl-sm bg-gray-50 px-4 py-3 text-[15px] text-gray-900 leading-relaxed max-w-[600px]` |
| **User bubble** | `rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-[15px] text-white leading-relaxed max-w-[600px]` |
| **Timestamp** | `text-xs text-gray-400 ml-1 mt-1.5 hidden` (show with JS when enabled) |

### Conversation List

| Element | Classes |
|---------|---------|
| **New conversation button** | `w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2` |
| **Group header** | `px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500` |
| **Conversation item (inactive)** | `w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 transition-colors group` |
| **Conversation item (active)** | `w-full px-3 py-2.5 rounded-lg text-left bg-blue-50 border border-blue-200` |
| **Conversation title** | `text-sm font-medium text-gray-900 truncate group-hover:text-blue-600` (active: `text-blue-900`) |
| **Message count** | `text-xs text-gray-500 mt-0.5` (active: `text-blue-600`) |

### Composer

| Element | Classes |
|---------|---------|
| **Textarea** | `w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none text-[15px] text-gray-900 placeholder:text-gray-400 leading-relaxed transition-all max-h-[120px] overflow-y-auto` |
| **Send button (enabled)** | `absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors` |
| **Send button (disabled)** | `absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-gray-300 cursor-not-allowed flex items-center justify-center` |

### Typing Indicator

| Element | Classes |
|---------|---------|
| **Container** | `flex items-start gap-3 animate-fade-in` |
| **Bubble** | `rounded-2xl rounded-tl-sm bg-gray-50 px-4 py-3 flex items-center gap-1` |
| **Dot** | `w-2 h-2 rounded-full bg-gray-400 animate-bounce` |

### Scroll-to-bottom Button

| Element | Classes |
|---------|---------|
| **Button (desktop)** | `fixed bottom-28 right-8 z-30 w-10 h-10 rounded-full bg-white border border-gray-300 shadow-lg hover:shadow-xl flex items-center justify-center transition-all` |
| **Button (mobile)** | `fixed bottom-24 right-4 z-30 w-10 h-10 rounded-full bg-white border border-gray-300 shadow-lg hover:shadow-xl flex items-center justify-center transition-all` |

### Mobile Slide-over

| Element | Classes |
|---------|---------|
| **Backdrop** | `fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300` |
| **Panel (closed)** | `fixed left-0 top-0 bottom-0 w-[80vw] max-w-[320px] bg-gray-50 z-50 md:hidden transform -translate-x-full transition-transform duration-300` |
| **Panel (open)** | `fixed left-0 top-0 bottom-0 w-[80vw] max-w-[320px] bg-gray-50 z-50 md:hidden transform translate-x-0 transition-transform duration-300` |

### Empty State

| Element | Classes |
|---------|---------|
| **Container** | `py-16 text-center` |
| **Icon container** | `w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4` |
| **Heading** | `text-2xl font-semibold text-gray-900 mb-2` |
| **Description** | `text-gray-600 max-w-md mx-auto` |

---

## 6. Exact Microcopy Strings

### Header

- Fallback club name: `"SKOUTEX"`
- Menu button tooltip: `"Chat options"` (optional)

### Conversation List

- New conversation button: `"New Conversation"`
- Group headers:
  - Today: `"Today"`
  - Yesterday: `"Yesterday"`
  - Last week: `"Last 7 Days"`
  - Older: `"Older"`
- Message count (plural): `"{n} messages"`
- Message count (singular): `"1 message"`
- Empty state: `"No conversations yet"`
- Mobile header: `"Conversations"`
- Close button aria-label: `"Close conversations"`

### Chat Thread

- Welcome heading: `"Scout Assistant"`
- Welcome description: `"Ask me about players, transfers, tactics, or anything related to football scouting."`
- Empty conversation: (Show welcome message)
- Loading state: `"Loading messages..."` (centered, with spinner)
- Error state: `"Failed to load conversation. Please try again."` (with retry button)

### Message Composer

- Placeholder (desktop): `"Ask about players, transfers, tactics..."`
- Placeholder (mobile): `"Ask me anything..."`
- Keyboard hint (desktop, optional): `"Enter to send, Shift+Enter for new line"`
- Send button aria-label: `"Send message"`
- Disabled state aria-label: `"Enter a message to send"`

### Scroll-to-bottom Button

- Aria-label: `"Jump to latest message"`
- Tooltip (optional): `"Jump to latest"`

### Menu Options (⋮)

- Clear conversation: `"Clear conversation"`
- Export chat: `"Export as PDF"`
- Delete conversation: `"Delete conversation"`
- Settings: `"Chat settings"`

### Error Messages (Toasts)

- Send failed: `"Failed to send message. Please try again."`
- Load failed: `"Failed to load conversation."`
- Connection lost: `"Connection lost. Reconnecting..."`
- Reconnected: `"Connection restored."`

---

## 7. Animation Specifications

### Message Fade-in

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 300ms ease-out forwards;
}
```

### Typing Indicator Bounce

```css
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 400ms ease-in-out infinite;
}
```

**Stagger delays:** 0ms, 150ms, 300ms (applied via inline style)

### Slide-over Panel

```css
/* Closed state */
.slide-over-closed {
  transform: translateX(-100%);
  transition: transform 300ms ease-out;
}

/* Open state */
.slide-over-open {
  transform: translateX(0);
  transition: transform 300ms ease-out;
}
```

### Backdrop Fade

```css
/* Hidden */
.backdrop-hidden {
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease-out;
}

/* Visible */
.backdrop-visible {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 300ms ease-out;
}
```

### Scroll-to-bottom Button

```css
/* Hidden */
.scroll-btn-hidden {
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}

/* Visible */
.scroll-btn-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}
```

### Send Button Loading

```css
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

## 8. Accessibility Notes

### Keyboard Navigation

- **Tab order:** Header menu → New conversation → Conversation items → Textarea → Send button
- **Arrow keys (in conversation list):** Up/down to navigate items
- **Enter (on conversation item):** Switch to conversation
- **Escape:** Close slide-over (mobile), blur textarea (desktop)
- **Ctrl/Cmd + K:** Focus search/new conversation (optional)

### Screen Reader Labels

```html
<!-- Header -->
<header aria-label="Chat header">
  <button aria-label="Chat options">...</button>
</header>

<!-- Conversation list -->
<aside aria-label="Conversation history">
  <button aria-label="Start new conversation">...</button>
  <nav aria-label="Conversations grouped by date">
    <h3 role="heading" aria-level="3">Today</h3>
    <button aria-label="Conversation: Best strikers under 25, 3 messages">...</button>
  </nav>
</aside>

<!-- Messages -->
<div role="log" aria-live="polite" aria-label="Chat messages">
  <div role="article" aria-label="Message from Scout Assistant">...</div>
  <div role="article" aria-label="Message from you">...</div>
</div>

<!-- Composer -->
<form aria-label="Send message">
  <textarea aria-label="Message input" aria-describedby="composer-hint"></textarea>
  <span id="composer-hint" className="sr-only">Enter to send, Shift+Enter for new line</span>
  <button type="submit" aria-label="Send message">...</button>
</form>
```

### Focus Management

- When conversation is switched: Focus textarea
- When slide-over opens: Focus first conversation item or close button
- When slide-over closes: Return focus to hamburger menu
- When message is sent: Keep focus on textarea (ready for next message)

### Color Contrast

All text meets WCAG AA standards:

| Element | Foreground | Background | Ratio |
|---------|------------|------------|-------|
| Assistant bubble text | `#111827` (gray-900) | `#F9FAFB` (gray-50) | 16.3:1 ✓ |
| User bubble text | `#FFFFFF` (white) | `#2563EB` (blue-600) | 8.6:1 ✓ |
| Placeholder text | `#9CA3AF` (gray-400) | `#FFFFFF` (white) | 4.5:1 ✓ |
| Group headers | `#6B7280` (gray-500) | `#F9FAFB` (gray-50) | 7.2:1 ✓ |

---

## 9. Performance Notes

### Lazy Loading

- **Conversation history:** Load 20 most recent, infinite scroll for older
- **Messages:** Load last 50 messages, scroll up to load more (30 at a time)
- **Images in messages:** Lazy load with IntersectionObserver

### Optimizations

- **Virtual scrolling:** If conversation list >100 items
- **Message debouncing:** Typing indicator waits 300ms after last keystroke
- **Auto-save:** Draft messages saved to localStorage every 2s
- **Markdown rendering:** Memoize with React.memo, only re-render if content changes

### Bundle Size Targets

- Initial JS: <50KB gzipped
- Markdown renderer: Lazy load (code-split)
- Syntax highlighter (for code blocks): Lazy load on first code block render

---

**End of Specification**
