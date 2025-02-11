import json
import os
import numpy as np
import re
from sklearn.cluster import KMeans

# HEX 색상을 RGB로 변환하는 함수
def hex_to_rgb(hex_code):
    hex_code = hex_code.lstrip("#")
    if not re.fullmatch(r'^[0-9a-fA-F]{6}$', hex_code):
        return None
    return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))

# JSON에서 키캡 색상 추출
def extract_colors(json_data):
    colors = []
    if "swatches" in json_data:
        id_val = json_data["id"]
        for key in ["base", "mods", "accent"]:
            if key in json_data["swatches"] and "background" in json_data["swatches"][key]:
                rgb = hex_to_rgb(json_data["swatches"][key]["background"])
                if rgb:
                    colors.append((id_val, rgb))
    return colors

# 디렉토리 내 JSON 파일에서 색상 정보 추출
def load_json_files(directory):
    color_data = []
    for filename in os.listdir(directory):
        if filename.endswith(".json"):
            with open(os.path.join(directory, filename), "r", encoding="utf-8") as file:
                data = json.load(file)
                color_data.extend(extract_colors(data))
    return color_data

# K-means 클러스터링 적용
def cluster_colors(color_data, num_clusters=5):
    if not color_data:
        return {}

    ids, rgb_values = zip(*color_data)
    rgb_values = np.array(rgb_values)

    kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(rgb_values)

    clusters = {}
    for idx, label in enumerate(labels):
        clusters.setdefault(int(label), []).append(ids[idx])

    return clusters

# JSON 저장 함수
def save_cluster_json(clusters, output_file):
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(clusters, file, indent=4, ensure_ascii=False)

# 메인 실행 코드
directory = "../src/config/organized/GMK"  # JSON 파일이 있는 폴더 경로
output_file = "../public/color_clusters.json"
color_data = load_json_files(directory)

# 클러스터링 수행
color_clusters = cluster_colors(color_data, num_clusters=5)

# JSON 파일로 저장
save_cluster_json(color_clusters, output_file)
