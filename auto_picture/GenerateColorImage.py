import os
import json
from PIL import Image, ImageDraw, ImageFont

# 경로 설정
color_groups_path = "../public/color_groups.json"
keycap_images_path = "../public/keycap/"
output_path = "./color_groups_output/"

# 폴더가 없으면 생성
os.makedirs(output_path, exist_ok=True)

# JSON 파일 로드
with open(color_groups_path, "r", encoding="utf-8") as f:
    color_groups = json.load(f)

# 폰트 설정 (Pretendard 적용)
try:
    font = ImageFont.truetype("./Pretendard.ttf", 40)
    small_font = ImageFont.truetype("./Pretendard.ttf", 30)
except IOError:
    print("⚠️ 'Pretendard.ttf' 폰트를 찾을 수 없음. 기본 폰트 사용.")
    font = ImageFont.load_default()
    small_font = ImageFont.load_default()

# 최대 한 이미지에 들어갈 최대 높이 설정 (6000px)
MAX_HEIGHT = 6000

# 기본 색상 매핑 (컬러 띠)
color_map = {
    "white": (255, 255, 255),
    "black": (0, 0, 0),
    "red": (255, 0, 0),
    "green": (0, 255, 0),
    "blue": (0, 0, 255),
    "navy": (0, 0, 128),
    "yellow": (255, 255, 0),
    "purple": (128, 0, 128),
    "orange": (255, 165, 0),
}

# 각 색상 그룹별로 이미지 처리
for color, keycaps in color_groups.items():
    images = []
    labels = []

    for keycap in keycaps:
        img_path = os.path.join(keycap_images_path, f"{keycap}.webp")
        if os.path.exists(img_path):
            try:
                img = Image.open(img_path)
                img.verify()  # 손상된 이미지 확인
                img = Image.open(img_path).convert("RGBA")  # 다시 열기
                images.append(img)
                labels.append(keycap)  # .webp 제거된 파일명
            except Exception as e:
                print(f"⚠️ {keycap}.webp 파일 오류: {e}")

    if not images:
        continue  # 해당 색상에 대한 이미지가 없으면 스킵

    # 이미지 나누기
    split_images = []
    current_batch = []
    current_height = 40  # 컬러 띠 높이 포함

    for img in images:
        if current_height + img.height > MAX_HEIGHT:
            split_images.append(current_batch)
            current_batch = []
            current_height = 40  # 컬러 띠 포함
        current_batch.append(img)
        current_height += img.height

    if current_batch:
        split_images.append(current_batch)

    # 나눈 이미지들 저장
    for idx, batch in enumerate(split_images):
        max_width = max(img.width for img in batch) + 200  # 왼쪽 파일명 공간 추가
        total_height = sum(img.height for img in batch) + 40  # 컬러 띠 추가

        # 캔버스 생성 (투명 배경)
        output_image = Image.new("RGBA", (max_width, total_height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(output_image)

        # 컬러 띠 추가
        stripe_color = color_map.get(color, (200, 200, 200))  # 기본 회색
        draw.rectangle([0, 0, max_width, 40], fill=stripe_color)
        draw.text((max_width // 2 - 50, 5), color.upper(), fill="black", font=font)

        # 이미지 삽입
        y_offset = 40
        for img, label in zip(batch, labels):
            # 파일명 텍스트 배경 추가 (검은색)
            text_x = 10
            text_y = y_offset + img.height // 2 - 10
            text_bbox = draw.textbbox((text_x, text_y), label, font=small_font)  # `getsize()` 대신 `textbbox()`
            draw.rectangle([text_bbox[0] - 5, text_bbox[1] - 5, text_bbox[2] + 5, text_bbox[3] + 5], fill="black")

            # 파일명 텍스트 추가 (화이트)
            draw.text((text_x, text_y), label, fill="white", font=small_font)

            # 이미지 배치 (오른쪽 정렬)
            output_image.paste(img, (200, y_offset), img)
            y_offset += img.height

        # 🔹 RGBA → RGB 변환 추가 (WebP 저장 오류 방지)
        output_image = output_image.convert("RGB")

        # 결과 저장
        output_filepath = os.path.join(output_path, f"{color}_{idx + 1}.webp")
        try:
            output_image.save(output_filepath, "WEBP")
            print(f"✅ 저장 완료: {output_filepath}")
        except Exception as e:
            print(f"❌ 저장 실패: {output_filepath} - {e}")

print(f"🚀 모든 작업 완료. 결과는 {output_path} 폴더 확인!")
