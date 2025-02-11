import os
import glob
import shutil
import json
import re
from icrawler.builtin import GoogleImageCrawler
from PIL import Image

# 작업 폴더 & 최종 저장 폴더
JSON_FOLDER = "../src/config/organized/GMK"
WORKSPACE_FOLDER = "./workspace"
FINAL_SAVE_FOLDER = "../public/keycap/"

MIN_IMAGE_COUNT = 5
MAX_ITERATIONS = 5

def safe_remove(filepath):
    """파일 삭제 (예외 방지)"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"🗑 삭제됨: {filepath}")
    except Exception as e:
        print(f"❌ 파일 삭제 오류: {filepath} ({e})")

def is_rendered_image(img):
    """렌더링 이미지 여부 확인 (EXIF 정보 없는 경우 렌더링 이미지로 간주)"""
    try:
        exif = img._getexif()
    except Exception:
        exif = None
    return exif is None

def process_images_from_folder(temp_folder, valid_images, remaining_needed):
    """다운로드된 이미지를 WebP로 변환"""
    count_added = 0
    for filepath in glob.glob(os.path.join(temp_folder, '*')):
        if count_added >= remaining_needed:
            break
        try:
            with Image.open(filepath) as img:
                img.load()
                width, height = img.size

                # 해상도 조건 확인 (높이 600px 이상만 사용)
                if height < 600:
                    print(f"⚠️ {filepath} - 해상도 부족 ({height}px)")
                    safe_remove(filepath)
                    continue

                # 렌더링 이미지 판별
                if not is_rendered_image(img):
                    print(f"⚠️ {filepath} - 렌더링 이미지 아님")
                    safe_remove(filepath)
                    continue

                # 가로 800px로 리사이즈 (높이 기준)
                scale = 600 / height
                img_resized = img.resize((int(width * scale), 600), Image.LANCZOS)

                # WebP로 저장
                base_name = os.path.splitext(os.path.basename(filepath))[0]
                final_filepath = os.path.join(temp_folder, base_name + '.webp')
                img_resized.save(final_filepath, 'WEBP', quality=75, optimize=True)

                # 저장 확인
                if os.path.exists(final_filepath):
                    valid_images.append(final_filepath)
                    count_added += 1
                    print(f"✅ 변환됨: {final_filepath}")
                else:
                    print(f"❌ 저장 실패: {final_filepath}")

                # 원본 삭제
                safe_remove(filepath)

        except Exception as e:
            print(f"❌ 오류 발생: {filepath} ({e})")
            safe_remove(filepath)
    return count_added

def merge_images_into_scrollable(image_files, output_filepath):
    """이미지들을 가로로 병합하여 투명 배경 WebP 생성"""
    image_files = [img for img in image_files if os.path.exists(img)]  # 존재하는 파일만 사용
    if len(image_files) < MIN_IMAGE_COUNT:
        print(f"❌ 최소 {MIN_IMAGE_COUNT}개 필요하지만, {len(image_files)}개만 있음. 병합 취소.")
        return None

    images = [Image.open(img).convert("RGBA") for img in image_files]  # RGBA 변환
    total_width = sum(img.width for img in images)
    max_height = max(img.height for img in images)

    if total_width == 0 or max_height == 0:
        print("❌ 병합 실패: 이미지 크기가 유효하지 않음.")
        return None

    # 투명 배경 생성
    merged_image = Image.new('RGBA', (total_width, max_height), (0, 0, 0, 0))

    x_offset = 0
    for img in images:
        merged_image.paste(img, (x_offset, 0), mask=img)
        x_offset += img.width
        img.close()

    try:
        merged_image.save(output_filepath, 'WEBP', quality=75, lossless=True)
        print(f"✅ '{output_filepath}' (투명 배경) 생성 완료")
    except Exception as e:
        print(f"❌ WebP 저장 오류: {e}")
        return None

    return output_filepath

def extract_labels_from_json():
    """JSON 파일에서 manufacturer와 label 값 추출 (mkg_ 제거)"""
    labels = []
    for json_file in glob.glob(os.path.join(JSON_FOLDER, '*.json')):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'label' in data and 'manufacturer' in data:
                    manufacturer = data['manufacturer']
                    label = data['label'].replace("mkg_", "")
                    labels.append((json_file, manufacturer, label))
        except Exception as e:
            print(f"❌ JSON 읽기 오류: {json_file} ({e})")
    return labels

def process_labels():
    """JSON별 manufacturer와 label을 검색하여 이미지 크롤링 및 병합"""
    labels = extract_labels_from_json()
    if not labels:
        print("❌ JSON 파일에서 검색할 label을 찾을 수 없습니다.")
        return

    os.makedirs(WORKSPACE_FOLDER, exist_ok=True)
    os.makedirs(FINAL_SAVE_FOLDER, exist_ok=True)

    for json_file, manufacturer, label in labels:
        search_query = f"{manufacturer} {label}"
        print(f"\n🔍 '{search_query}' 검색 중...")

        temp_dir = os.path.join(WORKSPACE_FOLDER, label)
        os.makedirs(temp_dir, exist_ok=True)

        valid_images = []
        iteration = 0

        while len(valid_images) < MIN_IMAGE_COUNT and iteration < MAX_ITERATIONS:
            iteration += 1
            remaining_needed = MIN_IMAGE_COUNT - len(valid_images)

            print(f"[Iteration {iteration}] '{search_query}' 추가 다운로드 ({remaining_needed}개 필요)...")

            google_crawler = GoogleImageCrawler(storage={'root_dir': temp_dir})
            google_crawler.crawl(keyword=search_query, max_num=remaining_needed * 3)

            added = process_images_from_folder(temp_dir, valid_images, remaining_needed)
            print(f"✅ {added}개 추가됨 (현재 {len(valid_images)}/{MIN_IMAGE_COUNT})")

        if len(valid_images) < MIN_IMAGE_COUNT:
            print(f"❌ '{search_query}' 검색 결과 부족 (최소 {MIN_IMAGE_COUNT}개 필요, {len(valid_images)}개 확보)")
            shutil.rmtree(temp_dir, ignore_errors=True)
            continue

        json_filename = os.path.splitext(os.path.basename(json_file))[0] + ".webp"
        merged_image_path = os.path.join(temp_dir, json_filename)
        merged_image = merge_images_into_scrollable(valid_images, merged_image_path)

        if merged_image:
            final_destination = os.path.join(FINAL_SAVE_FOLDER, json_filename)
            shutil.move(merged_image, final_destination)
            print(f"🚀 '{final_destination}' 이동 완료")

        shutil.rmtree(temp_dir, ignore_errors=True)

    print("✅ 모든 JSON 처리가 완료되었습니다.")

if __name__ == '__main__':
    process_labels()
