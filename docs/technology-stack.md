# Technology Stack

**Date:** 2026-01-12  
**Project:** bichcheongmo

## Technology Summary

| Category | Technology | Version | Justification |
|---------|------------|---------|---------------|
| **Markup** | HTML5 | 5.0 | 표준 HTML5, 한국어 지원 (lang="ko") |
| **Styling** | CSS3 | 3.0 | CSS 변수 기반 디자인 시스템, 다크 모드 지원 |
| **Scripting** | Vanilla JavaScript | ES5/ES6 | 프레임워크 없는 순수 JavaScript |
| **Build Tool** | None | - | 정적 사이트, 빌드 도구 불필요 |
| **Package Manager** | None | - | 의존성 없음 |
| **Deployment** | GitHub Pages | - | CNAME 파일로 커스텀 도메인 설정 |

## Architecture Pattern

**Static Site Architecture**
- 클라이언트 사이드 렌더링 없음
- 서버 사이드 렌더링 없음
- 순수 정적 HTML/CSS/JS 파일 제공
- GitHub Pages를 통한 정적 호스팅

## Design System

**CSS Token-based Design System**
- CSS 변수를 통한 디자인 토큰 관리
- 라이트/다크 모드 지원
- 모듈화된 CSS 구조:
  - `00_tokens.css` - 디자인 토큰
  - `00_tokens.dark.css` - 다크 모드 토큰
  - `01_base.css` - 기본 스타일
  - `02_layout.css` - 레이아웃
  - `03_components.css` - 컴포넌트
  - `04_modal.css` - 모달
  - `05_fonts.css` - 폰트
  - `05_toast.css` - 토스트 알림

## JavaScript Architecture

**Modular Vanilla JS**
- 모듈화된 JavaScript 파일:
  - `00_dom.js` - DOM 유틸리티
  - `10_toast.js` - 토스트 알림
  - `20_modal.js` - 모달
  - `30_disclosure.js` - 접기/펼치기
  - `40_theme.js` - 테마 전환
  - `50_mobile_menu.js` - 모바일 메뉴
  - `99_main.js` - 메인 초기화

## Localization

- **Primary Language:** 한국어 (ko)
- **Character Encoding:** UTF-8

## Browser Support

- 모던 브라우저 (CSS 변수, ES6 지원)
- 반응형 디자인 (viewport meta tag)



