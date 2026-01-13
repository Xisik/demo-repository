# 문제 해결 가이드

## 활동이 표시되지 않는 경우

### 1. GitHub Actions 확인

먼저 GitHub Actions가 실행되었는지 확인하세요:

1. GitHub 저장소로 이동
2. "Actions" 탭 클릭
3. "Sync Notion Activities" 워크플로우 확인
4. 최근 실행 기록 확인
5. 실패한 경우 로그 확인

**워크플로우가 실행되지 않는 경우:**
- 수동으로 실행: Actions 탭에서 "Run workflow" 버튼 클릭
- 스케줄 확인: 5분마다 자동 실행되도록 설정되어 있음

### 2. 노션 필드 확인

활동이 표시되려면 다음 필수 필드가 있어야 합니다:

#### 필수 필드

1. **제목 필드** (다음 중 하나)
   - "제목"
   - "Title"
   - "이름"
   - "Name"
   - 타입: **Title** (노션의 기본 제목 필드)

2. **날짜 필드** (다음 중 하나)
   - "날짜"
   - "Date"
   - "일자"
   - 타입: **Date**

#### 선택적 필드

- **요약**: "요약", "Summary", "설명", "Description"
- **본문**: "본문", "Body", "내용", "Content" (또는 페이지 블록 콘텐츠)
- **공개 여부**: "공개 여부", "Published", "Public" (체크박스 또는 Status)
  - 없으면 기본값: **공개**
- **슬러그**: "슬러그", "Slug" (없으면 자동 생성)
- **카테고리**: "카테고리", "Category"
- **이미지**: "이미지", "Image"

### 3. 로컬 디버깅

로컬에서 문제를 진단하려면:

```bash
# Windows PowerShell
$env:NOTION_API_KEY="your_api_key"
$env:NOTION_DATABASE_ID="your_database_id"
node scripts/debug-notion.js

# Windows CMD
set NOTION_API_KEY=your_api_key
set NOTION_DATABASE_ID=your_database_id
node scripts/debug-notion.js

# Mac/Linux
NOTION_API_KEY=your_api_key NOTION_DATABASE_ID=your_database_id node scripts/debug-notion.js
```

이 스크립트는 다음을 확인합니다:
- 데이터베이스에서 페이지를 가져올 수 있는지
- 각 페이지의 필드명과 값
- 필수 필드가 있는지
- 공개 여부 설정

### 4. 일반적인 문제

#### 문제: "데이터베이스에서 페이지를 찾을 수 없습니다"

**해결 방법:**
1. 노션 데이터베이스에 최소 하나의 페이지가 있는지 확인
2. 노션 통합(Integration)이 데이터베이스에 연결되어 있는지 확인
   - 노션 데이터베이스 → "연결" → 통합 선택
3. GitHub Secrets의 `NOTION_DATABASE_ID`가 올바른지 확인
   - 데이터베이스 URL에서 ID 추출: `https://www.notion.so/.../{database_id}?v=...`

#### 문제: "활동이 건너뛰어졌습니다: 필수 필드 누락"

**해결 방법:**
1. 노션 페이지에 "제목" 필드가 있는지 확인 (Title 타입)
2. "날짜" 필드가 올바르게 설정되어 있는지 확인 (Date 타입)
3. 필드명이 정확한지 확인 (대소문자와 공백은 무시됨)

#### 문제: "활동이 표시되지 않음" (필드는 모두 있음)

**해결 방법:**
1. "공개 여부" 필드 확인
   - 체크박스: 체크되어 있어야 공개
   - Status: "공개", "Published", "Public"이어야 공개
   - 필드가 없으면 기본적으로 공개
2. `data/activities.json` 파일 확인
   - 빈 배열 `[]`이면 데이터가 없음
   - GitHub Actions 로그 확인

#### 문제: "API request failed: 400 Bad Request"

**해결 방법:**
1. API 키가 올바른지 확인
2. 데이터베이스 ID가 올바른지 확인
3. 노션 통합이 데이터베이스에 접근 권한이 있는지 확인

### 5. 데이터 확인

`data/activities.json` 파일을 확인하여 데이터가 올바르게 저장되었는지 확인:

```json
{
  "metadata": {
    "lastSyncedAt": "2026-01-15T10:30:00.000Z",
    "syncStatus": "success",
    "errorMessage": null,
    "activityCount": 1
  },
  "activities": [
    {
      "title": "활동 제목",
      "date": "2026-01-15T00:00:00.000Z",
      "summary": "활동 요약",
      "body": "활동 본문",
      "slug": "activity-slug",
      "published": true,
      ...
    }
  ]
}
```

### 6. 추가 도움말

더 자세한 내용은 다음 문서를 참조하세요:
- [노션 연동 설정 가이드](./notion-setup.md)
- [노션 활동 템플릿 가이드](./notion-template-guide.md)

