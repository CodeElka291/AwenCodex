# Awen Codex - 변경 이력

## [Unreleased] - refactor/story-delay-and-data-structure

### 추가
- 스토리 텍스트 라인별 개별 딜레이 제어 기능 (`lines` 배열 + `delay` 필드)
- `data/story/prologue/` 디렉토리: 프롤로그 스토리 데이터 분리
- `data/story/tutorial/` 디렉토리: 튜토리얼용 (향후)
- `data/story/chapter1/` 디렉토리: 챕터 1용 (향후)
- `data/config/` 디렉토리: 환경설정/시스템 데이터 분리 (maps, items, recipes, gathering)

### 변경
- **js/game.js**: `storyDelay()` 휴리스틱 함수 제거 → `DEFAULT_LINE_DELAY = 500ms` 상수로 단순화
- **js/game.js**: 데이터 로드 경로 새로운 폴더 구조 반영 (`data/config/`, `data/story/prologue/`)
- **data/story/prologue/prologue.json**: 기존 `text` 문자열 → `lines` 배열로 완전 변환 (44개 씬, 약 400개 라인)
  - 빈 줄(문단 구분)도 별도 엔트리로 분리
  - 특수 키워드("휙.", "턱.", "……" 등) 기존 딜레이 값 유지
  - 일반 대사 500ms 기본값 적용

### 삭제
- `data/prologue.json` (루트 레벨)
- `data/maps.json`, `data/items.json`, `data/recipes.json`, `data/gathering.json` (루트 레벨)

### 리팩토링 원칙
- **코드 퓨어화**: JS에서 텍스트 기반 휴리스틱 로직 제거, JSON에서만 딜레이 제어
- **데이터/로직 분리**: 스토리 콘텐츠(`story/`)와 시스템 데이터(`config/`) 물리적 분리
- **확장성**: 챕터/튜토리얼별 독립 파일 관리 가능 구조

---

## 향후 개발 방향 (SESSON_HANDOFF.md 기준)

### STEP 2: 반복 채집 시스템 (다음 작업)
- `gathering.json`에 노드 추가 (검은나무 수액 등)
- 채집 액션 UI 연동 확인

### STEP 3: 채집 콘텐츠 확장
- 장소별 채집 노드 추가
- 시간/환경 조건부 확률

### STEP 4: 상점/경제 시스템
- 약초상 실제 상점화 (구매/판매)

### STEP 5: 튜토리얼 완성 (v0.5 목표)
- 기록관 퀘스트: 표지판 수리 → 제조법 발견 → 재료 수집 → Resonance → 잉크 제작 → 표지판 복원
- JSON 퀘스트 시스템으로 구현 (Ink 미도입)

### STEP 6: Codex 시스템 (본편 핵심)
- 사라진 기록 복원/발견
- 관계 발견 시 Codex 반영
- 세계 상태 변화 연동

### v0.4: Ink/inkjs 도입 검토 시점
- 본편 NPC 대화, 책/기록, 복잡한 분기부터 적용
- 현재 JSON 퀘스트 시스템으로 튜토리얼까지 커버 가능 판단

---

## 현재 기술 스택
- **Engine**: Vanilla JS (ES Modules) - 약 270줄
- **Data**: JSON (정적 로드)
- **Story**: JSON `lines` 배열 (딜레이 명시)
- **Server**: Python `http.server` (로컬 테스트용)
- **Deploy**: GitHub Pages 호환 정적 사이트

## 실행 방법
```bash
cd /Users/kyuhwan/ProjectMo/AwenCodex
python3 -m http.server 8000
# http://localhost:8000 접속
```