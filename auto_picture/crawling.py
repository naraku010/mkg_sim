import os
import glob
import json
import shutil
from icrawler.builtin import GoogleImageCrawler
from PIL import Image

# 작업 폴더 & 최종 저장 폴더
JSON_FOLDER = "../src/config/organized/GMK"
WORKSPACE_FOLDER = "./workspace"
FINAL_SAVE_FOLDER = "../public/keycap/"

# 한 번에 다운로드할 최대 이미지 수
CRAWL_MAX_NUM = 10
# 최소 합칠 이미지 수
MIN_IMAGE_COUNT = 5

def safe_remove(filepath):
    """파일 삭제 (예외 방지)"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"🗑 삭제됨: {filepath}")
    except Exception as e:
        print(f"❌ 파일 삭제 오류: {filepath} ({e})")

def extract_labels_from_json():
    """JSON 파일에서 (json경로, manufacturer, label) 목록 뽑아오기."""
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

def google_image_search(search_query, temp_dir):
    """
    검색어 search_query로 Google 크롤링.
    한 번에 CRAWL_MAX_NUM장 시도.
    """
    google_crawler = GoogleImageCrawler(storage={"root_dir": temp_dir})
    google_crawler.crawl(
        keyword=search_query,
        filters={"size": "large"},
        max_num=CRAWL_MAX_NUM
    )

def process_downloaded_images_in_order(temp_dir):
    """
    temp_dir 안 이미지를 **다운로드 순**(파일명 000001, 000002...)대로 확인.
    - 높이 < 600 스킵 (삭제)
    - 세로 600 리사이즈 → WebP 저장 후 원본 삭제
    - 순서대로 유효 이미지 경로를 리스트로 반환
    """
    # iCrawler는 기본적으로 파일명을 000001, 000002.. 이런 식으로 저장한다.
    # glob 후에 정렬해서 순서 지킨다.
    filepaths = sorted(glob.glob(os.path.join(temp_dir, "*")))

    valid_paths = []
    for filepath in filepaths:
        if os.path.isdir(filepath):
            # metadata나 logs 폴더는 패스
            continue
        try:
            with Image.open(filepath) as img:
                img.load()
                w, h = img.size

                if h < 600:
                    safe_remove(filepath)
                    continue

                # 리사이즈 (세로 600)
                scale = 600 / h
                new_w = int(w * scale)
                img_resized = img.resize((new_w, 600), Image.LANCZOS)

                base_name, _ = os.path.splitext(os.path.basename(filepath))
                webp_path = os.path.join(temp_dir, f"{base_name}.webp")
                img_resized.save(webp_path, "WEBP", quality=80, optimize=True)

                # 원본 삭제
                safe_remove(filepath)

                # 순서대로 누적
                valid_paths.append(webp_path)

        except Exception as e:
            print(f"이미지 처리 오류: {filepath} - {e}")
            safe_remove(filepath)

    return valid_paths

def merge_images_into_scrollable(image_files, output_filepath):
    """
    이미지들을 가로로 병합하여 WebP로 저장.
    """
    if len(image_files) < MIN_IMAGE_COUNT:
        print(f"❌ 최소 {MIN_IMAGE_COUNT}개 필요하지만, {len(image_files)}개만 있음. 머지 취소.")
        return None

    loaded_images = []
    for path in image_files:
        if os.path.exists(path):
            loaded_images.append(Image.open(path).convert("RGBA"))

    if not loaded_images:
        return None

    total_width = sum(img.width for img in loaded_images)
    max_height = max(img.height for img in loaded_images)

    if total_width == 0 or max_height == 0:
        print("❌ 병합 실패: 이미지 크기가 유효하지 않음.")
        return None

    merged = Image.new("RGBA", (total_width, max_height), (0, 0, 0, 0))
    x_offset = 0
    for img in loaded_images:
        merged.paste(img, (x_offset, 0), mask=img)
        x_offset += img.width
        img.close()

    try:
        merged.save(output_filepath, "WEBP", quality=80, lossless=True)
        print(f"✅ 머지 완료: {output_filepath}")
        return output_filepath
    except Exception as e:
        print(f"❌ WebP 저장 오류: {e}")
        return None

def process_labels():
    """
    1) JSON에서 (manufacturer, label) 읽음
    2) label로 50장 크롤링
    3) (height<600) 스킵 + WebP 변환 (구글 다운로드 순서 유지)
    4) 첫 5장만 합쳐서 병합
    5) 사용자에게 열람시킨 후 'n' 누르면 삭제, 아니면 최종폴더에 저장
    """
    labels = extract_labels_from_json()
    if not labels:
        print("✅ 처리할 데이터가 없음.")
        return

    os.makedirs(WORKSPACE_FOLDER, exist_ok=True)
    os.makedirs(FINAL_SAVE_FOLDER, exist_ok=True)

    for json_file, manufacturer, label in labels:
        out_name = os.path.splitext(os.path.basename(json_file))[0] + ".webp"
        final_path = os.path.join(FINAL_SAVE_FOLDER, out_name)

        # 이미 처리된 파일이 있으면 스킵
        if os.path.exists(final_path):
            print(f"✅ 이미 처리됨: {final_path}")
            continue

        temp_dir = os.path.join(WORKSPACE_FOLDER, label)
        os.makedirs(temp_dir, exist_ok=True)

        # 1) 크롤링
        search_query = f"{manufacturer} {label}"
        print(f"\n[크롤링] {search_query} -> 최대 {CRAWL_MAX_NUM}장")
        google_image_search(search_query, temp_dir)

        # 2) 다운로드 순서대로 필터링 & WebP 변환
        valid_paths = process_downloaded_images_in_order(temp_dir)

        # 3) 앞에서 5장만 사용
        top5 = valid_paths[:5]
        if len(top5) < MIN_IMAGE_COUNT:
            print(f"🚫 유효 이미지가 5장 미만. 스킵: {label}")
            shutil.rmtree(temp_dir, ignore_errors=True)
            continue

        # 4) 병합
        merged_out = os.path.join(temp_dir, "merged.webp")
        merged_result = merge_images_into_scrollable(top5, merged_out)
        if not merged_result:
            print(f"🚫 머지 실패 또는 오류: {label}")
            shutil.rmtree(temp_dir, ignore_errors=True)
            continue

        # 5) 사용자 확인 후 최종 폴더에 저장 or 삭제
        try:
            merged_img = Image.open(merged_result)
            merged_img.show()  # 시스템 뷰어에서 열기
        except Exception as e:
            print(f"이미지 열기 오류: {e}")

        shutil.move(merged_result, final_path)
        print(f"🚀 최종 폴더에 저장: {final_path}")

        # 임시 폴더 삭제
        shutil.rmtree(temp_dir, ignore_errors=True)

    print("✅ 모든 JSON 처리 끝.")

if __name__ == '__main__':
    process_labels()
