import os
import re
import json

# organized 폴더 경로 (현재 디렉토리 기준)
ORGANIZED_DIR = './organized'

# organized 폴더 내의 제조사 폴더 리스트 (디렉토리인 경우만)
manufacturers = [
    d for d in os.listdir(ORGANIZED_DIR)
    if os.path.isdir(os.path.join(ORGANIZED_DIR, d))
]

for manufacturer in manufacturers:
    manufacturer_path = os.path.join(ORGANIZED_DIR, manufacturer)
    # 해당 제조사 폴더 내의 모든 .json 파일 (index.js 제외)
    json_files = [
        f for f in os.listdir(manufacturer_path)
        if f.endswith('.json')
    ]

    imports = []         # 각 파일의 import 문 모음
    export_entries = []  # export 객체 내부 항목 모음

    for json_file in json_files:
        old_json_path = os.path.join(manufacturer_path, json_file)
        try:
            with open(old_json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"파일 로드 실패 {old_json_path}: {e}")
            continue

        # JSON 내 manufacturer와 label 값 읽기 (양쪽 공백 제거)
        manufacturer_val = data.get("manufacturer", "").strip()
        label = data.get("label", "").strip()

        # manufacturer가 비어있으면 ETC로 설정
        if not manufacturer_val:
            manufacturer_val = "ETC"
            data["manufacturer"] = manufacturer_val
            print(f"파일 {old_json_path}의 manufacturer가 비어있어서 ETC로 설정.")

        # JSON 내 id 필드 처리: 괄호 제거하고 하이픈 → 언더바
        if "id" in data:
            data["id"] = re.sub(r'[()]', '', data["id"])
            data["id"] = data["id"].replace("-", "_")

        # label에서도 괄호 제거 및 하이픈 → 언더바
        label = re.sub(r'[()]', '', label)
        label = label.replace("-", "_")

        # 만약 label이 manufacturer_val로 시작하면 그 부분 제거 (앞부분의 공백, 언더바, 하이픈 제거)
        if label.lower().startswith(manufacturer_val.lower()):
            label_modified = label[len(manufacturer_val):].lstrip(" _-")
        else:
            label_modified = label

        # 새 id 생성: manufacturer_val와 수정된 label 연결 (label_modified 없으면 manufacturer_val만)
        new_id = f"{manufacturer_val}_{label_modified}" if label_modified else manufacturer_val
        # 소문자 변환, 공백은 언더바, 하이픈도 언더바로 치환
        new_id = new_id.lower().replace(" ", "_").replace("-", "_")
        # 연속된 언더바를 단일 언더바로 치환
        new_id = re.sub(r'_+', '_', new_id)
        data["id"] = new_id
        data["label"] = label_modified

        # JSON 파일 업데이트: 내용 저장
        try:
            with open(old_json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
        except Exception as e:
            print(f"파일 쓰기 실패 {old_json_path}: {e}")

        # 새 파일명: new_id.json
        new_file_name = new_id + ".json"
        new_json_path = os.path.join(manufacturer_path, new_file_name)
        if os.path.basename(old_json_path) != new_file_name:
            try:
                os.rename(old_json_path, new_json_path)
                print(f"파일명 변경: {old_json_path} -> {new_json_path}")
                json_file = new_file_name  # 업데이트된 파일명 사용
            except Exception as e:
                print(f"파일명 변경 실패 {old_json_path} -> {new_json_path}: {e}")
                json_file = os.path.basename(old_json_path)
        else:
            json_file = os.path.basename(old_json_path)

        # 변수명(파일명에서 확장자 제거한 값) 처리: 소문자, 공백→언더바, 하이픈→언더바, 괄호 제거
        var_name = os.path.splitext(json_file)[0]
        var_name = var_name.lower().replace(" ", "_").replace("-", "_")
        var_name = re.sub(r'[()]', '', var_name)
        # 연속된 언더바 축소
        var_name = re.sub(r'_+', '_', var_name)

        # import 문 생성 (예: import mkg_gmk_godspeed from "./mkg_gmk_godspeed.json";)
        import_line = f"import {var_name} from './{json_file}';"
        imports.append(import_line)
        # export 객체 항목 생성 (예: mkg_gmk_godspeed: mkg_gmk_godspeed)
        export_entries.append(f"  {var_name}: {var_name}")

    # 제조사 폴더 이름을 이용해 객체명 생성 (예: "GMK" → "KC_GMK")
    object_name = f"KC_{manufacturer.upper()}"
    export_statement = f"export const {object_name} = {{\n" + ",\n".join(export_entries) + "\n};"

    content = "\n".join(imports) + "\n\n" + export_statement + "\n"

    # 각 제조사 폴더 내에 index.js 파일 생성
    index_path = os.path.join(manufacturer_path, "index.js")
    try:
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"생성 완료: {index_path}")
    except Exception as e:
        print(f"index.js 생성 실패 {index_path}: {e}")

# 최종 통합 index.js 생성 (organized 폴더 내)
top_imports = []   # 각 제조사 index.js를 import하는 문장들
top_exports = []   # 통합 객체에 spread 하는 제조사 객체들

for manufacturer in manufacturers:
    object_name = f"KC_{manufacturer.upper()}"
    top_imports.append(f"import {{ {object_name} }} from './{manufacturer}/index.js';")
    top_exports.append(f"...{object_name}")

top_content = "\n".join(top_imports) + "\n\n"
top_content += "export const Keycaps = {\n  " + ",\n  ".join(top_exports) + "\n};\n\n"
top_content += "export default Keycaps;\n"

top_index_path = os.path.join(ORGANIZED_DIR, "index.js")
try:
    with open(top_index_path, "w", encoding="utf-8") as f:
        f.write(top_content)
    print(f"최종 통합 index.js 생성 완료: {top_index_path}")
except Exception as e:
    print(f"최종 index.js 생성 실패 {top_index_path}: {e}")
