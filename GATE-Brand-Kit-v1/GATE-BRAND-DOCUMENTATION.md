# G.A.T.E. Olympiad — Official Brand Identity
## For AI Assistants & Developers (Claude Code Reference)

> **This document is the single source of truth for all G.A.T.E. brand decisions.**
> When creating any material — certificate, website, email, poster, social post, document — consult this file first. Every visual decision has a correct answer here.

---

## 0. Quick Cheat-Sheet

```
Name:        G.A.T.E. Olympiad   ← ALWAYS with dots. Never "GATE".
Full name:   Global Academic & Theoretical Excellence Olympiad
Font:        Montserrat 900 (logo) / Montserrat 300–700 (text)
Primary bg:  #0B1F3A  (Deep Academic Blue)
Accent:      #C9993A  (Prestige Gold) — dots & lines ONLY, never fill
Text light:  #FAFBFC
Text dark:   #0B1F3A
Logo file:   Always SVG. Never JPG for logo.
```

---

## 1. Brand Name Rules

| Correct | Incorrect |
|---------|-----------|
| G.A.T.E. Olympiad | GATE Olympiad |
| G.A.T.E. | GATE |
| Global Academic & Theoretical Excellence Olympiad | Global Academic and Theoretical Excellence Olympiad |

- **Always** write `G.A.T.E.` with dots after every letter
- **Always** capitalise every letter: G, A, T, E
- The `&` symbol is preferred over "and" in the full name
- Tagline in ALL CAPS when rendered as visual element: `GLOBAL ACADEMIC & THEORETICAL EXCELLENCE OLYMPIAD`

---

## 2. Color System

### Primary Palette

```css
--gate-blue-900:  #060F1C;   /* Deep Night — stage screens, LED walls */
--gate-blue-800:  #0B1F3A;   /* Deep Academic Blue — PRIMARY, dominant bg */
--gate-blue-700:  #1A3560;   /* Prestige Navy — secondary bg, cards */
--gate-blue-600:  #2B5591;   /* Scholarly Blue — links, hover states */
--gate-gold-500:  #C9993A;   /* Prestige Gold — ACCENT ONLY (dots, rules) */
--gate-gold-400:  #E8C060;   /* Gold Light — highlight, award moments */
--gate-gold-200:  #F5E6C0;   /* Gold Pale — certificate background tint */
--gate-white:     #FAFBFC;   /* Pure White — light bg, text on dark */
--gate-mist:      #F0F2F6;   /* Mist — page/app background */
--gate-fog:       #E5E8EE;   /* Fog — borders, dividers */
--gate-gray:      #8A9BB0;   /* Academic Gray — subtext, captions */
```

### Color Usage Rules

```
✅ #0B1F3A  → backgrounds, text, structural elements, headers
✅ #C9993A  → logo dots, divider lines, accent borders, award accents
✅ #FAFBFC  → text on dark backgrounds, light version backgrounds
✅ #1A3560  → secondary cards, navbar, footer tints
✅ #8A9BB0  → captions, metadata, helper text

❌ NEVER use #C9993A as a large background fill (except Gold Edition variant)
❌ NEVER use gradients on the logo itself
❌ NEVER use colours outside this palette in branded materials
```

### Approved Colour Combinations

| Use Case | Background | Text | Accent |
|----------|-----------|------|--------|
| Website hero | #0B1F3A | #FAFBFC | #C9993A |
| Certificates | #FAFBFC | #0B1F3A | #C9993A |
| Award banners | #0B1F3A | #FAFBFC | #E8C060 |
| ID cards | #0B1F3A→#1A3560 gradient | #FAFBFC | #C9993A |
| Email signature | #F8F9FB | #0B1F3A | #C9993A |
| Stage backdrop | #060F1C | #FAFBFC | #C9993A |

---

## 3. Typography

### Font Family

```
Primary:  Montserrat (Google Fonts — free, always use this)
Fallback: 'Segoe UI', system-ui, sans-serif
Display:  Cormorant Garamond (for large headers, serif moments)
```

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet">
```

### Type Scale

```css
/* Logo / Wordmark */
.gate-wordmark {
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  letter-spacing: 0.22em;   /* Critical — this spacing is the brand */
  text-transform: none;      /* G.A.T.E. already capitalised */
}

/* Display headline (serif, large section titles) */
.gate-display {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 300;
  font-size: clamp(32px, 5vw, 64px);
  line-height: 1.1;
}

/* Section heading */
.gate-h1 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 28px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* Sub-heading */
.gate-h2 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #2B5591;
}

/* Tagline / label (below logo) */
.gate-tagline {
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  font-size: clamp(7px, 1.2vw, 10px);
  letter-spacing: 0.38em;
  text-transform: uppercase;
  opacity: 0.5;
}

/* Body text */
.gate-body {
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  font-size: 14px;
  line-height: 1.9;
  color: #3A4F6A;
}

/* Caption / metadata */
.gate-caption {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 9.5px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #8A9BB0;
}
```

---

## 4. Logo Construction

### HTML/CSS Logo (for web)

```html
<!-- Full logo — any size via CSS font-size on .gate-wm -->
<div class="gate-logo">
  <div class="gate-wm">G<span class="dot">.</span>A<span class="dot">.</span>T<span class="dot">.</span>E<span class="dot">.</span></div>
  <div class="gate-rule"></div>
  <div class="gate-tagline">Global Academic &amp; Theoretical Excellence Olympiad</div>
</div>

<style>
.gate-logo { display: flex; flex-direction: column; align-items: center; }
.gate-wm {
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  letter-spacing: 0.22em;
  color: #FAFBFC;        /* or #0B1F3A for light version */
  line-height: 1;
}
.gate-wm .dot { color: #C9993A; }  /* ALWAYS gold dots */
.gate-rule {
  height: 1px;
  /* width should match wordmark width — use 100% or set explicitly */
  background: linear-gradient(90deg, transparent, #C9993A, transparent);
  opacity: 0.4;
  margin: 10px 0;
}
.gate-tagline {
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  font-size: 0.12em;     /* relative to wordmark size */
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: inherit;
  opacity: 0.5;
  text-align: center;
}
</style>
```

### SVG Logo (for files, export, print)

```xml
<!-- Primary Dark version — 900×220px canvas -->
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="220" viewBox="0 0 900 220">
  <rect width="900" height="220" fill="#0B1F3A"/>
  <!-- Wordmark: alternating text+dot colours -->
  <text font-family="'Montserrat',sans-serif" font-size="88" font-weight="900">
    <tspan x="80" y="115" fill="#FAFBFC" letter-spacing="22">G</tspan>
    <tspan fill="#C9993A">.</tspan>
    <tspan fill="#FAFBFC" letter-spacing="22">A</tspan>
    <tspan fill="#C9993A">.</tspan>
    <tspan fill="#FAFBFC" letter-spacing="22">T</tspan>
    <tspan fill="#C9993A">.</tspan>
    <tspan fill="#FAFBFC" letter-spacing="22">E</tspan>
    <tspan fill="#C9993A">.</tspan>
  </text>
  <!-- Rule line -->
  <line x1="80" y1="137" x2="840" y2="137" stroke="#C9993A" stroke-width="0.8" opacity="0.35"/>
  <!-- Tagline -->
  <text x="80" y="170" font-family="'Montserrat',sans-serif"
    font-size="11" font-weight="300" letter-spacing="5" fill="rgba(250,251,252,0.5)">
    GLOBAL ACADEMIC &amp; THEORETICAL EXCELLENCE OLYMPIAD
  </text>
</svg>
```

### Logo Variants Reference Table

| Variant ID | Background | Text | Dots | Use When |
|-----------|-----------|------|------|----------|
| `primary-dark` | #0B1F3A | #FAFBFC | #C9993A | Websites, screens, digital — **DEFAULT** |
| `primary-light` | #FAFBFC | #0B1F3A | #C9993A | Certificates, printed documents, reports |
| `gold-edition` | #C9993A | #0B1F3A | rgba(11,31,58,.55) | Award materials, trophies, gold backgrounds |
| `deep-navy` | #060F1C | #FAFBFC | #C9993A | Stage backdrop, LED screens, dark events |
| `mono-white` | any dark bg | #FAFBFC | #FAFBFC | Embroidery, single-colour printing, stamps |
| `mono-dark` | any light bg | #0B1F3A | #0B1F3A | B&W fax, photocopying, grayscale print |
| `horizontal` | #FAFBFC | #0B1F3A | #C9993A | Navigation bars, app headers, small spaces |

---

## 5. Logo Sizes & When to Use What

```
SIZE      WIDTH       WHERE
------    ---------   --------------------------------------------------
XL        600px+      Stage backdrops, roll-up banners, posters (A1+)
LG        300–600px   Website hero, presentation title slides
MD        160–300px   Certificates, event posters (A4/A3), email headers
SM        100–160px   Letterhead, email signature, document headers
XS        60–100px    Footer credits, watermarks, slide corners
XXS       30–60px     Hide tagline. Show wordmark only.
Icon      <30px       Show G. icon mark only. No wordmark.
Favicon   16px        G. only in square/circle container.
```

**Rule:** When width forces tagline below 6px rendered size → hide tagline.
**Rule:** When width forces wordmark below 14px rendered size → use icon mark `G.` only.

---

## 6. Icon Mark

The icon mark is the `G.` (capital G + gold dot) used when full logo doesn't fit.

```html
<!-- Icon mark — scalable via font-size -->
<div class="gate-icon" style="
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  color: #FAFBFC;
">G<span style="color:#C9993A;">.</span></div>

<!-- App icon container (square) -->
<div style="
  width: 80px; height: 80px;
  background: #1A3560;
  border-radius: 22%;       /* iOS-style rounding */
  display: flex; align-items: center; justify-content: center;
">
  <span style="font-family:'Montserrat';font-weight:900;font-size:34px;color:#FAFBFC;">
    G<span style="color:#C9993A;">.</span>
  </span>
</div>
```

---

## 7. Clear Space Rule

```
Minimum clear space on all 4 sides = 50% of logo height

Example: Logo rendered at 60px tall → 30px clear space on every side
Example: Logo rendered at 120px tall → 60px clear space on every side

Never place other elements (text, images, borders) inside this zone.
```

---

## 8. Application Templates

### 8.1 Email Signature (HTML)

```html
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Montserrat',Helvetica,Arial,sans-serif;">
  <tr>
    <td style="width:3px;background:#C9993A;border-radius:1px;">&nbsp;</td>
    <td style="padding:0 0 0 14px;">
      <div style="font-weight:900;font-size:14px;letter-spacing:5px;color:#0B1F3A;margin-bottom:4px;">
        G<span style="color:#C9993A;">.</span>A<span style="color:#C9993A;">.</span>T<span style="color:#C9993A;">.</span>E<span style="color:#C9993A;">.</span>
      </div>
      <div style="height:1px;background:linear-gradient(90deg,#C9993A,transparent);width:130px;margin:5px 0;"></div>
      <div style="font-size:7px;font-weight:300;letter-spacing:3px;text-transform:uppercase;color:#8A9BB0;">
        Global Academic &amp; Theoretical Excellence Olympiad
      </div>
      <div style="margin-top:10px;font-size:12px;font-weight:600;color:#0B1F3A;">{NAME}</div>
      <div style="font-size:10px;font-weight:300;color:#8A9BB0;margin-top:2px;">{TITLE} · {CITY}</div>
      <div style="font-size:10px;color:#2B5591;margin-top:2px;">{EMAIL}</div>
    </td>
  </tr>
</table>
```

### 8.2 Certificate Header (HTML)

```html
<div style="
  background:#FAFBFC;
  border:1px solid rgba(201,153,58,0.25);
  padding:32px;
  position:relative;
  font-family:'Montserrat',sans-serif;
">
  <!-- Corner accents -->
  <div style="position:absolute;top:14px;left:14px;width:18px;height:18px;
    border-top:2px solid #C9993A;border-left:2px solid #C9993A;"></div>
  <div style="position:absolute;top:14px;right:14px;width:18px;height:18px;
    border-top:2px solid #C9993A;border-right:2px solid #C9993A;"></div>
  <div style="position:absolute;bottom:14px;left:14px;width:18px;height:18px;
    border-bottom:2px solid #C9993A;border-left:2px solid #C9993A;"></div>
  <div style="position:absolute;bottom:14px;right:14px;width:18px;height:18px;
    border-bottom:2px solid #C9993A;border-right:2px solid #C9993A;"></div>

  <!-- Logo -->
  <div style="text-align:center;margin-bottom:20px;">
    <div style="font-weight:900;font-size:28px;letter-spacing:8px;color:#0B1F3A;">
      G<span style="color:#C9993A;">.</span>A<span style="color:#C9993A;">.</span>T<span style="color:#C9993A;">.</span>E<span style="color:#C9993A;">.</span>
    </div>
    <div style="height:1px;background:linear-gradient(90deg,transparent,#C9993A,transparent);margin:10px auto;width:60%;"></div>
    <div style="font-size:7px;font-weight:300;letter-spacing:4px;text-transform:uppercase;color:#8A9BB0;">
      Global Academic &amp; Theoretical Excellence Olympiad
    </div>
  </div>
  
  <!-- Certificate body -->
  <div style="text-align:center;">
    <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8A9BB0;">This is to certify that</p>
    <p style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:28px;
      color:#0B1F3A;margin:8px 0;border-bottom:1px solid rgba(201,153,58,0.3);padding-bottom:10px;">
      {STUDENT_NAME}
    </p>
    <p style="font-size:7.5px;font-weight:400;letter-spacing:2px;text-transform:uppercase;
      color:#8A9BB0;line-height:2.2;">
      has achieved <strong style="color:#C9993A;">{MEDAL} Medal</strong> in the<br>
      Global Academic &amp; Theoretical Excellence Olympiad<br>
      {SUBJECT} · {YEAR} · Beijing, China
    </p>
  </div>
</div>
```

### 8.3 Letterhead Header

```html
<div style="background:#0B1F3A;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;">
  <div>
    <div style="font-weight:900;font-size:16px;letter-spacing:5px;color:#FAFBFC;">
      G<span style="color:#C9993A;">.</span>A<span style="color:#C9993A;">.</span>T<span style="color:#C9993A;">.</span>E<span style="color:#C9993A;">.</span>
    </div>
    <div style="font-size:6px;font-weight:300;letter-spacing:3px;text-transform:uppercase;color:#8A9BB0;margin-top:3px;">Olympiad</div>
  </div>
  <div style="font-size:8px;font-weight:300;letter-spacing:1.5px;color:rgba(138,155,176,0.6);text-align:right;">
    Beijing, China<br>gateolympiad.com
  </div>
</div>
<!-- Gold accent line -->
<div style="height:2px;background:linear-gradient(90deg,#C9993A,#E8C060,#C9993A);"></div>
```

### 8.4 Social Media Cover (CSS-based)

```html
<!-- Cover 1200×630px — Twitter/LinkedIn -->
<div style="
  width:1200px;height:630px;
  background:linear-gradient(135deg,#0B1F3A 0%,#1A3560 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  position:relative;overflow:hidden;
">
  <!-- Grid lines -->
  <div style="position:absolute;inset:0;background:
    repeating-linear-gradient(90deg,transparent,transparent 119px,rgba(201,153,58,0.04) 120px),
    repeating-linear-gradient(0deg,transparent,transparent 119px,rgba(201,153,58,0.04) 120px);"></div>
  <!-- Logo -->
  <div style="font-weight:900;font-size:96px;letter-spacing:22px;color:#FAFBFC;position:relative;">
    G<span style="color:#C9993A;">.</span>A<span style="color:#C9993A;">.</span>T<span style="color:#C9993A;">.</span>E<span style="color:#C9993A;">.</span>
  </div>
  <div style="height:1px;background:linear-gradient(90deg,transparent,#C9993A,transparent);width:700px;opacity:0.4;margin:16px 0;"></div>
  <div style="font-size:12px;font-weight:300;letter-spacing:6px;text-transform:uppercase;color:rgba(250,251,252,0.5);position:relative;">
    GLOBAL ACADEMIC &amp; THEORETICAL EXCELLENCE OLYMPIAD
  </div>
</div>
```

### 8.5 Name Tag / Badge

```html
<div style="
  background:#0B1F3A;border-radius:4px;padding:20px 22px;
  font-family:'Montserrat',sans-serif;
  width:220px;
">
  <div style="font-weight:900;font-size:11px;letter-spacing:4px;color:#C9993A;margin-bottom:10px;">
    G<span style="color:rgba(201,153,58,0.5);">.</span>A<span style="color:rgba(201,153,58,0.5);">.</span>T<span style="color:rgba(201,153,58,0.5);">.</span>E<span style="color:rgba(201,153,58,0.5);">.</span>
  </div>
  <div style="height:1px;background:linear-gradient(90deg,#C9993A,transparent);margin-bottom:12px;"></div>
  <div style="font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C9993A;margin-bottom:6px;">
    {ROLE}  <!-- e.g. Participant / Judge / Staff -->
  </div>
  <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-weight:300;color:#FAFBFC;">
    {FULL_NAME}
  </div>
  <div style="font-size:8px;font-weight:300;letter-spacing:2px;color:rgba(138,155,176,0.7);margin-top:4px;text-transform:uppercase;">
    {SUBJECT} · {AWARD}
  </div>
</div>
```

---

## 9. File Format Guidelines

```
Logo usage          → SVG (always vector)
Web favicon         → .ico or 32×32 PNG (from SVG)
App icon            → PNG at 1024×1024 (from SVG)
Print (large)       → SVG or PDF vector
Print (documents)   → Embed SVG, or 300dpi PNG minimum
Email               → Inline HTML/CSS (no image dependency)
PowerPoint/Word     → EMF or high-res PNG (300dpi min)
```

---

## 10. Prohibited Uses

```
❌ Never write: GATE, gate, Gate, g.a.t.e.
❌ Never use Helvetica, Arial, Inter, or Roboto as logo font
❌ Never add drop shadow to the wordmark
❌ Never add glow, emboss, or bevel effects
❌ Never use logo on a photo background without dark overlay
❌ Never place logo smaller than minimum sizes (see Section 5)
❌ Never outline/stroke the wordmark letters
❌ Never use logo as a watermark tile/repeat pattern
❌ Never change the gold dot colour to anything other than #C9993A / #E8C060
❌ Never use purple, red, or green in brand materials
❌ Never use the logo on backgrounds with contrast ratio below 4.5:1 (WCAG AA)
```

---

## 11. CSS Variables (Copy-paste into any project)

```css
:root {
  /* Brand Colours */
  --gate-900: #060F1C;
  --gate-800: #0B1F3A;  /* PRIMARY */
  --gate-700: #1A3560;
  --gate-600: #2B5591;
  --gate-gold: #C9993A; /* ACCENT */
  --gate-gold-2: #E8C060;
  --gate-gold-3: #F5E6C0;
  --gate-white: #FAFBFC;
  --gate-mist: #F0F2F6;
  --gate-gray: #8A9BB0;

  /* Typography */
  --gate-font: 'Montserrat', system-ui, sans-serif;
  --gate-serif: 'Cormorant Garamond', Georgia, serif;

  /* Spacing */
  --gate-clear: 0.5;   /* multiply by logo height for clear space */

  /* Shadows */
  --gate-shadow-sm: 0 2px 16px rgba(11,31,58,0.08);
  --gate-shadow-md: 0 4px 28px rgba(11,31,58,0.14);
  --gate-shadow-lg: 0 8px 40px rgba(11,31,58,0.22);
}
```

---

## 12. Context Decision Tree

When creating any G.A.T.E. material, follow this:

```
START
  │
  ├─ Is it digital (screen, web, app)?
  │    ├─ Dark background preferred → use PRIMARY DARK variant
  │    └─ White background → use PRIMARY LIGHT variant
  │
  ├─ Is it printed on paper?
  │    ├─ Colour printer → use PRIMARY LIGHT variant
  │    └─ B&W / grayscale → use MONO DARK variant
  │
  ├─ Is it an award / medal / trophy?
  │    └─ Use GOLD EDITION variant
  │
  ├─ Is it for embroidery, laser engraving, or single-colour?
  │    └─ Use MONO WHITE (light etch) or MONO DARK (dark surface)
  │
  ├─ Is it a stage backdrop / LED screen?
  │    └─ Use DEEP NAVY variant
  │
  └─ Is the space too narrow for full logo?
       ├─ Narrow but has height → use HORIZONTAL LOCKUP
       └─ Very small (icon zone) → use G. ICON MARK only
```

---

## 13. Brand Voice

When writing copy for G.A.T.E. materials:

```
Tone:       Confident, academic, global — not boastful, not casual
Language:   Clear and direct. Short sentences. Active voice.
Numbers:    Use numerals (2025 not twenty-twenty-five)
Dates:      "2025 · Beijing, China" format with interpunct
Awards:     Gold Medal / Silver Medal / Bronze Medal — capitalised
Students:   "Participant" not "contestant" or "candidate"
```

---

## 14. Frequently Asked Questions for AI

**Q: User asks to create a G.A.T.E. certificate. What colours?**
A: Background `#FAFBFC`, text `#0B1F3A`, gold accents `#C9993A`, use Cormorant Garamond italic for the student name.

**Q: User wants to add the logo to a dark blue presentation slide.**
A: Use PRIMARY DARK variant on `#0B1F3A` background, or PRIMARY LIGHT on a white text box.

**Q: User wants a social media post for the olympiad.**
A: Dark gradient background `#0B1F3A → #1A3560`, white wordmark with gold dots, gold rule line, white tagline at 50% opacity.

**Q: User asks to make the logo "more colourful" or "add more colours".**
A: Decline. Explain that brand restraint is intentional — Deep Blue + Gold is the system. Suggest award variant (gold bg) if they want more warmth.

**Q: What font size for the tagline relative to the wordmark?**
A: Approximately 11–12% of wordmark font size. If wordmark is 64px, tagline is ~8px.

**Q: User wants to add the logo to a white-background Word document.**
A: Use PRIMARY LIGHT SVG. If SVG not possible, use a 300dpi PNG export of primary-light variant.

**Q: Certificate student name font?**
A: Cormorant Garamond, Italic, weight 400, colour `#0B1F3A`. Size 24–32pt depending on name length.

---

*G.A.T.E. Olympiad Brand Identity · The Intellectual Monogram · v1.0 · 2025*
*This document supersedes all previous brand guidelines.*
