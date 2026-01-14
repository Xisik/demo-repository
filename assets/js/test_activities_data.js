/**
 * 활동 데이터 파싱 로직 테스트
 * 브라우저 콘솔에서 실행하여 테스트할 수 있습니다.
 */

(function () {
  'use strict';

  const ui = window.__ui;
  if (!ui || !ui.activities || !ui.activities.data) {
    console.error('활동 데이터 모듈이 로드되지 않았습니다.');
    return;
  }

  const { parseActivityData, parseActivities, sortActivitiesByDate, findActivityBySlug } = ui.activities.data;

  // 테스트 케이스 1: 완전한 데이터
  console.log('=== 테스트 1: 완전한 활동 데이터 ===');
  const testData1 = {
    title: '2026년 1월 정기 모임',
    date: '2026-01-15',
    summary: '월간 정기 모임을 진행했습니다.',
    body: '이번 모임에서는...',
    slug: '2026-01-regular-meeting',
    published: true,
    image: 'https://example.com/image.jpg',
    category: '모임'
  };
  const result1 = parseActivityData(testData1);
  console.log('결과:', result1);
  console.log('유효성:', result1.isValid);

  // 테스트 케이스 2: 필수 필드 누락
  console.log('\n=== 테스트 2: 필수 필드 누락 ===');
  const testData2 = {
    summary: '요약만 있음'
  };
  const result2 = parseActivityData(testData2);
  console.log('결과:', result2);
  console.log('에러:', result2.errors);

  // 테스트 케이스 3: 선택적 필드만 있는 경우
  console.log('\n=== 테스트 3: 선택적 필드 포함 ===');
  const testData3 = {
    title: '활동 제목',
    date: new Date('2026-01-20'),
    summary: '요약',
    body: '본문',
    slug: 'activity-slug',
    published: true,
    image: 'https://example.com/cover.jpg',
    attachments: ['https://example.com/file1.pdf', 'https://example.com/file2.pdf'],
    category: '교육',
    metadata: { author: '운영자' }
  };
  const result3 = parseActivityData(testData3);
  console.log('결과:', result3);
  console.log('데이터:', result3.data);

  // 테스트 케이스 4: 여러 활동 일괄 파싱
  console.log('\n=== 테스트 4: 여러 활동 일괄 파싱 ===');
  const testDataArray = [
    {
      title: '활동 1',
      date: '2026-01-10',
      summary: '요약 1',
      body: '본문 1',
      slug: 'activity-1',
      published: true
    },
    {
      title: '활동 2',
      date: '2026-01-15',
      summary: '요약 2',
      body: '본문 2',
      slug: 'activity-2',
      published: false // 비공개
    },
    {
      title: '활동 3',
      date: '2026-01-20',
      summary: '요약 3',
      body: '본문 3',
      slug: 'activity-3',
      published: true
    }
  ];
  const parsed = parseActivities(testDataArray);
  console.log('파싱된 활동 수:', parsed.length); // 공개된 활동만 (2개)
  console.log('활동 목록:', parsed);

  // 테스트 케이스 5: 날짜순 정렬
  console.log('\n=== 테스트 5: 날짜순 정렬 ===');
  const sorted = sortActivitiesByDate(parsed);
  console.log('정렬된 활동:', sorted.map(a => ({ title: a.title, date: a.date })));

  // 테스트 케이스 6: 슬러그로 찾기
  console.log('\n=== 테스트 6: 슬러그로 찾기 ===');
  const found = findActivityBySlug(parsed, 'activity-1');
  console.log('찾은 활동:', found);

  console.log('\n=== 모든 테스트 완료 ===');
})();



