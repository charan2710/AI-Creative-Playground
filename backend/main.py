from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from io import BytesIO
from rembg import remove
import base64
import random
import logging
import numpy as np
import os
import requests
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SD INTEGRATION: Load environment variables
load_dotenv()
SD_WEBUI_URL = os.getenv("SD_WEBUI_URL")

# Feature flag to switch between real AI and fallback
USE_REAL_AI = os.getenv("USE_REAL_AI", "False").lower() in ('true', '1', 't')


# AI INTEGRATION: New function to build detailed, theme-aware prompts
def build_poster_prompt(theme: str, product_name: str) -> str:
    base_prompt = (
        f"Create a high-end, professional commercial advertising poster featuring a '{product_name}'. "
        "The poster should be ultra-clear, crisp, and of Behance/Dribbble-level quality. "
        "The composition must have clear designated space for a headline, a call-to-action, and a small brand logo. "
        "Do not include any actual text in the image; focus on the visual aesthetic. "
        "The aspect ratio is 1:1."
    )

    theme_prompts = {
        "Sporty": (
            "The style is energetic and dynamic. Use a diagonal composition with bold red and neon orange accents. "
            "Lighting should be dramatic, with motion lines or a sense of speed. Typography zone should be reserved for strong, bold fonts."
        ),
        "Festival": (
            "The mood is warm, vibrant, and celebratory. Use colorful gradients of pink, purple, and orange. "
            "Incorporate soft bokeh, confetti-like blobs, and festive lighting. The layout should feel fun and energetic."
        ),
        "Nature": (
            "The aesthetic is calm, earthy, and eco-friendly. Use a palette of greens and earth tones. "
            "Lighting should be soft and natural, perhaps dappled light through leaves. Add organic textures."
        ),
        "Luxury": (
            "The design is minimal, elegant, and sophisticated. Use a dark background (black or deep charcoal) with gold or silver metallic accents. "
            "Employ a single, dramatic spotlight on the product. The layout should be clean with lots of negative space."
        ),
        "Minimal": (
            "The concept is ultra-clean and modern. Use soft, neutral gradients (light gray, beige, indigo). "
            "The layout must be spacious with significant negative space. Focus on a single, perfectly centered product."
        ),
    }
    
    theme_description = theme_prompts.get(theme, theme_prompts["Minimal"])
    return f"{base_prompt} {theme_description}"

# SD INTEGRATION: New function to call the Stable Diffusion API and return bytes
def generate_poster_with_sd(theme: str, product_name: str, variation_index: int) -> bytes:
    prompt = build_poster_prompt(theme, product_name)
    prompt += f" This is variation {variation_index + 1}."
    
    logger.info(f"--- CALLING STABLE DIFFUSION (Theme: {theme}, Variation: {variation_index + 1}) ---")

    payload = {
        "prompt": prompt,
        "negative_prompt": "text, letters, watermark, signature, ugly, deformed",
        "steps": 25,
        "width": 1024,
        "height": 1024,
        "sampler_name": "Euler a",
    }

    response = requests.post(url=f'{SD_WEBUI_URL}/sdapi/v1/txt2img', json=payload)
    response.raise_for_status()
    r = response.json()
    
    image_b64 = r['images'][0]
    return base64.b64decode(image_b64)





app = FastAPI()


# Configure CORS
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Advanced Image Generation Functions ---

def create_gradient(width, height, color1, color2, direction='vertical'):
    if direction == 'vertical':
        base = Image.new('RGB', (width, height), color1)
        top = Image.new('RGB', (width, height), color2)
        mask = Image.new('L', (width, height))
        mask_data = []
        for y in range(height):
            mask_data.extend([int(255 * (y / height))] * width)
        mask.putdata(mask_data)
        base.paste(top, (0, 0), mask)
    else: # horizontal
        base = Image.new('RGB', (width, height), color1)
        right = Image.new('RGB', (width, height), color2)
        mask = Image.new('L', (width, height))
        mask_data = []
        for y in range(height):
            for x in range(width):
                 mask_data.append(int(255 * (x / width)))
        mask.putdata(mask_data)
        base.paste(right, (0, 0), mask)
    return base

def add_blurred_shapes(canvas, shapes=3):
    overlay = Image.new('RGBA', canvas.size, (255,255,255,0))
    draw = ImageDraw.Draw(overlay)
    for _ in range(shapes):
        x1, y1 = random.randint(-100, canvas.width - 100), random.randint(-100, canvas.height - 100)
        x2, y2 = x1 + random.randint(200, 500), y1 + random.randint(200, 500)
        color = (random.randint(0,255), random.randint(0,255), random.randint(0,255), random.randint(40, 80))
        draw.ellipse([x1, y1, x2, y2], fill=color)
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=80))
    return Image.alpha_composite(canvas, overlay)

def add_product_shadow(canvas, product_img, product_y_pos):
    shadow_height = product_img.height // 4
    shadow = Image.new('RGBA', (product_img.width, shadow_height), (0,0,0,0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.ellipse([(0,0), (product_img.width, shadow_height)], fill=(0,0,0,70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=30))
    
    shadow_x = (canvas.width - product_img.width) // 2
    shadow_y = product_y_pos + product_img.height - (shadow_height // 2)
    canvas.paste(shadow, (shadow_x, shadow_y), shadow)
    return canvas

def add_product_reflection(canvas, product_img, product_y_pos):
    reflection = product_img.copy().transpose(Image.FLIP_TOP_BOTTOM)
    reflection = reflection.filter(ImageFilter.GaussianBlur(radius=2))
    
    mask = Image.new('L', reflection.size)
    gradient = np.linspace(80, 0, reflection.height) # 80 is ~30% opacity
    mask_data = np.tile(gradient, (reflection.width, 1)).T.astype(np.uint8)
    mask.putdata(mask_data.flatten())
    
    reflection_x = (canvas.width - product_img.width) // 2
    reflection_y = product_y_pos + product_img.height
    canvas.paste(reflection, (reflection_x, reflection_y), mask)
    return canvas

def add_vignette(canvas):
    vignette = Image.new('L', (canvas.width * 2, canvas.height * 2), 0)
    draw = ImageDraw.Draw(vignette)
    draw.ellipse([(0,0), (canvas.width * 2, canvas.height * 2)], fill=255)
    vignette = vignette.resize(canvas.size, Image.LANCZOS)
    vignette = vignette.filter(ImageFilter.GaussianBlur(radius=canvas.width//3))
    
    alpha = canvas.getchannel('A')
    vignette_alpha = np.array(vignette)
    new_alpha = np.minimum(np.array(alpha), vignette_alpha)
    canvas.putalpha(Image.fromarray(new_alpha))
    return canvas

def get_font(size):
    try:
        font = ImageFont.truetype("arial.ttf", size)
    except IOError:
        font = ImageFont.load_default()
    return font

# --- Enhanced Theme Configuration ---
THEME_CONFIG = {
    "Minimal": {
        "palettes": [((245, 245, 245), (224, 224, 224))],
        "font_color": (10, 10, 10),
        "headline": "Pure & Simple",
        "effects": []
    },
    "Luxury": {
        "palettes": [((40, 40, 40), (10, 10, 10))],
        "font_color": (212, 175, 55),
        "headline": "Experience True Luxury",
        "effects": ['reflection', 'vignette']
    },
    "Sporty": {
        "palettes": [((200, 0, 0), (50, 50, 50)), ((0, 100, 220), (230, 230, 230))],
        "font_color": (255, 255, 255),
        "headline": "UNLEASH YOUR POWER",
        "effects": ['shadow']
    },
    "Festival": {
        "palettes": [((138, 43, 226), (255, 0, 255)), ((255, 105, 180), (255, 185, 85))],
        "font_color": (255, 255, 255),
        "headline": "Live The Moment",
        "effects": ['blurred_shapes']
    },
    "Nature": {
        "palettes": [((34, 139, 34), (189, 183, 107)), ((139, 69, 19), (244, 164, 96))],
        "font_color": (255, 255, 255),
        "headline": "Back to Nature",
        "effects": ['reflection', 'vignette']
    }
}

# --- Rewritten Core Generation Function ---
def call_generative_ai_model(product_img_no_bg, logo_img, theme, layout_variation):
    config = THEME_CONFIG.get(theme, THEME_CONFIG["Minimal"])
    logger.info(f"--- SIMULATING ADVANCED AI CALL (Theme: {theme}) ---")

    # 1. Create Base Canvas
    color1, color2 = random.choice(config["palettes"])
    canvas = create_gradient(1080, 1080, color1, color2).convert("RGBA")
    
    if 'blurred_shapes' in config['effects']:
        canvas = add_blurred_shapes(canvas)

    # 2. Place Product and Effects
    product_img_resized = product_img_no_bg.copy()
    product_img_resized.thumbnail((650, 650))
    product_y = (1080 - product_img_resized.height) // 2
    
    if 'shadow' in config['effects']:
        canvas = add_product_shadow(canvas, product_img_resized, product_y)
    if 'reflection' in config['effects']:
        canvas = add_product_reflection(canvas, product_img_resized, product_y)
    
    product_x = (1080 - product_img_resized.width) // 2
    canvas.paste(product_img_resized, (product_x, product_y), product_img_resized)

    # 3. Place Logo
    logo_img_resized = logo_img.copy()
    logo_img_resized.thumbnail((180, 180))
    logo_pos = layout_variation['logo_pos']
    if logo_pos == "top-left": canvas.paste(logo_img_resized, (50, 50), logo_img_resized)
    elif logo_pos == "top-right": canvas.paste(logo_img_resized, (1080 - logo_img_resized.width - 50, 50), logo_img_resized)
    
    # 4. Add Typography
    draw = ImageDraw.Draw(canvas)
    headline_font = get_font(90)
    cta_font = get_font(50)
    headline_text = config["headline"]
    cta_text = "SHOP NOW"
    
    font_color_tuple = config["font_color"] + (230,)
    draw.text((60, 800), headline_text, font=headline_font, fill=font_color_tuple)
    draw.text((60, 920), cta_text, font=cta_font, fill=font_color_tuple)

    # 5. Add Final Touches
    if 'vignette' in config['effects']:
        canvas = add_vignette(canvas)

    buffered = BytesIO()
    canvas.save(buffered, format="PNG")
    
    return {
        "image_bytes": buffered.getvalue(),
        "cta_text": cta_text,
        "palette": ['#%02x%02x%02x' % c for c in [color1, color2]]
    }

# --- API Endpoint (No structural change needed) ---
@app.post("/generate_layouts/")
async def generate_layouts(product_image: UploadFile = File(...), logo_image: UploadFile = File(...), theme: str = Form("Minimal")):
    product_img_data = await product_image.read()
    logo_img_data = await logo_image.read()
    
    # Use filename as a proxy for product name, or a generic fallback.
    product_name = product_image.filename.split('.')[0].replace('_', ' ') if product_image.filename else "product"

    generated_layouts = []
    
    # SD INTEGRATION: Switch between real AI and fallback PIL model
    if USE_REAL_AI and SD_WEBUI_URL:
        logger.info("--- Using REAL AI (Stable Diffusion) pipeline ---")
        for i in range(3): # Generate 3 variations
            try:
                image_bytes = generate_poster_with_sd(theme, product_name, i)
                
                # Compress image to reduce size before sending
                img = Image.open(BytesIO(image_bytes))
                buffered = BytesIO()
                img.save(buffered, format="JPEG", quality=85) # Compress to JPEG
                img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

                generated_layouts.append({
                    "image": img_str,
                    "score": random.uniform(0.85, 0.99),
                    "cta_text": "SHOP NOW",
                    "palette": [] 
                })
            except Exception as e:
                logger.error(f"Stable Diffusion API call failed: {e}. Falling back to PIL-based generation for this variation.")
                # Fallback for a single variation if API fails mid-loop
                product_img_no_bg = Image.open(BytesIO(remove(product_img_data))).convert("RGBA")
                logo_img = Image.open(BytesIO(logo_img_data)).convert("RGBA")
                result = call_generative_ai_model(product_img_no_bg, logo_img, theme, {"logo_pos": "top-left"})
                img_str = base64.b64encode(result["image_bytes"]).decode("utf-8")
                generated_layouts.append({
                    "image": img_str,
                    "score": random.uniform(0.75, 0.99),
                    "cta_text": result["cta_text"],
                    "palette": result["palette"]
                })
    
    # Fallback to old model if REAL_AI is off or URL is missing
    if not generated_layouts:
        logger.info("--- Using FALLBACK (PIL) pipeline ---")
        product_img_no_bg = Image.open(BytesIO(remove(product_img_data))).convert("RGBA")
        logo_img = Image.open(BytesIO(logo_img_data)).convert("RGBA")
        layout_variations = [{"logo_pos": "top-left"}, {"logo_pos": "top-right"}]

        for variation in layout_variations:
            result = call_generative_ai_model(product_img_no_bg, logo_img, theme, variation)
            img_str = base64.b64encode(result["image_bytes"]).decode("utf-8")
            generated_layouts.append({
                "image": img_str,
                "score": random.uniform(0.75, 0.99),
                "cta_text": result["cta_text"],
                "palette": result["palette"]
            })

    return {"layouts": generated_layouts}