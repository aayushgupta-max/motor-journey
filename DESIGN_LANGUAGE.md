# Motor Journey — Design Language

> Policybazaar.ae · Car Insurance · v3.0

---

## 1. Colour Palette

### Grey Scale (light → dark)
| Token | Hex | Usage |
|---|---|---|
| `surface-faint` | `#FAFBFC` | Page backgrounds, hover states |
| `surface` | `#F3F5F7` | Card backgrounds, input fills, icon boxes |
| `surface-mid` | `#EDEEF0` | Dividers, subtle fills |
| `border` | `#D6DADE` | Card borders, input outlines, handle bars |
| `border-strong` | `#B0B6BE` | Disabled buttons, focus rings, ghost text |
| `text-muted` | `#5E6670` | Secondary labels, meta text, "Or" divider |
| `text-mid` | `#767C85` | Subtitles |
| `text-body` | `#8A919A` | Placeholders, helper text, star empty state |
| `text-secondary` | `#4B525A` | Body copy, icon colour |
| `text-primary` | `#3A3F45` | Modal headings |
| `foreground` | `#0F1113` | Primary text, dark buttons, page BG darkest |

### Dark Surface
| Token | Hex | Usage |
|---|---|---|
| `dark-bg` | `#0F1113` | Dark sections (UAE law banner, header) |
| `dark-inner` | `#1D1E20` | Inner cards on dark surface, badge backgrounds |
| `dark-border` | `#2A2B2E` | Borders on dark surface |
| `dark-text-muted` | `#5E6670` | Muted text on dark backgrounds |

### Accent
| Token | Hex | Usage |
|---|---|---|
| `amber` | `#F59E0B` | Star ratings, warning icon (TriangleAlert) |
| `white` | `#FFFFFF` | Inner cards, modal backgrounds, icon fills |

> **Rule:** No other colours. No blues, greens, or reds. All icons are monochrome `text-[#4B525A]`.

---

## 2. Typography

### Scale
| Size | Class | Usage |
|---|---|---|
| 10px | `text-[10px]` | Legal copy, timestamps, badge labels, TRY hint |
| 11px | `text-[11px]` | Star ratings, eyebrow labels (`uppercase tracking-widest`) |
| 12px | `text-[12px]` | Helper text, card sublabels, testimonial body/name |
| 13px | `text-[13px]` | Chips, small buttons |
| 14px | `text-sm` / `text-[14px]` | Body, chat messages, input text |
| 16px | `text-[16px]` | Modal headings |
| 17px | `text-[17px]` | Section headings |
| 18px | `text-[18px]` | Section headings (testimonials) |
| 20px | `text-[20px]` | Stat values (dark surface) |
| 22px | `text-[22px]` | Stat values (light surface) |
| 24px / 30px | `text-2xl` / `text-3xl` | Hero H1 |

### Weights
- `font-normal` — body copy
- `font-medium` — chip labels, hint text
- `font-semibold` — highlighted keywords, name labels
- `font-bold` — headings, card titles, buttons
- `font-black` — hero stat numbers

### Line Heights
- `leading-none` — stat numbers (tightly stacked)
- `leading-tight` — headings
- `leading-5` (20px) — body copy, chat messages
- `leading-snug` — sublabels under stats
- `leading-[1.4]` — testimonial quote text

### Tracking
- `tracking-tight` — hero headings, stat numbers
- `tracking-widest` — eyebrow labels (always `uppercase`)
- `tracking-[0.5em]` — OTP input digits

---

## 3. Border Radius — Concentric Rule

Radii decrease as elements nest inward. Never use a larger radius on an inner element than its parent.

```
Page / Sheet          rounded-t-3xl (24px) — bottom sheets
Outer card            rounded-[28px]        — primary cards
Inner card / button   rounded-[16px]        — inner stat cards, action buttons
Input / chip          rounded-xl (12px)     — text inputs, small buttons
Chip (pill)           rounded-[999px]       — suggestion chips, tags
Icon box              rounded-[10px]        — icon containers
Badge / tag           rounded-full          — status pills, "Or" divider
Handle bar            rounded-full w-10 h-1 — bottom sheet handle
Avatar indicator      rounded-full w-1.5 h-1.5
```

---

## 4. Shadows

| Context | Class |
|---|---|
| Primary card | `shadow-[0_6px_18px_rgba(15,17,19,0.06)]` |
| Input bar (idle) | `shadow-[0_8px_24px_rgba(15,17,19,0.08)]` |
| Input bar (focused) | `shadow-[0_10px_26px_rgba(15,17,19,0.10)]` |
| Send button | `shadow-[0_8px_18px_rgba(15,17,19,0.22)]` |
| + attach button | `shadow-[0_1px_2px_rgba(15,17,19,0.06)]` |

> Shadows always use the foreground colour `#0F1113` at low opacity — never coloured shadows.

---

## 5. Spacing

| Usage | Value |
|---|---|
| Card padding | `p-4` / `p-5` |
| Section vertical | `py-6` / `py-8` |
| Horizontal container | `px-4` / `px-5` |
| Gap between cards | `gap-3` / `gap-5` |
| Gap between items | `gap-2` / `gap-2.5` |
| Max content width | `max-w-4xl` / `max-w-5xl` |

---

## 6. Component Patterns

### Card
```
bg-[#F3F5F7] rounded-[28px] border border-[#D6DADE]
shadow-[0_6px_18px_rgba(15,17,19,0.06)] p-5
```
- Use `bg-[#FFFFFF] rounded-[16px]` for inner cards
- Decorative circles: `absolute` positioned, `bg-[#D6DADE]` / `bg-[#FAFBFC]`, `rounded-full`, low opacity

### Button — Primary (dark)
```
h-11 rounded-xl bg-[#0F1113] hover:bg-[#1D1E20] text-[#FFFFFF]
flex items-center justify-center gap-2 text-sm transition-colors
```

### Button — Primary (round send)
```
h-11 w-11 rounded-full bg-[#0F1113]
shadow-[0_8px_18px_rgba(15,17,19,0.22)] active:scale-[0.98]
```

### Button — Disabled
```
bg-[#F3F5F7] text-[#B0B6BE] cursor-not-allowed
```
or
```
bg-[#B0B6BE] cursor-not-allowed
```

### Chip / Suggestion Pill
```
inline-flex flex-shrink-0 items-center rounded-[999px]
border border-[#D6DADE] bg-[#FFFFFF]
px-3 py-1.5 text-[13px] text-[#4B525A]
transition-all hover:border-[#B0B6BE] hover:bg-[#FAFBFC] active:scale-[0.97]
whitespace-nowrap
```

### Badge / Status Pill (dark)
```
inline-flex items-center gap-1.5 bg-[#1D1E20] text-[#F3F5F7]
text-xs px-3 py-1 rounded-full
```
With live dot: `w-1.5 h-1.5 bg-[#F3F5F7] rounded-full animate-pulse`

### Input Field
```
h-12 px-4 rounded-xl bg-[#F3F5F7] text-sm text-[#0F1113]
placeholder:text-[#B0B6BE] outline-none focus:ring-2 focus:ring-[#B0B6BE]
```

### Chat Input Bar
```
w-full rounded-[22px] border border-[#D6DADE] bg-[#F3F5F7]
px-3 py-2.5 shadow-[0_8px_24px_rgba(15,17,19,0.08)]
transition-all focus-within:border-[#0F1113] focus-within:bg-[#FFFFFF]
focus-within:shadow-[0_10px_26px_rgba(15,17,19,0.10)]
```

### Stat Card (light section)
```
flex-1 bg-[#FFFFFF] rounded-[16px] px-3 py-4 text-center
```
- Stat number: `text-[22px] font-black text-[#0F1113] leading-none tracking-tight`
- Label: `text-[12px] font-semibold text-[#4B525A] mt-2`
- Sublabel: `text-[12px] text-[#8A919A] mt-0.5 leading-snug`

### Stat Card (dark section)
```
flex-1 bg-[#1D1E20] rounded-[16px] px-3 py-4 text-center
```
- Stat: `text-[20px] font-bold text-[#FFFFFF] leading-none`
- Label: `text-[12px] text-[#5E6670] mt-1.5`

### Chat Message — User
```
ml-auto max-w-[85%] rounded-2xl bg-[#D6DADE]
px-3.5 py-2.5 text-[14px] leading-5 text-[#0F1113]
whitespace-pre-wrap break-words [overflow-wrap:anywhere]
```

### Chat Message — Assistant
```
mr-auto max-w-[85%] rounded-2xl border border-[#D6DADE] bg-[#FFFFFF]
px-3.5 py-2.5 text-[14px] leading-5 text-[#0F1113]
whitespace-pre-wrap break-words [overflow-wrap:anywhere]
```

### Welcome Card (assistant first message)
```
mr-auto max-w-[85%] rounded-2xl bg-[#E5E7EB] p-1
```
Inner white box: `rounded-[12px] bg-[#FFFFFF] px-3.5 py-2.5 space-y-1.5`
- Eyebrow: `text-[14px] leading-5` (light)
- Body: `text-[14px] font-semibold leading-5 text-[#0F1113]`

### Bottom Sheet / Modal
```
bg-[#FFFFFF] rounded-t-3xl sm:rounded-2xl
w-full sm:max-w-md p-6 border border-[#D6DADE]
```
Backdrop: `bg-[#0F1113]/45`
Handle: `w-10 h-1 bg-[#D6DADE] rounded-full` (mobile only)

### Testimonial Card
```
w-[200px] flex-shrink-0 bg-[#FAFBFC] rounded-[14px]
border border-[#D6DADE] overflow-hidden flex flex-col
```
Image: `aspect-[4/3] object-cover grayscale`
Stars: `text-[#F59E0B]` (filled) / `text-[#D6DADE]` (empty)

### Close / Icon Button (small)
```
w-8 h-8 rounded-full bg-[#F3F5F7]
flex items-center justify-center
```

---

## 7. Layout

- **Container**: `container mx-auto px-4 md:px-6 max-w-5xl`
- **Two-column home cards**: `grid md:grid-cols-2 gap-5 max-w-4xl mx-auto`
- **"Or" divider**: Absolute-centred circle `w-10 h-10` between columns
- **Section backgrounds alternate**: `bg-[#FFFFFF]` → `bg-[#F3F5F7]` → `bg-[#FFFFFF]` → `bg-[#0F1113]`
- **Full-page chat**: `flex flex-col h-[100dvh]` — sticky header + scrollable body + sticky input bar
- **Horizontal scroll rows** (chips, testimonials): `overflow-x-auto [scrollbar-width:none]`

---

## 8. Motion & Animation

| Pattern | Implementation |
|---|---|
| Page entry (modal/sheet) | `motion/react` — `initial: { y: 100, opacity: 0 }` → `animate: { y: 0, opacity: 1 }` |
| Text cycle (fade + slide) | `AnimatePresence mode="wait"` — `initial: { opacity: 0, y: 6 }`, `exit: { opacity: 0, y: -6 }`, `transition: 0.3s` |
| Typewriter (home card) | JS setInterval — 40ms/char typing, 2000ms pause, 20ms/char clearing |
| Live indicator dot | `animate-pulse` on `w-1.5 h-1.5 rounded-full` |
| Loading dots (connecting) | `animate-bounce` staggered `[animation-delay:0/150/300ms]` |
| Button press | `active:scale-[0.97]` / `active:scale-[0.98]` |

---

## 9. Icons

- Library: **Lucide React**
- Size: `w-4 h-4` (default) / `w-3.5 h-3.5` (small) / `w-10 h-10` (hero)
- Colour: Always `text-[#4B525A]` — **never coloured**
- Exception: `TriangleAlert` in UAE law section uses `text-[#F59E0B]` (amber warning)
- `strokeWidth={1.5}` for large decorative icons

---

## 10. Images

- Filter: `grayscale` (CSS class) on all photography
- Aspect ratio: `aspect-[4/3]` for testimonial cards
- Fit: `object-cover`

---

## 11. Accessibility

- Minimum font size: **12px** (never go below)
- Colour contrast: AA standard minimum for all text
- Disabled states always use `cursor-not-allowed`
- Touch targets: minimum `h-11` (44px) for primary actions, `h-8`/`h-9` for secondary
- Safe area: `pb-[max(0.75rem,env(safe-area-inset-bottom))]` on fixed bottom bars
