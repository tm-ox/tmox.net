#!/usr/bin/env python3
"""Add a tool logo from the simple-icons set to src/icons as a cropped, single-colour SVG.

    python3 scripts/tool-icon.py go vuedotjs ...   (names as in src/content/pages/index.md, no "simple-icons:" prefix)

The viewBox is cropped to the drawing's own bounds (needs inkscape), so ToolTile.astro can size every logo by
its real aspect ratio. Then set `icon: "<name>"` for the tool (local icon, no prefix). Run it only when adding a tool: it needs
inkscape and node_modules, and the SVGs it writes are committed.
"""
import json, os, subprocess, sys, tempfile

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = json.load(open(f"{root}/node_modules/@iconify-json/simple-icons/icons.json"))
for name in sys.argv[1:]:
    key = data.get("aliases", {}).get(name, {}).get("parent", name)
    if key not in data["icons"]:
        sys.exit(f'"{name}" is not in the simple-icons set (check the name at https://simpleicons.org; the slug has no dots or spaces)')
    body = data["icons"][key]["body"]
    tmp = tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False)
    tmp.write(f'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">{body}</svg>')
    tmp.close()
    q = subprocess.run(["inkscape", "--query-all", tmp.name], capture_output=True, text=True).stdout.splitlines()[0].split(",")
    os.unlink(tmp.name)
    x, y, w, h = (round(float(v), 3) for v in q[1:5])
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{x} {y} {w} {h}" fill="currentColor">{body}</svg>\n'
    open(f"{root}/src/icons/{name}.svg", "w").write(svg)
    print(name, w, h, round(w / h, 2))
