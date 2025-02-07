import os
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from googlesearch import search
import concurrent.futures

# 제공된 키캡 브랜드와 판단할 토큰 목록 (소문자 비교)
known_brands = [
    ("GMK", ["gmk"]),
    ("Domikey", ["domikey"]),
    ("ePBT", ["enjoypbt", "epbt"]),
    ("PBTFans", ["pbtfans"]),
    ("TUT", ["tut"]),
    ("JTK", ["jtk"]),
    ("MAXKEY", ["maxkey"]),
    ("DCS", ["dcs"])
]

# 차단할 사이트 접두사 리스트 (예: ebay. 로 시작하는 사이트 전부)
blocked_prefixes = ["ebay."]

# URL의 호스트네임이 blocked_prefixes에 해당하면 True 반환
def is_blocked(url, blocked_list):
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        for prefix in blocked_list:
            if domain.startswith(prefix):
                return True
    except Exception:
        return False
    return False

# 문자열(text) 내에 미리 정의된 토큰이 있으면 해당 브랜드 반환
def check_brand_in_text(text):
    text_lower = text.lower()
    for brand, tokens in known_brands:
        for token in tokens:
            if token in text_lower:
                return brand
    return ""

# label을 기반으로 영어 검색어 "[label] keycap brand -site:.kr -site:ebay.*" 로 구글 검색
# blocked_prefixes에 해당하는 사이트는 제외한 후, 각 브랜드 토큰 등장 횟수를 집계해 가장 많이 나온 브랜드 반환 (0이면 "")
def google_search_determine_brand(label):
    query = f"{label} keycap brand -site:.kr"
    for prefix in blocked_prefixes:
        query += f" -site:{prefix}"
    print(f"Google 검색 쿼리: {query}")

    counts = {brand: 0 for brand, _ in known_brands}

    try:
        urls = list(search(query, num_results=15))
    except Exception as e:
        print("Google 검색 실패:", e)
        return ""

    # blocked_prefixes에 해당하는 URL은 필터링
    filtered_urls = [url for url in urls if not is_blocked(url, blocked_prefixes)]

    # 각 URL을 쓰레드 풀로 동시 처리
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(fetch_counts, url): url for url in filtered_urls}
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            for brand, count in result.items():
                counts[brand] += count

    print("Google 검색 브랜드 카운트:", counts)
    best_brand = max(counts, key=counts.get)
    if counts[best_brand] > 0:
        return best_brand
    else:
        return ""

# 단일 URL에 대해 페이지 내용을 가져와 각 브랜드 토큰 등장 횟수를 집계
def fetch_counts(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        resp = requests.get(url, headers=headers, timeout=2)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            page_text = soup.get_text().lower()
            result = {}
            for brand, tokens in known_brands:
                cnt = 0
                for token in tokens:
                    cnt += page_text.count(token)
                result[brand] = cnt
            return result
    except Exception as e:
        print(f"URL 접속 실패: {url} / {e}")
    return {}

# JSON 파일의 label, 파일명에서 순차적으로 브랜드를 찾아 반환. 없으면 구글 검색 결과 사용.
def determine_brand(file_path, data):
    label = data.get("label", "")
    filename = os.path.splitext(os.path.basename(file_path))[0]

    # 1. JSON label에서 브랜드 찾기
    if label:
        brand = check_brand_in_text(label)
        if brand:
            print(f"파일 {file_path}: label에서 {brand} 발견")
            return brand

    # 2. 파일명에서 브랜드 찾기
    if filename:
        brand = check_brand_in_text(filename)
        if brand:
            print(f"파일 {file_path}: 파일명에서 {brand} 발견")
            return brand

    # 3. label이 있으면 구글 검색 실행
    if label:
        brand = google_search_determine_brand(label)
        if brand:
            print(f"파일 {file_path}: 구글 검색 결과 {brand} 선택")
        return brand

    # 4. 모두 실패하면 빈 문자열 반환
    return ""

# 단일 JSON 파일 처리: 읽고, 브랜드 결정 후 업데이트
def process_file(fpath):
    try:
        with open(fpath, "r", encoding="utf-8") as f:
            data = json.load(f)
        brand = determine_brand(fpath, data)
        data["manufacturer"] = brand
        with open(fpath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"업데이트 완료: {fpath} → manufacturer: '{brand}'")
    except Exception as e:
        print(f"업데이트 실패 ({fpath}):", e)

# usercolorways1 ~ usercolorways7 폴더 내의 모든 JSON 파일을 순차(혹은 쓰레드)적으로 처리
def update_json_files(base_path):
    file_paths = []
    for i in range(1, 8):
        folder = os.path.join(base_path, f"usercolorways{i}")
        if not os.path.isdir(folder):
            continue
        for fname in os.listdir(folder):
            if fname.endswith(".json"):
                file_paths.append(os.path.join(folder, fname))

    # 여기서는 쓰레드 풀로 동시에 처리해도 되고, 순차 처리해도 됨.
    # 동시 요청 부담이 걱정되면 아래 executor.map 대신 for문으로 순차 처리.
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        executor.map(process_file, file_paths)

def main():
    base_path = "./"
    update_json_files(base_path)
    print("모든 파일 업데이트 완료.")

if __name__ == "__main__":
    main()
