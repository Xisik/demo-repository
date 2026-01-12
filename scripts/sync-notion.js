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
const NotionClient = require('./notion-client');
const { transformNotionPage } = require('./notion-transformer');

// 환경 변수 확인
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY) {
  console.error('ERROR: NOTION_API_KEY environment variable is not set');
  console.error('Please set NOTION_API_KEY in GitHub Secrets');
  process.exit(1);
}

if (!NOTION_DATABASE_ID) {
  console.error('ERROR: NOTION_DATABASE_ID environment variable is not set');
  console.error('Please set NOTION_DATABASE_ID in GitHub Secrets');
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
    
    // 노션 클라이언트 생성
    const client = new NotionClient(NOTION_API_KEY);
    
    // 데이터베이스에서 모든 페이지 가져오기
    console.log(`Querying database: ${NOTION_DATABASE_ID.substring(0, 8)}...`);
    const pages = await client.queryDatabase(NOTION_DATABASE_ID);
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
          console.log(`\nDEBUG: First page properties:`, Object.keys(page.properties || {}));
        }
        
        // 페이지 블록 가져오기 (본문 콘텐츠)
        console.log(`Fetching blocks for page: ${page.id.substring(0, 8)}...`);
        const blocks = await client.getPageBlocks(page.id);
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
    
    // 폴백: 기존 데이터 파일이 있으면 사용
    const dataPath = path.join(__dirname, '..', 'data', 'activities.json');
    if (fs.existsSync(dataPath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        console.log(`WARNING: Using existing data file with ${existingData.length || 0} activities as fallback`);
        return existingData;
      } catch (fallbackError) {
        console.error('ERROR: Failed to read fallback data file:', fallbackError.message);
      }
    }
    
    // 데이터가 없으면 빈 배열 반환
    console.log('WARNING: Returning empty array due to errors');
    return [];
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
    console.log(`NOTION_DATABASE_ID: ${NOTION_DATABASE_ID.substring(0, 8)}...`);
    
    // 노션에서 데이터 가져오기
    const activities = await fetchNotionData();
    
    // JSON 파일로 저장
    saveActivitiesData(activities);
    
    console.log('Notion sync completed successfully');
  } catch (error) {
    console.error('ERROR: Notion sync failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { fetchNotionData, saveActivitiesData };

