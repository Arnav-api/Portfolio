# Arnav Khandelwal — Portfolio

An interactive, IDE-themed portfolio site: a file-explorer sidebar (`home.md`,
`experience.js`, `projects/`, `skills.json`...), a real command palette
(`Ctrl/Cmd + K`), clickable skill tags that cross-highlight the experience
and projects that use them, and a tiny working terminal on the contact page.

Plain HTML/CSS/JS — no build step, no dependencies to install.

```
portfolio/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── README.md
```

## Run it locally

**Easiest:** double-click `index.html`, or drag it into a browser tab.

**Recommended** (so the small "live GitHub repo count" fetch works properly,
since some browsers restrict network requests from `file://` pages):

```bash
cd portfolio
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

or, with Node installed:

```bash
npx serve portfolio
```

## Before you put this on your resume

A few placeholders need real links — search the codebase for these and swap
them in:

1. **Project repo links** — in `index.html`, the "Full-Stack E-Commerce
   Platform" and "MotoGP Lap Time Prediction" cards currently link to your
   GitHub *profile* (`github.com/arnavkhandelwal`) for both "View repository"
   and "Live demo", same as your resume did. Point them at the actual repo
   URLs once you have them.
2. **Kaggle Ensemble Model** — has no link on your resume, so the button
   currently just says "Notebook link — add yours." Replace it with a real
   `<a>` tag once you have a public notebook/repo link (see the
   `project-ensemble` article in `index.html`).
3. **Certificate links** — the Achievements section links straight to your
   Google Drive files. Right now they require sign-in. Before this goes
   live, open each file in Drive → Share → change access to **"Anyone with
   the link"** so recruiters can actually open them.

## Deploy on GitHub Pages

1. Create a new GitHub repository (e.g. `portfolio`, or `arnavkhandelwal.github.io`
   if you want it at the root of your GitHub Pages domain).
2. Push this folder's contents to it:
   ```bash
   cd portfolio
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/arnavkhandelwal/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source → Deploy
   from a branch**, pick `main` and `/ (root)`, then save.
4. Your site goes live at:
   - `https://arnavkhandelwal.github.io/<repo-name>/` (normal repo), or
   - `https://arnavkhandelwal.github.io/` (if the repo is named
     `arnavkhandelwal.github.io`).
5. Add that URL to your resume once it's live.

## Notes on the interactive bits

- **Command palette** — `Ctrl+K` / `Cmd+K`, or click "Jump to…" in the top bar.
  Arrow keys + Enter to navigate, Esc to close.
- **Skill cross-filter** — click any skill chip in `skills.json` (or in a
  project/experience tag) to dim everything that doesn't use it.
- **contact.sh terminal** — try `help`, `whoami`, `open github`,
  `open linkedin`, `open leetcode`, `email`, `call`, `clear`.
- Deep links work: `index.html#projects`, `#experience`, `#achievements`,
  etc. jump straight to that section — handy for pointing recruiters at a
  specific part.
- Respects `prefers-reduced-motion` and is keyboard-navigable throughout.
