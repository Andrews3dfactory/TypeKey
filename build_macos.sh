#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "This build must run on macOS."
    exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
    echo "Python 3 is required. Install it from https://www.python.org/downloads/macos/."
    exit 1
fi

if ! command -v sips >/dev/null 2>&1 || ! command -v iconutil >/dev/null 2>&1; then
    echo "Apple's sips and iconutil tools are required to create the app icon."
    exit 1
fi

if ! command -v hdiutil >/dev/null 2>&1; then
    echo "Apple's hdiutil tool is required to create the disk image."
    exit 1
fi

for required_file in main.py requirements.txt assets/typekeys-logo.png; do
    if [[ ! -f "$required_file" ]]; then
        echo "Missing required application source file: $required_file"
        echo "Place this script in the root of a complete TypeKeys application source checkout and try again."
        exit 1
    fi
done

python3 -m venv .venv-macos
source .venv-macos/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

iconset="build/TypeKeys.iconset"
app_bundle="dist/TypeKeys.app"
dmg_stage="build/TypeKeys-dmg"
dmg_output="dist/TypeKeys-macOS.dmg"
icns_output="assets/TypeKeys.icns"

rm -rf "$iconset" "$app_bundle" "$dmg_stage"
rm -f "$icns_output"
mkdir -p "$iconset" build dist

logo="assets/typekeys-logo.png"

for size in 16 32 128 256 512; do
    sips -s format png -z "$size" "$size" "$logo" \
        --out "$iconset/icon_${size}x${size}.png" >/dev/null
    if [[ "$size" -lt 512 ]]; then
        double_size=$((size * 2))
        sips -s format png -z "$double_size" "$double_size" "$logo" \
            --out "$iconset/icon_${size}x${size}@2x.png" >/dev/null
    fi
done

iconutil -c icns "$iconset" -o "$icns_output"

pyinstaller \
    --noconfirm \
    --clean \
    --windowed \
    --onedir \
    --name TypeKeys \
    --osx-bundle-identifier com.typekeys.app \
    --icon "$icns_output" \
    --add-data "assets:assets" \
    --distpath dist \
    --workpath build/macos-pyinstaller \
    main.py

if [[ ! -d "$app_bundle" ]]; then
    echo "PyInstaller did not create the expected app bundle: $app_bundle"
    exit 1
fi

mkdir -p "$dmg_stage"
ditto "$app_bundle" "$dmg_stage/TypeKeys.app"
ln -s /Applications "$dmg_stage/Applications"
hdiutil create \
    -volname "TypeKeys" \
    -srcfolder "$dmg_stage" \
    -ov \
    -format UDZO \
    "$dmg_output"

echo
echo "Build complete:"
echo "  App: $app_bundle"
echo "  Downloadable disk image: $dmg_output"
echo "Build on Apple Silicon or Intel Macs to produce a build for that Mac architecture."
