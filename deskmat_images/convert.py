import os
from PIL import Image

def convert_png_to_webp(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".png"):
            image_path = os.path.join(directory, filename)
            image = Image.open(image_path)
            webp_path = os.path.splitext(image_path)[0] + '.webp'
            image.save(webp_path, 'WEBP')

convert_png_to_webp('./files')  # 현재 디렉토리를 대상으로 설정