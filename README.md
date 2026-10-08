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

## Downloads and version history

The existing `download.html` page is the Downloads & Version History page. It reads release metadata from the public GitHub Releases API at runtime; no server, API key, or checked-in release manifest is required. Release versions, publication dates, prerelease status, notes, asset names, sizes, and download links come from the API response. Download buttons use the actual `browser_download_url` values returned by GitHub.

Platform tabs only show assets whose filenames identify a supported package type:

- Windows: `.exe` and `.msi`, plus `.zip` assets named for Windows.
- macOS: `.dmg` and `.pkg`, plus `.zip` assets named for macOS.
- Linux: `.AppImage`, `.deb`, and `.rpm`, plus `.zip` or `.tar.gz` assets named for Linux.

This avoids presenting a Windows installer as a macOS or Linux download. If no matching asset exists, that platform shows its unavailable state and links to the official releases page. Release notes are displayed as text from GitHub (not executable HTML), and API failures or rate limits leave a GitHub Releases fallback link.

The macOS tab also offers `build_macos.sh` as an experimental build helper, not as a macOS download. Transfer it from Windows to a Mac and run it with `bash ./build_macos.sh` from the root of a complete TypeKeys application source checkout. It requires `main.py`, `requirements.txt`, `assets/typekeys-logo.png`, Python 3, and macOS tools including `sips`, `iconutil`, and `hdiutil`. This website repository does not contain those application source files, and the script has not been tested on a Mac; a successful build is not guaranteed.

The Linux tab offers `build_linux.sh` under the same experimental, untested caveat. Transfer it from Windows to a Linux computer and run `bash ./build_linux.sh` from a complete application source checkout with `main.py`, `requirements.txt`, and `assets/typekeys-logo.png`. It requires Python 3 and `tar`, creates a portable `.tar.gz`, and only creates an AppImage if `appimagetool` is installed. Global hotkeys need X11/XWayland; native Wayland is not supported by `pynput`. This website repository does not contain the application source files, and the script has not been tested on Linux.

To publish a new version:

1. Create a GitHub Release in `Andrews3dfactory/TypeKey` and upload the build artifacts.
2. Use filenames that clearly identify the target OS and a conventional package extension (for example, `TypeKeys-Setup.exe` or `TypeKeys-macos.dmg`).
3. Set GitHub's **Set as a pre-release** option accurately. The page labels prereleases from this flag and never calls one the latest stable release.
4. Publish the release. The page fetches it automatically; there is no website data file to edit.

The website requests releases newest-first from GitHub and follows API pagination so older published versions remain accessible. If GitHub's public API is unavailable, visitors can still use the official releases page link.

## Files included

- `index.html` — landing page structure and content
- `download.html` — platform-selectable Downloads & Version History page
- `styles.css` — styling, layout, and responsiveness
- `script.js` — mobile navigation and live GitHub release history
- `assets/logo.png` — TypeKeys logo asset
- `assets/app-screenshot.png` — TypeKeys desktop application screenshot

## Notes

- The current published release metadata is retrieved directly from GitHub; no release details or future builds are hard-coded on the website.
- No application source code, logos, or executable files are overwritten by the website.
- The website follows the TypeKeys desktop aesthetic and uses the supplied logo and screenshot assets.
