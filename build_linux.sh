#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ "$(uname -s)" != "Linux" ]]; then
    echo "This build must run on Linux."
    exit 1
fi

for command_name in python3 tar; do
    if ! command -v "$command_name" >/dev/null 2>&1; then
        echo "Required command not found: $command_name"
        exit 1
    fi
done

for required_file in main.py requirements.txt assets/typekeys-logo.png; do
    if [[ ! -f "$required_file" ]]; then
        echo "Missing required application source file: $required_file"
        echo "Place this script in the root of a complete TypeKeys application source checkout and try again."
        exit 1
    fi
done

python3 -m venv .venv-linux
source .venv-linux/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

architecture="$(uname -m)"
case "$architecture" in
    x86_64|aarch64) ;;
    *)
        echo "Unsupported Linux architecture: $architecture"
        exit 1
        ;;
esac

app_dir="dist/TypeKeys.AppDir"
stage_dir="build/TypeKeys-linux"
archive="dist/TypeKeys-linux-${architecture}.tar.gz"
appimage="dist/TypeKeys-linux-${architecture}.AppImage"

rm -rf "dist/TypeKeys" "$app_dir" "$stage_dir"
rm -f "$archive" "$appimage"
mkdir -p build dist "$app_dir/usr/bin" "$app_dir/usr/share/icons/hicolor/512x512/apps" "$stage_dir"

pyinstaller \
    --noconfirm \
    --clean \
    --windowed \
    --onedir \
    --name TypeKeys \
    --add-data "assets:assets" \
    --distpath dist \
    --workpath build/linux-pyinstaller \
    main.py

if [[ ! -x "dist/TypeKeys/TypeKeys" ]]; then
    echo "PyInstaller did not create the expected Linux executable: dist/TypeKeys/TypeKeys"
    exit 1
fi

cp -a "dist/TypeKeys" "$stage_dir/TypeKeys"
tar -czf "$archive" -C "$stage_dir" TypeKeys

cp -a "dist/TypeKeys" "$app_dir/usr/bin/TypeKeys"
cp "assets/typekeys-logo.png" "$app_dir/usr/share/icons/hicolor/512x512/apps/typekeys.png"
printf '%s\n' \
    '[Desktop Entry]' \
    'Name=TypeKeys' \
    'Comment=Type saved text macros into the focused application' \
    'Exec=AppRun' \
    'Icon=typekeys' \
    'Terminal=false' \
    'Type=Application' \
    'Categories=Utility;Office;' \
    > "$app_dir/typekeys.desktop"
printf '%s\n' \
    '#!/bin/sh' \
    'HERE="$(dirname "$(readlink -f "$0")")"' \
    'exec "$HERE/usr/bin/TypeKeys/TypeKeys" "$@"' \
    > "$app_dir/AppRun"
chmod +x "$app_dir/AppRun"

echo
echo "Portable Linux package created:"
echo "  $archive"

if command -v appimagetool >/dev/null 2>&1; then
    ARCH="$architecture" appimagetool "$app_dir" "$appimage"
    echo "  $appimage"
else
    echo "AppImage was not created because appimagetool is not installed."
    echo "Install appimagetool from https://github.com/AppImage/AppImageKit/releases"
    echo "and rerun this script to also create: $appimage"
fi

echo "The AppImage, when created, and the portable archive must be built on Linux."
echo "Global hotkeys and typing require an X11 session (or XWayland); native Wayland support is not provided by pynput."
