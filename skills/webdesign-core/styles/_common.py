"""Shared helpers for style modules."""
import hashlib, math


def esc(s):
    return (str(s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))


def seed(text, k=0):
    h = hashlib.sha256(f"{text}|{k}".encode()).hexdigest()
    return int(h[:8], 16) / 0xFFFFFFFF


def initials(text):
    w = [x for x in str(text).split() if x]
    return (w[0][0] + (w[1][0] if len(w) > 1 else w[0][1:2])).upper() if w else "?"


def blob_path(text, k=0, points=7, r=100, wobble=0.32, cx=150, cy=150):
    """Smooth closed blob path (cubic) — deterministic from text."""
    pts = []
    for i in range(points):
        a = i / points * 2 * math.pi
        rr = r * (1 - wobble / 2 + wobble * seed(text, k * 31 + i))
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    d = f"M{(pts[0][0] + pts[-1][0]) / 2:.1f},{(pts[0][1] + pts[-1][1]) / 2:.1f}"
    for i in range(points):
        p, n = pts[i], pts[(i + 1) % points]
        d += f" Q{p[0]:.1f},{p[1]:.1f} {(p[0] + n[0]) / 2:.1f},{(p[1] + n[1]) / 2:.1f}"
    return d + " Z"


def sticker_svg(label, palette, k=0, size=220):
    """Colourful object-like sticker (no stock photos needed): blob + inner shape + label."""
    c1 = palette[int(seed(label, k) * len(palette)) % len(palette)]
    c2 = palette[int(seed(label, k + 7) * len(palette)) % len(palette)]
    shape = int(seed(label, k + 3) * 4)
    inner = [
        f'<circle cx="150" cy="135" r="52" fill="{c2}"/><circle cx="150" cy="135" r="22" fill="#0a0a0a"/>',
        f'<rect x="95" y="85" width="110" height="100" rx="18" fill="{c2}"/><rect x="112" y="102" width="76" height="52" rx="8" fill="#0a0a0a"/>',
        f'<path d="M150 70 L210 180 L90 180 Z" fill="{c2}"/>',
        f'<rect x="120" y="70" width="60" height="120" rx="30" fill="{c2}"/><circle cx="150" cy="110" r="14" fill="#0a0a0a"/>',
    ][shape]
    return (f'<svg viewBox="0 0 300 300" width="{size}" height="{size}" role="img" aria-label="{esc(label)}">'
            f'<path d="{blob_path(label, k, r=120)}" fill="{c1}" stroke="#0a0a0a" stroke-width="6"/>{inner}</svg>')


ICON = {
    "arrow": '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    "mail": '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    "plus": '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
}


def links(brief):
    c = brief.get("contact") or {}
    return c.get("links") or []
