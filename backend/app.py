import os
import io
import requests
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image

# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- NEW: RapidAPI Configuration ---
# Get your RapidAPI key from the .env file
# Make sure your .env file has a line like:
# RAPIDAPI_KEY="f6d8fb2141msh9cd33eae2fb494ep1c6050jsndd808be073b9"
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
if not RAPIDAPI_KEY:
    raise ValueError("RAPIDAPI_KEY not found in .env file. Please add it.")

# The API endpoint and host
RAPIDAPI_URL = "https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/quick.php"
RAPIDAPI_HOST = "ai-text-to-image-generator-flux-free-api.p.rapidapi.com"


@app.route('/generate', methods=['POST'])
def generate():
    """
    This endpoint receives a title and generates a thumbnail using the RapidAPI.
    """
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': 'JSON payload with a "title" field is required'}), 400

    video_title = data.get('title')
    if not video_title:
        return jsonify({'error': 'The "title" field cannot be empty'}), 400

    # --- NEW: RapidAPI Payload and Headers ---
    # Construct the payload for the RapidAPI
    payload = {
        # The video_title is used as the prompt
        "prompt": f"YouTube thumbnail for '{video_title}', cinematic, high detail, vibrant colors, 16:9 aspect ratio, no text",
        "style_id": 4,  # You can change or parameterize this
        "size": "1-1"   # Note: This API might not support 16:9, "1-1" is used from your example
    }

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/json"
    }

    try:
        # --- 1. Make the POST request to the RapidAPI to get the image URL ---
        api_response = requests.post(RAPIDAPI_URL, json=payload, headers=headers)
        api_response.raise_for_status() # Raise an exception for bad status codes

        result = api_response.json()

        # --- NEW: Parsing the RapidAPI Response ---
        # Extract the image URL from the JSON response.
        # The path is result -> data -> results -> [0] -> origin
        image_url = result.get('result', {}).get('data', {}).get('results', [{}])[0].get('origin')

        if not image_url:
            print("API Error Response:", result)
            return jsonify({'error': 'Could not find image URL in the API response.', 'response': result}), 500

        # --- 2. Download the image from the URL ---
        image_response = requests.get(image_url)
        image_response.raise_for_status() # Check if the image download was successful

        # The downloaded content is in bytes
        image_bytes = image_response.content

        # --- 3. Process and send the image (this part is similar to your original code) ---
        image = Image.open(io.BytesIO(image_bytes))

        final_image_buffer = io.BytesIO()
        image.save(final_image_buffer, "PNG")
        final_image_buffer.seek(0)

        return send_file(final_image_buffer, mimetype='image/png')

    except requests.exceptions.HTTPError as http_err:
        return jsonify({'error': f'HTTP error occurred: {http_err}', 'response_text': http_err.response.text}), 500
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)