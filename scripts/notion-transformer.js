/**
 * 노션 데이터 변환기
 * 
 * Story 2.2: 노션 데이터 가져오기 및 변환
 * 
 * 노션 API 응답을 표준 활동 데이터 형식으로 변환합니다.
 */

/**
 * 노션 속성에서 텍스트 추출
 * @param {Object} property - 노션 속성 객체
 * @returns {string} 추출된 텍스트
 */
function extractText(property) {
  if (!property) return '';

  // Title 속성
  if (property.type === 'title' && Array.isArray(property.title)) {
    return property.title.map(item => item.plain_text || '').join('');
  }

  // Rich text 속성
  if (property.type === 'rich_text' && Array.isArray(property.rich_text)) {
    return property.rich_text.map(item => item.plain_text || '').join('');
  }

  // Text 속성 (구버전 호환)
  if (property.type === 'text' && Array.isArray(property.text)) {
    return property.text.map(item => item.plain_text || '').join('');
  }

  return '';
}

/**
 * 노션 속성에서 날짜 추출
 * @param {Object} property - 노션 속성 객체
 * @returns {Date|null} 추출된 날짜
 */
function extractDate(property) {
  if (!property || property.type !== 'date') return null;

  const dateValue = property.date;
  if (!dateValue || !dateValue.start) return null;

  try {
    return new Date(dateValue.start);
  } catch (error) {
    return null;
  }
}

/**
 * 노션 속성에서 체크박스 값 추출
 * @param {Object} property - 노션 속성 객체
 * @returns {boolean} 체크박스 값
 */
function extractCheckbox(property) {
  if (!property || property.type !== 'checkbox') return false;
  return property.checkbox === true;
}

/**
 * 노션 속성에서 선택 값 추출
 * @param {Object} property - 노션 속성 객체
 * @returns {string|null} 선택된 값
 */
function extractSelect(property) {
  if (!property || property.type !== 'select') return null;
  return property.select ? property.select.name : null;
}

/**
 * 노션 속성에서 파일 URL 추출
 * @param {Object} property - 노션 속성 객체
 * @returns {string|null} 파일 URL
 */
function extractFileUrl(property) {
  if (!property || property.type !== 'files') return null;
  
  const files = property.files;
  if (!Array.isArray(files) || files.length === 0) return null;

  const firstFile = files[0];
  if (firstFile.type === 'file' && firstFile.file) {
    return firstFile.file.url;
  }
  if (firstFile.type === 'external' && firstFile.external) {
    return firstFile.external.url;
  }

  return null;
}

/**
 * 노션 블록을 마크다운으로 변환
 * @param {Array} blocks - 노션 블록 배열
 * @returns {string} 마크다운 텍스트
 */
function blocksToMarkdown(blocks) {
  if (!Array.isArray(blocks)) return '';

  return blocks.map(block => {
    const type = block.type;

    // Paragraph
    if (type === 'paragraph') {
      const text = extractRichText(block.paragraph.rich_text);
      return text ? `${text}\n\n` : '';
    }

    // Heading 1
    if (type === 'heading_1') {
      const text = extractRichText(block.heading_1.rich_text);
      return text ? `# ${text}\n\n` : '';
    }

    // Heading 2
    if (type === 'heading_2') {
      const text = extractRichText(block.heading_2.rich_text);
      return text ? `## ${text}\n\n` : '';
    }

    // Heading 3
    if (type === 'heading_3') {
      const text = extractRichText(block.heading_3.rich_text);
      return text ? `### ${text}\n\n` : '';
    }

    // Bulleted list item
    if (type === 'bulleted_list_item') {
      const text = extractRichText(block.bulleted_list_item.rich_text);
      return text ? `- ${text}\n` : '';
    }

    // Numbered list item
    if (type === 'numbered_list_item') {
      const text = extractRichText(block.numbered_list_item.rich_text);
      return text ? `1. ${text}\n` : '';
    }

    // Code
    if (type === 'code') {
      const text = extractRichText(block.code.rich_text);
      const language = block.code.language || '';
      return text ? `\`\`\`${language}\n${text}\n\`\`\`\n\n` : '';
    }

    // Quote
    if (type === 'quote') {
      const text = extractRichText(block.quote.rich_text);
      return text ? `> ${text}\n\n` : '';
    }

    // Divider
    if (type === 'divider') {
      return '---\n\n';
    }

    return '';
  }).join('');
}

/**
 * Rich text 배열에서 텍스트 추출
 * @param {Array} richText - Rich text 배열
 * @returns {string} 추출된 텍스트
 */
function extractRichText(richText) {
  if (!Array.isArray(richText)) return '';

  return richText.map(item => {
    let text = item.plain_text || '';

    // 굵게
    if (item.annotations && item.annotations.bold) {
      text = `**${text}**`;
    }

    // 기울임
    if (item.annotations && item.annotations.italic) {
      text = `*${text}*`;
    }

    // 링크
    if (item.href) {
      text = `[${text}](${item.href})`;
    }

    return text;
  }).join('');
}

/**
 * 노션 페이지를 활동 데이터로 변환
 * @param {Object} page - 노션 페이지 객체
 * @param {Array} blocks - 페이지 블록 배열 (선택적)
 * @returns {Object|null} 변환된 활동 데이터 또는 null
 */
/**
 * 속성 이름으로 속성 찾기 (대소문자, 공백 무시)
 * @param {Object} properties - 속성 객체
 * @param {Array<string>} possibleNames - 가능한 이름 배열
 * @returns {Object|null} 찾은 속성 또는 null
 */
function findProperty(properties, possibleNames) {
  if (!properties) return null;
  
  // 정확한 이름으로 먼저 찾기
  for (const name of possibleNames) {
    if (properties[name]) {
      return properties[name];
    }
  }
  
  // 대소문자 무시, 공백 무시로 찾기
  const propertyKeys = Object.keys(properties);
  for (const name of possibleNames) {
    const normalizedName = name.toLowerCase().replace(/\s+/g, '');
    for (const key of propertyKeys) {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
      if (normalizedName === normalizedKey) {
        return properties[key];
      }
    }
  }
  
  return null;
}

function transformNotionPage(page, blocks = []) {
  if (!page || !page.properties) return null;

  const properties = page.properties;

  // 필수 필드 추출 (더 유연한 매칭)
  const titleProperty = findProperty(properties, ['제목', 'Title', 'title', '이름', 'Name', 'name']);
  const title = extractText(titleProperty);
  
  const dateProperty = findProperty(properties, ['날짜', 'Date', 'date', '일자', '날짜/시간']);
  const date = extractDate(dateProperty);
  
  const summaryProperty = findProperty(properties, ['요약', 'Summary', 'summary', '설명', 'Description', 'description']);
  const summary = extractText(summaryProperty);
  
  // 본문은 블록에서 가져오거나 본문 필드에서 가져오기
  const bodyProperty = findProperty(properties, ['본문', 'Body', 'body', '내용', 'Content', 'content']);
  let body = extractText(bodyProperty);
  if (!body && blocks.length > 0) {
    body = blocksToMarkdown(blocks);
  }

  // 슬러그 또는 ID
  const slugProperty = findProperty(properties, ['슬러그', 'Slug', 'slug', 'URL', 'url']);
  const slug = extractText(slugProperty) || page.id.replace(/-/g, '').substring(0, 20);

  // 공개 여부 (기본값: true)
  // Checkbox 또는 Status 타입 모두 지원
  // "공개여부" (공백 없음)도 지원
  const publishedProperty = findProperty(properties, [
    '공개여부', '공개 여부',  // 공백 있음/없음 모두 지원
    'Published', 'published', 
    'Public', 'public'
  ]);
  let published = true;
  if (publishedProperty) {
    if (publishedProperty.type === 'checkbox') {
      published = publishedProperty.checkbox !== false;
    } else if (publishedProperty.type === 'status') {
      // Status가 "공개" 또는 "Published"면 true, "비공개"면 false
      const statusName = publishedProperty.status?.name || '';
      const publicValues = ['공개', 'Published', 'published', 'Public', 'public'];
      const privateValues = ['비공개', 'Private', 'private', 'Unpublished', 'unpublished'];
      
      if (publicValues.includes(statusName)) {
        published = true;
      } else if (privateValues.includes(statusName)) {
        published = false;
      } else {
        // 알 수 없는 값이면 기본값 true
        console.warn(`Unknown status value for published: "${statusName}", defaulting to true`);
        published = true;
      }
    } else {
      published = true; // 기본값
    }
  }

  // 선택적 필드
  const categoryProperty = findProperty(properties, ['카테고리', 'Category', 'category', '분류', '분류']);
  const category = extractSelect(categoryProperty);
  
  const imageProperty = findProperty(properties, [
    '이미지', 'Image', 'image', 
    '파일과 미디어', 'Files', 'files',
    '파일', 'File', 'file',
    '미디어', 'Media', 'media'
  ]);
  const image = extractFileUrl(imageProperty);

  // 필수 필드 검증
  if (!title || !date) {
    console.warn(`\n⚠️ Skipping page ${page.id.substring(0, 8)}: missing required fields`);
    console.warn(`  - Title: ${title || 'MISSING'} (property found: ${titleProperty ? 'YES' : 'NO'})`);
    console.warn(`  - Date: ${date ? date.toISOString() : 'MISSING'} (property found: ${dateProperty ? 'YES' : 'NO'})`);
    console.warn(`  - Available properties: ${Object.keys(properties).join(', ')}`);
    console.warn(`  - Property details:`);
    Object.keys(properties).forEach(key => {
      const prop = properties[key];
      console.warn(`    - "${key}": type=${prop.type || 'unknown'}`);
    });
    console.warn(``);
    return null;
  }

  return {
    title: title.trim(),
    date: date.toISOString(),
    summary: summary.trim() || title.trim(),
    body: body.trim() || summary.trim() || title.trim(),
    slug: slug.trim(),
    published: published,
    category: category,
    image: image,
    // 메타데이터
    id: page.id,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time
  };
}

module.exports = {
  transformNotionPage,
  extractText,
  extractDate,
  extractCheckbox,
  extractSelect,
  extractFileUrl,
  blocksToMarkdown,
  extractRichText
};

