# TypeKeys Website

This repository contains a static marketing website for TypeKeys, built in plain HTML, CSS, and JavaScript so it can be hosted on GitHub Pages without any framework setup.

## Local preview

From the repository root, run:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000> in a browser.

## GitHub Pages setup

1. Push this repository to GitHub.
2. Open the repository on GitHub.
3. Go to Settings > Pages.
4. Set the Source to **Deploy from a branch**.
5. Choose the **main** branch and the **/root** folder.
6. Save the configuration.
7. After the site is published, GitHub will provide a Pages URL.

The site uses relative asset paths, so it works from a GitHub Pages subpath as well as the root domain.

## Download configuration

The download buttons are configured in `script.js` by the `typekeysConfig.releaseUrl` variable.

```js
const typekeysConfig = {
  releaseUrl: "https://github.com/Andrews3dfactory/TypeKey/releases/latest/download/TypeKeys-Setup.exe"
};
```

This points the website directly to the current GitHub release installer for Windows.

## Files included

- `index.html` — landing page structure and content
- `styles.css` — styling, layout, and responsiveness
- `script.js` — mobile navigation and download-button configuration
- `assets/logo.png` — TypeKeys logo asset
- `assets/app-screenshot.png` — TypeKeys desktop application screenshot

## Notes

- The project currently does not include a verified release executable, so the primary download buttons intentionally stay disabled until a live Windows release is confirmed.
- No application source code, logos, or executable files were overwritten or removed.
- The website follows the provided TypeKeys desktop aesthetic and uses the supplied logo and screenshot assets.
