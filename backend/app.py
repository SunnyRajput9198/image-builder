import os
import io
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFont
from huggingface_hub import InferenceClient

load_dotenv()

app = Flask(__name__)
CORS(app) # CORS is still needed

try:
    client = InferenceClient(token=os.getenv("HF_TOKEN"))
    MODEL = "stabilityai/stable-diffusion-xl-base-1.0" 
except Exception as e:
    print(f"Failed to initialize InferenceClient: {e}")
    client = None

@app.route('/generate', methods=['POST'])
def generate():
    if not client:
        return jsonify({'error': 'Inference client not initialized.'}), 503

    data = request.get_json()
    video_title = data.get('title')

    if not video_title:
        return jsonify({'error': 'Title is required'}), 400

    prompt = f"YouTube thumbnail for '{video_title}', cinematic, high detail, vibrant colors, 16:9, no text"

    try:
        image = client.text_to_image(prompt, model=MODEL)
        # ... (Image processing logic remains the same) ...
        # draw = ImageDraw.Draw(image)
        # font_size = int(image.width / 15)
        # font = ImageFont.truetype("font.ttf", font_size)
        # text_bbox = draw.textbbox((0, 0), video_title.upper(), font=font)
        # text_width = text_bbox[2] - text_bbox[0]
        # text_height = text_bbox[3] - text_bbox[1]
        # position = ((image.width - text_width) / 2, (image.height - text_height) * 0.85)
        # stroke_width = int(font_size / 20)
        # draw.text(position, video_title.upper(), font=font, fill="white", stroke_width=stroke_width, stroke_fill="black")
        final_image_buffer = io.BytesIO()
        image.save(final_image_buffer, "PNG")
        final_image_buffer.seek(0)
        return send_file(final_image_buffer, mimetype='image/png')
    except Exception as e:
        if "is currently loading" in str(e):
             return jsonify({'error': 'Model is loading, please try again in 20-30 seconds.'}), 503
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)