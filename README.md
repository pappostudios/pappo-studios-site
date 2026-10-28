# Pappo Studios — portfolio

Static site (plain HTML, CSS and JS, no build step) for Erez Pappo. It's bilingual (English and Hebrew) and works on GitHub Pages as is.

| Page | Theme |
|---|---|
| `index.html` | Pappo Studios: warm cream and caramel, editorial serif |
| `projects.html` | Work index: each row sweeps in its project's colour on hover |
| `milometry.html` | Milometry's own cream with a blue-to-violet palette, chunky buttons and the Mili mascot, plus a playable flashcard demo |
| `kj-fitness.html` | KJ Fitness teal blocks with hard shadows, covering the app and the website |
| `future.html` | The Lab: a dark synthwave arena |
| `about.html` | About me, with a photo slot and placeholders to edit |

Shared code lives in `assets/site.css` (tokens, header, reveals) and `assets/site.js` (language toggle, scroll reveals, counters, tilt, mobile menu). Each page sets its own theme by overriding the CSS tokens on `<body>`.

## Editing

- **Languages:** every string is written twice, once as `<span class="en">` and once as `<span class="he">`. The 'עב / EN' button switches the language, and the choice is saved in `localStorage`.
- **Your photo:** save it as `images/about/me.jpg` (portrait, about 4:5). It replaces the placeholder automatically.
- **About text:** search `about.html` for `EDIT`. Unfilled placeholders have a dashed outline (`class="todo"`). Delete that class once the text is yours.
- **CV:** add `files/Erez-Pappo-CV.pdf`, then remove `hidden` from the "Download CV" button in `about.html`.
- **LinkedIn:** there's a commented-out link in the contact section of `index.html`.
- **Lab progress bars:** in `future.html`, change `--v` on each `.meter i`.

## Images

All images are stored in `images/`. Nothing is hotlinked: the `milometry` repo is private, so its files would show as broken images to visitors.

- **Milometry screenshots:** captured from the app's web build at 3× density (iPhone-sized viewport, 393×852 CSS px), with demo progress seeded. They're saved as 900px-wide JPEGs at quality 90 with full chroma (`subsampling=0`), which keeps the Hebrew text crisp.
- **KJ website shots:** captured from the site at 3× (phone) and 2× (desktop).
