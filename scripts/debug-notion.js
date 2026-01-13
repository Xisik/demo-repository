#!/usr/bin/env node
/**
 * 노션 데이터베이스 디버깅 스크립트
 * 
 * 노션 데이터베이스에서 데이터를 가져오는 과정을 디버깅합니다.
 * 환경 변수가 설정되어 있어야 합니다.
 */

const NotionClient = require('./notion-client');

// 환경 변수 확인
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY) {
  console.error('❌ ERROR: NOTION_API_KEY environment variable is not set');
  console.error('   로컬에서 실행하려면:');
  console.error('   Windows: set NOTION_API_KEY=your_key && node scripts/debug-notion.js');
  console.error('   Mac/Linux: NOTION_API_KEY=your_key node scripts/debug-notion.js');
  process.exit(1);
}

if (!NOTION_DATABASE_ID) {
  console.error('❌ ERROR: NOTION_DATABASE_ID environment variable is not set');
  console.error('   로컬에서 실행하려면:');
  console.error('   Windows: set NOTION_DATABASE_ID=your_id && node scripts/debug-notion.js');
  console.error('   Mac/Linux: NOTION_DATABASE_ID=your_id node scripts/debug-notion.js');
  process.exit(1);
}

async function debugNotionDatabase() {
  try {
    console.log('🔍 노션 데이터베이스 디버깅 시작...\n');
    console.log(`📋 데이터베이스 ID: ${NOTION_DATABASE_ID.substring(0, 8)}...`);
    console.log(`🔑 API 키: ${NOTION_API_KEY.substring(0, 8)}...\n`);

    // 노션 클라이언트 생성
    const client = new NotionClient(NOTION_API_KEY);
    
    // 데이터베이스에서 모든 페이지 가져오기
    console.log('📥 데이터베이스에서 페이지 가져오는 중...');
    const pages = await client.queryDatabase(NOTION_DATABASE_ID);
    console.log(`✅ 총 ${pages.length}개의 페이지를 찾았습니다.\n`);

    if (pages.length === 0) {
      console.log('⚠️  데이터베이스에 페이지가 없습니다.');
      console.log('   다음을 확인해주세요:');
      console.log('   1. 노션 데이터베이스에 최소 하나의 페이지가 있는지 확인');
      console.log('   2. 노션 통합(Integration)이 데이터베이스에 연결되어 있는지 확인');
      console.log('   3. GitHub Secrets의 NOTION_DATABASE_ID가 올바른지 확인');
      return;
    }

    // 각 페이지의 속성 분석
    console.log('📊 페이지 속성 분석:\n');
    pages.forEach((page, index) => {
      console.log(`\n--- 페이지 ${index + 1} (ID: ${page.id.substring(0, 8)}...) ---`);
      
      if (!page.properties || Object.keys(page.properties).length === 0) {
        console.log('  ⚠️  속성이 없습니다.');
        return;
      }

      const propKeys = Object.keys(page.properties);
      console.log(`  📝 필드 개수: ${propKeys.length}`);
      console.log(`  📋 필드명 목록: ${propKeys.join(', ')}\n`);

      // 각 필드 상세 정보
      propKeys.forEach(key => {
        const prop = page.properties[key];
        console.log(`  🔹 "${key}":`);
        console.log(`     타입: ${prop.type || 'unknown'}`);
        
        // 값 출력
        if (prop.type === 'title' && prop.title) {
          const value = prop.title.map(t => t.plain_text).join('');
          console.log(`     값: "${value}"`);
          if (!value || value.trim() === '') {
            console.log(`     ⚠️  제목이 비어있습니다!`);
          }
        } else if (prop.type === 'date' && prop.date) {
          console.log(`     값: ${prop.date.start || 'null'}`);
          if (!prop.date.start) {
            console.log(`     ⚠️  날짜가 설정되지 않았습니다!`);
          }
        } else if (prop.type === 'rich_text' && prop.rich_text) {
          const value = prop.rich_text.map(t => t.plain_text).join('');
          console.log(`     값: "${value || '(비어있음)'}"`);
        } else if (prop.type === 'checkbox') {
          console.log(`     값: ${prop.checkbox ? '체크됨' : '체크 안됨'}`);
        } else if (prop.type === 'status' && prop.status) {
          console.log(`     값: "${prop.status.name}"`);
        } else if (prop.type === 'select' && prop.select) {
          console.log(`     값: "${prop.select.name}"`);
        } else if (prop.type === 'files' && prop.files) {
          console.log(`     파일 개수: ${prop.files.length}`);
        } else {
          console.log(`     값: (타입별 처리 필요)`);
        }
      });

      // 필수 필드 확인
      console.log(`\n  ✅ 필수 필드 확인:`);
      const titleProp = propKeys.find(key => {
        const lower = key.toLowerCase();
        return lower.includes('제목') || lower.includes('title') || lower.includes('이름') || lower.includes('name');
      });
      const dateProp = propKeys.find(key => {
        const lower = key.toLowerCase();
        return lower.includes('날짜') || lower.includes('date') || lower.includes('일자');
      });

      if (titleProp) {
        const titleValue = page.properties[titleProp];
        const titleText = extractTextValue(titleValue);
        if (titleText && titleText.trim()) {
          console.log(`    ✅ 제목 필드 발견: "${titleProp}" = "${titleText}"`);
        } else {
          console.log(`    ❌ 제목 필드 발견했지만 값이 비어있음: "${titleProp}"`);
        }
      } else {
        console.log(`    ❌ 제목 필드를 찾을 수 없습니다.`);
        console.log(`       다음 필드명을 사용하세요: "제목", "Title", "이름", "Name"`);
      }

      if (dateProp) {
        const dateValue = page.properties[dateProp];
        if (dateValue.type === 'date' && dateValue.date && dateValue.date.start) {
          console.log(`    ✅ 날짜 필드 발견: "${dateProp}" = ${dateValue.date.start}`);
        } else {
          console.log(`    ❌ 날짜 필드 발견했지만 값이 설정되지 않음: "${dateProp}"`);
        }
      } else {
        console.log(`    ❌ 날짜 필드를 찾을 수 없습니다.`);
        console.log(`       다음 필드명을 사용하세요: "날짜", "Date", "일자"`);
      }

      // 공개 여부 확인
      const publishedProp = propKeys.find(key => {
        const lower = key.toLowerCase();
        return lower.includes('공개') || lower.includes('published') || lower.includes('public');
      });
      if (publishedProp) {
        const pubValue = page.properties[publishedProp];
        if (pubValue.type === 'checkbox') {
          console.log(`    📌 공개 여부: "${publishedProp}" = ${pubValue.checkbox ? '공개' : '비공개'}`);
        } else if (pubValue.type === 'status') {
          console.log(`    📌 공개 여부: "${publishedProp}" = "${pubValue.status?.name || '없음'}"`);
        }
      } else {
        console.log(`    📌 공개 여부 필드 없음 (기본값: 공개)`);
      }
    });

    console.log('\n\n💡 문제 해결 팁:');
    console.log('   1. 필수 필드 확인: 모든 페이지에 "제목"과 "날짜" 필드가 있어야 합니다.');
    console.log('   2. 필드명 확인: 필드명은 대소문자와 공백을 무시하고 인식됩니다.');
    console.log('   3. 공개 여부: "공개 여부" 필드가 없으면 기본적으로 공개됩니다.');
    console.log('   4. GitHub Actions: 이 스크립트가 성공하면 GitHub Actions도 성공할 것입니다.\n');

  } catch (error) {
    console.error('\n❌ 오류 발생:');
    console.error(`   메시지: ${error.message}`);
    if (error.body) {
      console.error(`   상세: ${JSON.stringify(error.body, null, 2)}`);
    }
    console.error(`\n   가능한 원인:`);
    console.error(`   1. API 키가 잘못되었거나 만료되었습니다.`);
    console.error(`   2. 데이터베이스 ID가 잘못되었습니다.`);
    console.error(`   3. 노션 통합(Integration)이 데이터베이스에 접근 권한이 없습니다.`);
    console.error(`   4. 네트워크 연결 문제입니다.\n`);
    process.exit(1);
  }
}

function extractTextValue(property) {
  if (!property) return '';
  
  if (property.type === 'title' && Array.isArray(property.title)) {
    return property.title.map(item => item.plain_text || '').join('');
  }
  
  if (property.type === 'rich_text' && Array.isArray(property.rich_text)) {
    return property.rich_text.map(item => item.plain_text || '').join('');
  }
  
  return '';
}

// 실행
debugNotionDatabase();

