(function () {
  'use strict';

  const ui = window.__ui || {};
  
  /**
   * 활동 목록 렌더링 모듈
   * 
   * Story 1.2: 활동 목록 페이지 구현
   * Epic 1: 활동 콘텐츠 표시 및 탐색
   */

  /**
   * 날짜를 한국어 형식으로 포맷팅
   * @param {Date} date - 포맷팅할 날짜
   * @returns {string} 포맷팅된 날짜 문자열 (예: "2026년 1월 12일")
   */
  function formatDateKorean(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-based이므로 +1
    const day = date.getDate();

    return `${year}년 ${month}월 ${day}일`;
  }

  /**
   * 활동 카드 HTML 생성
   * @param {Object} activity - 활동 데이터
   * @returns {string} 활동 카드 HTML
   */
  function createActivityCard(activity) {
    if (!activity) {
      return '';
    }

    const { title, date, summary, slug } = activity;
    const formattedDate = formatDateKorean(date);
    
    // 상세 페이지 링크 (Story 1.4에서 구현 예정, 현재는 #으로)
    const detailUrl = `./activities.html?activity=${encodeURIComponent(slug)}`;

    return `
      <article class="card activity-card" data-activity-slug="${slug}">
        <header class="activity-header">
          <h3 class="activity-title">
            <a href="${detailUrl}" class="activity-link">${escapeHtml(title)}</a>
          </h3>
          <time class="activity-date" datetime="${date.toISOString()}">
            ${formattedDate}
          </time>
        </header>
        <div class="activity-summary">
          <p>${escapeHtml(summary)}</p>
        </div>
      </article>
    `;
  }

  /**
   * HTML 이스케이프 (XSS 방지)
   * @param {string} text - 이스케이프할 텍스트
   * @returns {string} 이스케이프된 텍스트
   */
  function escapeHtml(text) {
    if (typeof text !== 'string') {
      return String(text);
    }

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 빈 상태 메시지 HTML 생성
   * @returns {string} 빈 상태 메시지 HTML
   */
  function createEmptyState() {
    return `
      <div class="card content">
        <p>아직 등록된 활동이 없습니다.</p>
        <p class="small">곧 새로운 활동을 공유할 예정입니다.</p>
      </div>
    `;
  }

  /**
   * 로딩 상태 메시지 HTML 생성
   * @returns {string} 로딩 상태 메시지 HTML
   */
  function createLoadingState() {
    return `
      <div class="card content">
        <p>활동 목록을 불러오는 중...</p>
      </div>
    `;
  }

  /**
   * 에러 상태 메시지 HTML 생성
   * @param {string} message - 에러 메시지
   * @param {Date} [lastUpdated] - 마지막 업데이트 시각
   * @returns {string} 에러 상태 메시지 HTML
   */
  function createErrorState(message, lastUpdated) {
    let lastUpdatedText = '';
    if (lastUpdated) {
      const formattedDate = formatDateKorean(lastUpdated);
      lastUpdatedText = `<p class="small">마지막 업데이트: ${formattedDate}</p>`;
    }

    return `
      <div class="card content">
        <p>활동 목록을 불러오는 중 오류가 발생했습니다.</p>
        ${message ? `<p class="small">${escapeHtml(message)}</p>` : ''}
        ${lastUpdatedText}
        <p class="small">잠시 후 다시 시도해주세요.</p>
      </div>
    `;
  }

  /**
   * 활동 목록을 DOM에 렌더링
   * @param {Array<Object>} activities - 활동 데이터 배열
   * @param {HTMLElement|string} container - 렌더링할 컨테이너 요소 또는 선택자
   * @returns {boolean} 렌더링 성공 여부
   */
  function renderActivityList(activities, container) {
    const $ = ui.$ || ((sel) => document.querySelector(sel));
    const containerEl = typeof container === 'string' ? $(container) : container;

    if (!containerEl) {
      console.error('활동 목록 컨테이너를 찾을 수 없습니다.');
      return false;
    }

    // 기존 내용 제거
    containerEl.innerHTML = '';

    // 활동이 없는 경우
    if (!Array.isArray(activities) || activities.length === 0) {
      containerEl.innerHTML = createEmptyState();
      return true;
    }

    // 활동 목록 렌더링
    const activitiesHtml = activities
      .map(activity => createActivityCard(activity))
      .join('');

    containerEl.innerHTML = activitiesHtml;

    return true;
  }

  /**
   * 로딩 상태 표시
   * @param {HTMLElement|string} container - 컨테이너 요소 또는 선택자
   */
  function showLoadingState(container) {
    const $ = ui.$ || ((sel) => document.querySelector(sel));
    const containerEl = typeof container === 'string' ? $(container) : container;

    if (containerEl) {
      containerEl.innerHTML = createLoadingState();
    }
  }

  /**
   * 에러 상태 표시
   * @param {HTMLElement|string} container - 컨테이너 요소 또는 선택자
   * @param {string} message - 에러 메시지
   * @param {Date} [lastUpdated] - 마지막 업데이트 시각
   */
  function showErrorState(container, message, lastUpdated) {
    const $ = ui.$ || ((sel) => document.querySelector(sel));
    const containerEl = typeof container === 'string' ? $(container) : container;

    if (containerEl) {
      containerEl.innerHTML = createErrorState(message, lastUpdated);
    }
  }

  /**
   * 빈 상태 표시
   * @param {HTMLElement|string} container - 컨테이너 요소 또는 선택자
   */
  function showEmptyState(container) {
    const $ = ui.$ || ((sel) => document.querySelector(sel));
    const containerEl = typeof container === 'string' ? $(container) : container;

    if (containerEl) {
      containerEl.innerHTML = createEmptyState();
    }
  }

  // Public API
  ui.activities = ui.activities || {};
  ui.activities.list = {
    renderActivityList: renderActivityList,
    showLoadingState: showLoadingState,
    showErrorState: showErrorState,
    showEmptyState: showEmptyState,
    formatDateKorean: formatDateKorean,
    createActivityCard: createActivityCard,
    escapeHtml: escapeHtml
  };

  // Export for testing (if needed)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui.activities.list;
  }
})();


