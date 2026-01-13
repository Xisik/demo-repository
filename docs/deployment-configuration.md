# Deployment Configuration

**Date:** 2026-01-12  
**Project:** bichcheongmo

## Deployment Platform

**GitHub Pages**

- 정적 사이트 호스팅
- 커스텀 도메인: `www.bichcheongmo.org` (CNAME 파일 설정)

## Deployment Process

### Manual Deployment

1. GitHub 저장소에 코드 푸시
2. GitHub Pages 설정에서 브랜치 선택 (보통 `main` 또는 `gh-pages`)
3. 자동으로 사이트 배포

### Custom Domain Setup

- **CNAME 파일:** `www.bichcheongmo.org` 설정
- DNS 설정 필요 (GitHub Pages 가이드 참조)

## Build Process

**빌드 프로세스 없음**

- 정적 HTML/CSS/JS 파일 직접 배포
- 빌드 도구나 번들러 불필요
- 소스 파일이 그대로 서빙됨

## Environment Configuration

**환경 변수 없음**

- 정적 사이트이므로 환경 변수 불필요
- 모든 설정은 소스 코드에 직접 포함

## CI/CD

**CI/CD 파이프라인 없음**

- GitHub Pages 자동 배포 사용
- 추가 CI/CD 설정 불필요

## Deployment Checklist

- [x] CNAME 파일 설정 완료
- [x] GitHub Pages 활성화
- [ ] DNS 설정 확인 (필요시)
- [ ] HTTPS 인증서 확인 (GitHub Pages 자동)

## Rollback Strategy

GitHub에서 이전 커밋으로 되돌리기:

1. GitHub 저장소에서 이전 커밋 선택
2. 해당 커밋으로 되돌리기
3. GitHub Pages 자동 재배포

## Monitoring

- GitHub Pages 기본 모니터링
- 추가 모니터링 도구 없음


