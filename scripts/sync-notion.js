#!/usr/bin/env node
/**
 * 노션 데이터 동기화 스크립트
 * 
 * Story 2.1: 노션 데이터 소스 연결 및 인증 설정
 * Story 2.2: 노션 데이터 가져오기 및 변환
 * 
 * GitHub Actions에서 실행되어 노션 데이터를 가져와 JSON 파일로 저장합니다.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('@notionhq/client');
const { transformNotionPage } = require('./notion-transformer');

// 환경 변수 확인 및 검증
const NOTION_API_KEY = process.env.NOTION_API_KEY?.trim();
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID?.trim();

// API 키 검증
if (!NOTION_API_KEY) {
  console.error('ERROR: NOTION_API_KEY environment variable is missing or empty');
  console.error('Please set NOTION_API_KEY in GitHub Secrets');
  process.exit(1);
}

if (!NOTION_API_KEY.startsWith('secret_')) {
  console.warn('WARNING: NOTION_API_KEY should start with "secret_"');
}

// 데이터베이스 ID 검증
if (!NOTION_DATABASE_ID) {
  console.error('ERROR: NOTION_DATABASE_ID environment variable is missing or empty');
  console.error('Please set NOTION_DATABASE_ID in GitHub Secrets');
  process.exit(1);
}

// URL이 들어왔는지 체크
if (NOTION_DATABASE_ID.startsWith('http')) {
  console.error('ERROR: NOTION_DATABASE_ID must be a database ID, not a URL');
  console.error('Please extract the ID from the URL (32-character hex string)');
  console.error('Example URL: https://www.notion.so/workspace/0123456789abcdef0123456789abcdef?v=...');
  console.error('Extract ID: 0123456789abcdef0123456789abcdef');
  process.exit(1);
}

// 하이픈 제거 후 길이 확인 (32자리 hex)
const cleanDatabaseId = NOTION_DATABASE_ID.replace(/-/g, '');
if (cleanDatabaseId.length !== 32) {
  console.error(`ERROR: NOTION_DATABASE_ID must be 32 characters (got ${cleanDatabaseId.length})`);
  console.error(`Current value length: ${NOTION_DATABASE_ID.length} (with hyphens: ${NOTION_DATABASE_ID})`);
  console.error('Please check your NOTION_DATABASE_ID in GitHub Secrets');
  process.exit(1);
}

// 디버깅 정보 (민감한 정보는 출력하지 않음)
console.log(`DB_ID length: ${NOTION_DATABASE_ID.length}`);
console.log(`DB_ID includes dots: ${NOTION_DATABASE_ID.includes('...')}`);
console.log(`DB_ID (first 8 chars): ${NOTION_DATABASE_ID.substring(0, 8)}...`);
console.log(`NOTION_API_KEY length: ${NOTION_API_KEY.length}`);
console.log(`NOTION_API_KEY (first 10 chars): ${NOTION_API_KEY.substring(0, 10)}...`);

// ... 포함 여부 체크
if (NOTION_DATABASE_ID.includes('...')) {
  console.error('ERROR: NOTION_DATABASE_ID contains "..." - this is likely a masked/truncated value');
  console.error('Please use the FULL database ID (32 or 36 characters) in GitHub Secrets');
  process.exit(1);
}

/**
 * 노션 API를 사용하여 데이터베이스에서 활동 데이터 가져오기
 * 
 * Story 2.2: 노션 데이터 가져오기 및 변환
 * 
 * @returns {Promise<Array>} 활동 데이터 배열
 */
async function fetchNotionData() {
  try {
    console.log('Connecting to Notion API...');
    
    // Notion SDK 클라이언트 생성
    const notion = new Client({ auth: NOTION_API_KEY });
    
    // 데이터베이스에서 모든 페이지 가져오기
    // 하이픈 제거한 ID 사용 (Notion API는 하이픈 있음/없음 모두 허용하지만 일관성 유지)
    // 중요: 실제 변수는 전체 ID를 사용하고, 로그에서만 마스킹
    const cleanDatabaseId = NOTION_DATABASE_ID.replace(/-/g, '');
    
    // 디버깅: DB_ID 검증 로그
    console.log('DB_ID length:', cleanDatabaseId.length);
    console.log('DB_ID ends:', cleanDatabaseId.slice(-6));
    console.log('DB_ID has dots:', cleanDatabaseId.includes('...'));
    
    if (cleanDatabaseId.length !== 32) {
      throw new Error(`Invalid database ID length: expected 32, got ${cleanDatabaseId.length}`);
    }
    
    console.log(`Querying database: ${cleanDatabaseId.substring(0, 8)}...`);
    
    // Notion SDK를 사용한 안전한 호출
    const allPages = [];
    let hasMore = true;
    let startCursor = null;
    
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: cleanDatabaseId,
        start_cursor: startCursor || undefined,
      });
      
      allPages.push(...response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }
    
    const pages = allPages;
    console.log(`Found ${pages.length} pages in database`);
    
    if (pages.length === 0) {
      console.log('WARNING: No pages found in database. Please check:');
      console.log('  1. Notion Integration is connected to the database');
      console.log('  2. Database has at least one page');
      console.log('  3. Database ID is correct');
    }
    
    // 각 페이지를 활동 데이터로 변환
    const activities = [];
    
    for (const page of pages) {
      try {
        // 페이지 속성 디버깅 (첫 번째 페이지만)
        if (pages.indexOf(page) === 0 && pages.length > 0) {
          console.log(`\n=== DEBUG: First page properties ===`);
          const propKeys = Object.keys(page.properties || {});
          console.log(`Property names (${propKeys.length}):`, propKeys);
          console.log(`Property details:`);
          propKeys.forEach(key => {
            const prop = page.properties[key];
            console.log(`  - "${key}": type=${prop.type || 'unknown'}`);
            if (prop.type === 'title' && prop.title) {
              console.log(`    value: "${prop.title.map(t => t.plain_text).join('')}"`);
            } else if (prop.type === 'date' && prop.date) {
              console.log(`    value: ${prop.date.start || 'null'}`);
            } else if (prop.type === 'rich_text' && prop.rich_text) {
              console.log(`    value: "${prop.rich_text.map(t => t.plain_text).join('')}"`);
            } else if (prop.type === 'status' && prop.status) {
              console.log(`    value: "${prop.status.name}"`);
            } else if (prop.type === 'select' && prop.select) {
              console.log(`    value: "${prop.select.name}"`);
            }
          });
          console.log(`=====================================\n`);
        }
        
        // 페이지 블록 가져오기 (본문 콘텐츠)
        console.log(`Fetching blocks for page: ${page.id.substring(0, 8)}...`);
        const allBlocks = [];
        let hasMoreBlocks = true;
        let blockCursor = null;
        
        while (hasMoreBlocks) {
          const blockResponse = await notion.blocks.children.list({
            block_id: page.id,
            start_cursor: blockCursor || undefined,
          });
          
          allBlocks.push(...blockResponse.results);
          hasMoreBlocks = blockResponse.has_more;
          blockCursor = blockResponse.next_cursor;
        }
        
        const blocks = allBlocks;
        console.log(`  Found ${blocks.length} blocks`);
        
        // 페이지를 활동 데이터로 변환
        const activity = transformNotionPage(page, blocks);
        
        if (activity) {
          activities.push(activity);
          console.log(`✓ Transformed: ${activity.title}`);
        } else {
          console.log(`✗ Skipped page ${page.id.substring(0, 8)}: missing required fields`);
          // 디버깅: 속성 정보 출력
          if (page.properties) {
            console.log(`  Available properties: ${Object.keys(page.properties).join(', ')}`);
          }
        }
      } catch (error) {
        console.error(`ERROR: Failed to process page ${page.id.substring(0, 8)}:`, error.message);
        console.error(`  Stack: ${error.stack}`);
        // 개별 페이지 오류는 건너뛰고 계속 진행
      }
    }
    
    console.log(`Successfully transformed ${activities.length} activities`);
    return activities;
    
  } catch (error) {
    console.error('ERROR: Failed to fetch Notion data:', error.message);
    if (error.body) {
      console.error('Error body:', JSON.stringify(error.body, null, 2));
    }
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    // 에러 발생 시 재throw하여 main에서 process.exit(1) 처리
    throw error;
  }
}

/**
 * 활동 데이터를 JSON 파일로 저장
 * @param {Array} activities - 활동 데이터 배열
 */
function saveActivitiesData(activities) {
  const dataDir = path.join(__dirname, '..', 'data');
  const dataPath = path.join(dataDir, 'activities.json');
  
  // data 디렉토리가 없으면 생성
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // JSON 파일로 저장
  fs.writeFileSync(
    dataPath,
    JSON.stringify(activities, null, 2),
    'utf8'
  );
  
  console.log(`SUCCESS: Saved ${activities.length} activities to ${dataPath}`);
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log('Starting Notion sync...');
    
    // 노션에서 데이터 가져오기
    const activities = await fetchNotionData();
    
    // 데이터가 없으면 실패 처리 (빈 파일 커밋 방지)
    if (!activities || activities.length === 0) {
      console.error('ERROR: No activities found. Sync failed.');
      console.error('This prevents committing an empty file.');
      process.exit(1);
    }
    
    // JSON 파일로 저장
    saveActivitiesData(activities);
    
    console.log('Notion sync completed successfully');
  } catch (error) {
    console.error('ERROR: Notion sync failed:', error.message);
    if (error.body) {
      console.error('Error body:', JSON.stringify(error.body, null, 2));
    }
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    // 실패 시 process.exit(1)로 워크플로우 실패 처리 (빈 파일 커밋 방지)
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { fetchNotionData, saveActivitiesData };

