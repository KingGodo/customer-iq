from PIL import Image
import numpy as np

src = r"C:\Users\Baller\.cursor\projects\c-Users-Baller-Documents-projects-CustomerIQ\assets\customeriq-hero-hand.png"
dst = r"C:\Users\Baller\Documents\projects\CustomerIQ\web\web\bank-frontend\public\customeriq-hero-hand.png"

img = Image.open(src).convert("RGBA")
arr = np.array(img).astype(np.float32)
r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

# Tight chroma key for pure screen green (~15,243,10): G very high, R and B very low
green = (g > 180) & (r < 80) & (b < 80) & (g - r > 100) & (g - b > 100)

# Milder spill for green fringe only (still protect lime: lime has r>150)
spill = (g > 150) & (r < 100) & (b < 100) & (g > r + 60) & (g > b + 60)

alpha = np.full(r.shape, 255.0, dtype=np.float32)
alpha[green] = 0
# Despill remaining fringe
alpha[spill & ~green] = np.clip(255 - (g[spill & ~green] - np.maximum(r[spill & ~green], b[spill & ~green])), 0, 255)

arr[:, :, 3] = alpha
out = Image.fromarray(arr.astype(np.uint8), "RGBA")

# Also despill green tint on edges of subject (reduce green channel where spill)
pixels = np.array(out).astype(np.float32)
rr, gg, bb, aa = pixels[:, :, 0], pixels[:, :, 1], pixels[:, :, 2], pixels[:, :, 3]
edge_spill = (aa > 0) & (aa < 255) & (gg > rr + 20) & (gg > bb + 20)
gg[edge_spill] = np.minimum(gg[edge_spill], (rr[edge_spill] + bb[edge_spill]) / 2 + 10)
pixels[:, :, 1] = gg
out = Image.fromarray(pixels.astype(np.uint8), "RGBA")

bbox = out.getbbox()
if bbox:
    pad = 16
    w, h = out.size
    out = out.crop(
        (
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(w, bbox[2] + pad),
            min(h, bbox[3] + pad),
        )
    )

out = out.resize((int(out.width * 1.55), int(out.height * 1.55)), Image.Resampling.LANCZOS)
out.save(dst, "PNG")

# Composite preview onto red to verify transparency
preview = Image.new("RGBA", out.size, (220, 40, 40, 255))
preview = Image.alpha_composite(preview, out)
preview_path = r"C:\Users\Baller\Documents\projects\CustomerIQ\web\web\bank-frontend\public\customeriq-hero-hand-preview.png"
preview.convert("RGB").save(preview_path)
a2 = np.array(out)[:, :, 3]
print("saved", dst, out.size, "transparent%", round((a2 == 0).mean() * 100, 1))
print("preview", preview_path)
