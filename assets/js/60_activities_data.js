(function () {
  'use strict';

  const ui = window.__ui || {};
  
  /**
   * 활동 데이터 구조 정의 및 파싱 유틸리티
   * 
   * Story 1.1: 활동 데이터 구조 정의 및 기본 파싱
   * Epic 1: 활동 콘텐츠 표시 및 탐색
   */

  /**
   * 활동 데이터의 필수 필드
   * @typedef {Object} ActivityRequiredFields
   * @property {string} title - 활동 제목
   * @property {string|Date} date - 활동 날짜
   * @property {string} summary - 활동 요약
   * @property {string} body - 활동 본문
   * @property {string} slug - 활동 슬러그 또는 ID (고유 식별자)
   * @property {boolean} published - 공개 여부
   */

  /**
   * 활동 데이터의 선택적 필드
   * @typedef {Object} ActivityOptionalFields
   * @property {string} [image] - 활동 이미지 URL
   * @property {Array<string>} [attachments] - 첨부 자료 URL 배열
   * @property {string} [category] - 활동 카테고리
   * @property {Object} [metadata] - 추가 메타데이터
   */

  /**
   * 완전한 활동 데이터 구조
   * @typedef {ActivityRequiredFields & ActivityOptionalFields} ActivityData
   */

  /**
   * 활동 데이터 파싱 결과
   * @typedef {Object} ParseResult
   * @property {ActivityData|null} data - 파싱된 활동 데이터 (성공 시)
   * @property {Array<string>} errors - 에러 메시지 배열
   * @property {Array<string>} warnings - 경고 메시지 배열
   * @property {boolean} isValid - 데이터 유효성 여부
   */

  /**
   * 날짜를 표준 형식으로 변환
   * @param {string|Date|number} dateInput - 날짜 입력값
   * @returns {Date|null} 변환된 Date 객체 또는 null
   */
  function parseDate(dateInput) {
    if (!dateInput) return null;
    
    // 이미 Date 객체인 경우
    if (dateInput instanceof Date) {
      return isNaN(dateInput.getTime()) ? null : dateInput;
    }
    
    // 숫자 타임스탬프인 경우
    if (typeof dateInput === 'number') {
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // 문자열인 경우
    if (typeof dateInput === 'string') {
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  }

  /**
   * 슬러그 생성 (제목에서)
   * @param {string} title - 활동 제목
   * @returns {string} 생성된 슬러그
   */
  function generateSlug(title) {
    if (!title) return '';
    
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // 특수문자 제거
      .replace(/[\s_-]+/g, '-') // 공백, 언더스코어, 하이픈을 하이픈으로 통일
      .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
  }

  /**
   * 활동 데이터 파싱 및 검증
   * @param {Object} rawData - 노션에서 가져온 원시 데이터
   * @returns {ParseResult} 파싱 결과
   */
  function parseActivityData(rawData) {
    const result = {
      data: null,
      errors: [],
      warnings: [],
      isValid: false
    };

    if (!rawData || typeof rawData !== 'object') {
      result.errors.push('활동 데이터가 유효한 객체가 아닙니다.');
      return result;
    }

    // 필수 필드 검증 및 추출
    const title = rawData.title || rawData.name || '';
    const dateInput = rawData.date || rawData.created_time || rawData.last_edited_time;
    const summary = rawData.summary || rawData.description || '';
    const body = rawData.body || rawData.content || '';
    const slug = rawData.slug || rawData.id || generateSlug(title);
    const published = rawData.published !== undefined 
      ? Boolean(rawData.published) 
      : (rawData.public !== undefined ? Boolean(rawData.public) : true); // 기본값: 공개

    // 필수 필드 검증
    if (!title || title.trim() === '') {
      result.errors.push('활동 제목이 필수입니다.');
    }

    const parsedDate = parseDate(dateInput);
    if (!parsedDate) {
      result.errors.push('활동 날짜가 유효하지 않습니다.');
    }

    if (!summary || summary.trim() === '') {
      result.warnings.push('활동 요약이 없습니다. 기본값을 사용합니다.');
    }

    if (!body || body.trim() === '') {
      result.warnings.push('활동 본문이 없습니다.');
    }

    if (!slug || slug.trim() === '') {
      result.errors.push('활동 슬러그 또는 ID가 필수입니다.');
    }

    // 에러가 있으면 파싱 중단
    if (result.errors.length > 0) {
      return result;
    }

    // 선택적 필드 추출
    const image = rawData.image || rawData.cover || null;
    const attachments = Array.isArray(rawData.attachments) 
      ? rawData.attachments 
      : (rawData.attachments ? [rawData.attachments] : []);
    const category = rawData.category || rawData.type || null;
    const metadata = rawData.metadata || {};

    // 파싱된 데이터 구성
    result.data = {
      // 필수 필드
      title: title.trim(),
      date: parsedDate,
      summary: summary.trim() || title.trim(), // 요약이 없으면 제목 사용
      body: body.trim() || summary.trim() || title.trim(), // 본문이 없으면 요약 또는 제목 사용
      slug: slug.trim(),
      published: published,
      
      // 선택적 필드
      image: image,
      attachments: attachments,
      category: category,
      metadata: {
        ...metadata,
        createdAt: rawData.created_time || parsedDate,
        updatedAt: rawData.last_edited_time || parsedDate
      }
    };

    result.isValid = true;
    return result;
  }

  /**
   * 여러 활동 데이터를 일괄 파싱
   * @param {Array<Object>} rawDataArray - 원시 데이터 배열
   * @returns {Array<ActivityData>} 파싱된 활동 데이터 배열 (공개된 활동만)
   */
  function parseActivities(rawDataArray) {
    if (!Array.isArray(rawDataArray)) {
      console.error('활동 데이터가 배열이 아닙니다.');
      return [];
    }

    const parsedActivities = [];
    const errors = [];

    rawDataArray.forEach((rawData, index) => {
      const result = parseActivityData(rawData);
      
      if (result.isValid && result.data) {
        // 공개된 활동만 포함
        if (result.data.published) {
          parsedActivities.push(result.data);
        }
      } else {
        errors.push(`활동 ${index + 1} 파싱 실패: ${result.errors.join(', ')}`);
      }

      // 경고 로깅
      if (result.warnings.length > 0) {
        console.warn(`활동 ${index + 1} 경고:`, result.warnings);
      }
    });

    // 에러 로깅
    if (errors.length > 0) {
      console.error('활동 파싱 에러:', errors);
    }

    return parsedActivities;
  }

  /**
   * 활동 데이터를 날짜순으로 정렬 (최신 우선)
   * @param {Array<ActivityData>} activities - 활동 데이터 배열
   * @returns {Array<ActivityData>} 정렬된 활동 데이터 배열
   */
  function sortActivitiesByDate(activities) {
    if (!Array.isArray(activities)) {
      return [];
    }

    return [...activities].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : 0;
      const dateB = b.date instanceof Date ? b.date.getTime() : 0;
      return dateB - dateA; // 최신 우선 (내림차순)
    });
  }

  /**
   * 슬러그로 활동 찾기
   * @param {Array<ActivityData>} activities - 활동 데이터 배열
   * @param {string} slug - 찾을 슬러그
   * @returns {ActivityData|null} 찾은 활동 데이터 또는 null
   */
  function findActivityBySlug(activities, slug) {
    if (!Array.isArray(activities) || !slug) {
      return null;
    }

    return activities.find(activity => activity.slug === slug) || null;
  }

  // Public API
  ui.activities = ui.activities || {};
  ui.activities.data = {
    parseActivityData: parseActivityData,
    parseActivities: parseActivities,
    sortActivitiesByDate: sortActivitiesByDate,
    findActivityBySlug: findActivityBySlug,
    generateSlug: generateSlug,
    parseDate: parseDate
  };

  // Export for testing (if needed)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui.activities.data;
  }
})();


