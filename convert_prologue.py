import json
import re

def story_delay(text):
    """기존 휴리스틱 복제"""
    trimmed = text.strip()
    if not trimmed:
        return 260
    if trimmed in ("……", "...", "…"):
        return 900
    if trimmed in ("턱.", "턱"):
        return 1300
    if trimmed in ("휙.", "휙"):
        return 650
    if len(trimmed) <= 8:
        return 650
    return 520

def convert_text_to_lines(text):
    """text 문자열을 lines 배열로 변환"""
    lines = []
    # \n\n으로 문단 분리, \n으로 줄 분리
    paragraphs = text.split('\n\n')
    for pi, para in enumerate(paragraphs):
        para_lines = para.split('\n')
        for li, line in enumerate(para_lines):
            lines.append({"text": line, "delay": story_delay(line)})
        # 문단 사이에 빈 줄 추가 (마지막 문단 제외)
        if pi < len(paragraphs) - 1:
            lines.append({"text": "", "delay": 260})
    return lines

# 파일 읽기
with open('data/prologue.json', 'r', encoding='utf-8') as f:
    prologue = json.load(f)

# 변환
for scene_id, scene in prologue.items():
    if 'text' in scene and 'lines' not in scene:
        scene['lines'] = convert_text_to_lines(scene['text'])
        del scene['text']
        print(f"변환 완료: {scene_id} ({len(scene['lines'])} 줄)")

# 저장
with open('data/prologue.json', 'w', encoding='utf-8') as f:
    json.dump(prologue, f, ensure_ascii=False, indent=2)

print("전체 변환 완료!")
