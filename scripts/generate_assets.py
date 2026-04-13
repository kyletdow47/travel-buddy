"""Generate app icon, adaptive icon, splash screen, and favicon PNGs.

Brand: Travel Buddy
- Primary color: #E86540 (orange)
- White background for splash
- Icon glyph: simplified paper airplane pointing upper-right on orange square
"""

from PIL import Image, ImageDraw, ImageFont
import os

ORANGE = (232, 101, 64)   # #E86540
WHITE = (255, 255, 255)
DARK = (26, 26, 26)

ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
os.makedirs(ASSETS_DIR, exist_ok=True)


def draw_paper_plane(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, color):
    """Draw a simplified paper airplane glyph centered on (cx, cy)."""
    # Triangle paper plane pointing upper-right
    half = size // 2
    # outer triangle
    tip = (cx + half, cy - half)
    tail_top = (cx - half, cy - int(half * 0.35))
    tail_bottom = (cx - int(half * 0.25), cy + half)
    midfold = (cx - int(half * 0.1), cy - int(half * 0.05))

    # main body triangle
    draw.polygon([tip, tail_top, midfold], fill=color)
    # lower wing
    draw.polygon([tip, midfold, tail_bottom], fill=color)
    # fold line shading (slightly darker) to add depth on white
    if color == WHITE:
        shadow = (230, 230, 230)
        draw.polygon([tip, midfold, tail_bottom], fill=shadow)
        draw.polygon([tip, tail_top, midfold], fill=color)


def make_icon(path: str, size: int = 1024):
    img = Image.new("RGB", (size, size), ORANGE)
    draw = ImageDraw.Draw(img)
    # Rounded square look is achieved by iOS system; we just fill with brand color.
    # Draw white paper airplane centered
    draw_paper_plane(draw, size // 2, size // 2, int(size * 0.55), WHITE)
    img.save(path, "PNG", optimize=True)


def make_adaptive_icon(path: str, size: int = 1024):
    # Adaptive icon foreground on transparent background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Orange circle background with plane on top
    margin = size // 8
    draw.ellipse([margin, margin, size - margin, size - margin], fill=ORANGE)
    draw_paper_plane(draw, size // 2, size // 2, int(size * 0.45), WHITE)
    img.save(path, "PNG", optimize=True)


def _try_font(size: int):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def make_splash(path: str, size: int = 2048):
    img = Image.new("RGB", (size, size), WHITE)
    draw = ImageDraw.Draw(img)

    # Centered orange circle with plane
    circle_size = int(size * 0.32)
    cx, cy = size // 2, int(size * 0.42)
    draw.ellipse(
        [cx - circle_size // 2, cy - circle_size // 2, cx + circle_size // 2, cy + circle_size // 2],
        fill=ORANGE,
    )
    draw_paper_plane(draw, cx, cy, int(circle_size * 0.6), WHITE)

    # App name
    title_font = _try_font(int(size * 0.065))
    title = "Travel Buddy"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - tw) / 2, cy + circle_size // 2 + int(size * 0.04)), title, font=title_font, fill=DARK)

    # Tagline
    tagline_font = _try_font(int(size * 0.028))
    tagline = "Your AI travel companion"
    bbox = draw.textbbox((0, 0), tagline, font=tagline_font)
    tw2, _ = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(
        ((size - tw2) / 2, cy + circle_size // 2 + int(size * 0.04) + th + int(size * 0.02)),
        tagline,
        font=tagline_font,
        fill=ORANGE,
    )

    img.save(path, "PNG", optimize=True)


def make_favicon(path: str, size: int = 48):
    img = Image.new("RGB", (size, size), ORANGE)
    draw = ImageDraw.Draw(img)
    draw_paper_plane(draw, size // 2, size // 2, int(size * 0.55), WHITE)
    img.save(path, "PNG", optimize=True)


if __name__ == "__main__":
    make_icon(os.path.join(ASSETS_DIR, "icon.png"))
    make_adaptive_icon(os.path.join(ASSETS_DIR, "adaptive-icon.png"))
    make_splash(os.path.join(ASSETS_DIR, "splash.png"))
    make_favicon(os.path.join(ASSETS_DIR, "favicon.png"))
    print("Assets generated in", ASSETS_DIR)
