# Skills Registry

Maps available Claude Code skills to blueprint sections. Use this during Phase 4 (Generate) to recommend the right skills for the build phase.

This registry only lists skills actually installed in this environment — do not recommend a skill that isn't installed.

## Skills for Blueprint Recommendations

| Skill | Blueprint Section | When to Recommend | What It Does |
|-------|------------------|-------------------|-------------|
| `impeccable` | Frontend Architecture, Build Order | Any project with a UI | Designs/redesigns/audits frontend interfaces — hierarchy, layout, motion, accessibility, design systems |
| `ui-ux-pro-max` | Design System | Any project with a UI | 67 styles, 96 palettes, 57 font pairings, 13 stacks (incl. shadcn/ui via MCP) |
| `emil-design-eng` | Frontend Architecture, Build Order | Projects where UI polish/micro-interactions matter | Emil Kowalski's philosophy on UI polish and animation decisions |
| `dataviz` | Build Order | Any project with charts, dashboards, or analytics views | Design-system-agnostic method for charts, stat tiles, dashboards |
| `canvas-design` | Build Order | Marketing sites, landing pages needing static art/posters | Original visual art in .png/.pdf |
| `content-strategy` | Build Order (content step) | Content platforms, blogs, marketing sites | Editorial calendar, content pillars, topic clusters |
| `ads` | Deployment Strategy, Build Order | Marketing sites needing a paid-acquisition plan | Paid campaign strategy across ad platforms |
| `docx` / `pptx` / `xlsx` / `pdf` | Build Order | When the project generates Word docs, decks, spreadsheets, or PDFs | Create/edit/read the respective file format |
| `run` | Build Order (final step) | Always, once the app is scaffolded | Launches and screenshots the app to confirm it works end-to-end |
| `security-review` | Build Order (final step) | Any project handling auth, payments, or user data | Security review of the pending changes before ship |
| `review` | Build Order (final step) | When the build phase opens a PR | Reviews a GitHub pull request |
| `claude-api` | Tech Stack | When the project integrates the Claude API/Anthropic SDK | Model ids, pricing, streaming, tool use, caching reference |

## Skills The Architect Uses During Design

| Skill | Phase | Purpose |
|-------|-------|---------|
| `ui-ux-pro-max` | Phase 3 | Design the visual system (colors, fonts, style) |
| `impeccable` | Phase 3 | Sanity-check the proposed UI/UX direction before confirmation |

Notes:
- For technology comparisons and unfamiliar-tools research (formerly `/deep-research`), use the `WebSearch`/`WebFetch` tools directly — no dedicated research skill is installed.
- For discovering build-phase skills (formerly `/find-skills`), use the `SearchSkills`/`SuggestSkills` tools directly instead of a skill.
- No browser-automation or reference-site-screenshot skill is currently installed (previously `/playwright-cli`, `/chrome-bridge-automation`, `/web-reader`). If the user shares a reference site, describe it from the URL/description they give, or ask them to share a screenshot.
- No SEO-audit or humanizer skill is currently installed. Omit those blueprint recommendations until one is available.

## How to Include in Blueprint

In Section 14 (Skills to Use During Build), list each relevant skill with:
1. **Skill name** — the slash command
2. **When to use** — which build step (reference the build order)
3. **Why** — what it helps accomplish

Example:
```markdown
| Skill | When to Use | Why |
|-------|-------------|-----|
| /frontend-design | Steps 4, 5, 10 (layouts, core feature UI, landing page) | Production-grade, distinctive UI |
| /shadcn-ui | Step 1 (scaffolding) | Set up and customize component library |
| /seo-audit | Step 11 (polish) | Audit SEO before launch |
```
