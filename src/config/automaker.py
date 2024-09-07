import json
import os
import re

def to_snake_case(snake_str):
    """문자열을 스네이크 케이스로 변환하는 함수, 특수문자를 제거하고 공백과 '-'을 언더바로 변환"""
    # 특수문자 제거 (영문자, 숫자, 공백만 남김)
    snake_str = re.sub(r'[^a-zA-Z0-9\s]', '', snake_str).strip()
    # 여러 개의 공백을 하나로 통일
    snake_str = re.sub(r'\s+', ' ', snake_str)
    # 공백과 '-'을 언더바로 변환
    components = snake_str.lower().replace('-', ' ').split()
    return '_'.join(components)

colorways = 'usercolorways4'
# JSON 파일 경로
input_json = 'input.json'  # 여기에 JSON 파일 경로를 입력하세요
output_folder = f'./{colorways}'  # 저장할 폴더

# 폴더가 존재하지 않으면 생성
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# JSON 파일을 로드
with open(input_json, 'r', encoding='utf-8') as f:
    data = json.load(f)

# JS 파일을 생성하기 위한 문자열을 저장할 리스트
import_statements = []
usercolorways_new = []

# 배열로 처리
for sub_item in data:
    # label을 스네이크 케이스로 변환하여 파일명과 id 생성
    label_snake_case = to_snake_case(sub_item['label'])
    file_name = f"mkg_{label_snake_case}.json"

    # id 값을 파일명과 동일하게 수정
    sub_item['id'] = f"mkg_{label_snake_case}"
    sub_item['designer'] = 'KGJun'

    # 파일 저장 경로 설정
    file_path = os.path.join(output_folder, file_name)

    # 수정된 JSON 데이터를 파일로 저장
    with open(file_path, 'w', encoding='utf-8') as outfile:
        json.dump(sub_item, outfile, ensure_ascii=False, indent=4)

    # import 문과 USERCOLORWAYS_NEW 항목 생성
    variable_name = f"mkg_{label_snake_case}"
    import_statements.append(f'import {variable_name} from "./{colorways}/{file_name}";')
    usercolorways_new.append(f'    {variable_name}: {variable_name}')

import_block = "\n".join(import_statements)
usercolorways_block = ",\n".join(usercolorways_new)

# 최종적으로 생성할 JS 코드
js_code = "\n".join(import_statements) + "\n\n" + "export const USERCOLORWAYS_NEW = {\n" + ",\n".join(usercolorways_new) + "\n};"

# JS 파일 저장
output_js = 'output.js'  # 생성할 JS 파일 경로
with open(output_js, 'w', encoding='utf-8') as js_file:
    js_file.write(js_code)

print(f"JavaScript 파일이 생성되었습니다: {output_js}")
