# Source Tree Analysis

**Date:** 2026-01-12  
**Project:** bichcheongmo

## Project Structure

```
bichcheongmo/
├── index.html              # 메인 페이지 (홈)
├── about.html              # 단체 소개 페이지
├── activities.html          # 활동 공유 페이지
├── contact.html             # 문의하기 페이지
├── README.md                # 프로젝트 설명
├── LICENSE                  # MIT 라이선스
├── CNAME                    # GitHub Pages 커스텀 도메인 설정
├── favicon.ico              # 파비콘
│
├── assets/                  # 정적 에셋 디렉토리
│   ├── css/                 # 스타일시트
│   │   ├── 00_tokens.css           # 디자인 토큰 (CSS 변수)
│   │   ├── 00_tokens.dark.css      # 다크 모드 토큰
│   │   ├── 01_base.css             # 기본 스타일 (리셋, 타이포그래피)
│   │   ├── 02_layout.css           # 레이아웃 스타일
│   │   ├── 03_components.css       # 컴포넌트 스타일
│   │   ├── 04_modal.css            # 모달 스타일
│   │   ├── 05_fonts.css            # 폰트 정의
│   │   └── 05_toast.css            # 토스트 알림 스타일
│   │
│   ├── js/                  # JavaScript 모듈
│   │   ├── 00_dom.js               # DOM 유틸리티 함수
│   │   ├── 10_toast.js             # 토스트 알림 기능
│   │   ├── 20_modal.js             # 모달 기능
│   │   ├── 30_disclosure.js        # 접기/펼치기 기능
│   │   ├── 40_theme.js             # 테마 전환 기능
│   │   ├── 50_mobile_menu.js       # 모바일 메뉴 기능
│   │   └── 99_main.js              # 메인 초기화
│   │
│   ├── img/                 # 이미지 파일
│   │   └── logo.jpg                # 로고 이미지
│   │
│   └── font/                # 폰트 파일
│       └── 0xProtoNerdFontPropo-Regular.ttf
│
└── docs/                    # 문서 디렉토리 (생성됨)
    ├── project-scan-report.json
    ├── technology-stack.md
    ├── ui-component-inventory.md
    ├── deployment-configuration.md
    └── source-tree-analysis.md (이 파일)
```

## Critical Directories

### `/` (Root)
- **Purpose:** 프로젝트 루트, HTML 페이지 진입점
- **Key Files:**
  - `index.html` - 메인 진입점
  - `about.html`, `activities.html`, `contact.html` - 주요 페이지
  - `CNAME` - GitHub Pages 도메인 설정

### `/assets/css/`
- **Purpose:** 스타일시트 모듈
- **Architecture:** 토큰 기반 디자인 시스템
- **Loading Order:** 숫자 접두사로 로딩 순서 제어
  - `00_*` - 토큰 (가장 먼저 로드)
  - `01_*` - 기본 스타일
  - `02_*` - 레이아웃
  - `03_*` - 컴포넌트
  - `04_*`, `05_*` - 특수 컴포넌트

### `/assets/js/`
- **Purpose:** JavaScript 모듈
- **Architecture:** 기능별 모듈화
- **Loading Order:** 숫자 접두사로 로딩 순서 제어
  - `00_*` - 유틸리티 (가장 먼저 로드)
  - `10_*`, `20_*`, `30_*`, `40_*`, `50_*` - 기능 모듈
  - `99_*` - 메인 초기화 (가장 마지막 로드)

### `/assets/img/`
- **Purpose:** 이미지 에셋
- **Key Files:**
  - `logo.jpg` - 사이트 로고

### `/assets/font/`
- **Purpose:** 커스텀 폰트
- **Key Files:**
  - `0xProtoNerdFontPropo-Regular.ttf` - 커스텀 폰트

## Entry Points

### Primary Entry Point
- **`index.html`** - 메인 페이지, 사이트 진입점

### Secondary Entry Points
- **`about.html`** - 단체 소개 페이지
- **`activities.html`** - 활동 공유 페이지
- **`contact.html`** - 문의하기 페이지

## File Naming Conventions

### CSS Files
- 숫자 접두사로 로딩 순서 제어 (`00_`, `01_`, `02_`, ...)
- 설명적 이름 (`tokens`, `base`, `layout`, `components`)

### JavaScript Files
- 숫자 접두사로 로딩 순서 제어 (`00_`, `10_`, `20_`, ...)
- 기능별 이름 (`dom`, `toast`, `modal`, `theme`, `mobile_menu`)
- `99_main.js` - 메인 초기화 (항상 마지막)

### HTML Files
- 소문자, 하이픈 없음 (`index.html`, `about.html`)

## Integration Points

### CSS Integration
- 모든 HTML 파일에서 동일한 CSS 파일 세트 로드
- 순서 중요: 토큰 → 기본 → 레이아웃 → 컴포넌트

### JavaScript Integration
- 모든 HTML 파일에서 동일한 JavaScript 파일 세트 로드
- 순서 중요: 유틸리티 → 기능 모듈 → 메인 초기화

### Asset Integration
- 상대 경로로 에셋 참조 (`./assets/...`)
- 이미지: `./assets/img/logo.jpg`
- 폰트: CSS에서 `@font-face`로 로드

## Build & Distribution

**빌드 프로세스 없음**
- 소스 파일이 그대로 배포됨
- GitHub Pages에서 직접 서빙
- 빌드 도구나 번들러 불필요

## Excluded Directories

다음 디렉토리는 프로젝트 코드가 아님:
- `_bmad/` - BMAD 도구 디렉토리
- `_bmad-output/` - BMAD 출력 디렉토리
- `.git/` - Git 저장소 메타데이터


