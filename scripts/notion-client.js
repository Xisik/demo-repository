/**
 * 노션 API 클라이언트
 * 
 * Story 2.2: 노션 데이터 가져오기 및 변환
 * 
 * 노션 API v1을 사용하여 데이터베이스에서 데이터를 가져옵니다.
 */

const BASE_URL = "https://api.notion.com/v1";

class NotionClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.notionVersion = "2022-06-28";
  }

  /**
   * HTTP 요청 실행
   * @param {string} path - API 경로 (예: /databases/{id}/query)
   * @param {Object} [options] - 요청 옵션
   * @param {string} [options.method] - HTTP 메서드 (기본값: "GET")
   * @param {Object} [options.body] - 요청 본문 데이터
   * @returns {Promise<Object>} 응답 데이터
   */
  async request(path, { method = "GET", body } = {}) {
    const url = `${BASE_URL}${path}`;

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Notion-Version": this.notionVersion,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }

    if (!res.ok) {
      // Notion이 주는 에러 그대로 보기 좋게 던짐
      const msg = json?.message || `${res.status} ${res.statusText}`;
      const err = new Error(`API request failed: ${res.status} ${res.statusText}`);
      err.body = json;
      err.message = msg;
      throw err;
    }

    return json;
  }

  /**
   * 데이터베이스에서 모든 페이지 가져오기 (pagination 처리)
   * POST /v1/databases/{database_id}/query
   * 
   * @param {string} databaseId - 데이터베이스 ID (하이픈 포함 또는 제거된 형식 모두 가능)
   * @returns {Promise<Array>} 페이지 배열
   */
  async queryDatabase(databaseId) {
    // Database ID에서 하이픈 제거 (Notion API URL 요구사항)
    const formattedId = databaseId.replace(/-/g, '');
    
    const allPages = [];
    let cursor = undefined;

    while (true) {
      const body = { page_size: 100 };
      if (cursor) {
        body.start_cursor = cursor;
      }

      const data = await this.request(`/databases/${formattedId}/query`, {
        method: "POST",
        body,
      });

      allPages.push(...(data.results || []));
      if (!data.has_more) break;
      cursor = data.next_cursor;
    }

    return allPages;
  }

  /**
   * 페이지의 블록 콘텐츠 가져오기
   * GET /v1/blocks/{block_id}/children
   * 
   * @param {string} blockId - 블록/페이지 ID (하이픈 포함 또는 제거된 형식 모두 가능)
   * @returns {Promise<Array>} 블록 배열
   */
  async getPageBlocks(blockId) {
    // Block ID에서 하이픈 제거 (Notion API URL 요구사항)
    const formattedId = blockId.replace(/-/g, '');
    
    const blocks = [];
    let cursor = undefined;

    while (true) {
      const qs = new URLSearchParams();
      qs.set("page_size", "100");
      if (cursor) qs.set("start_cursor", cursor);

      const data = await this.request(`/blocks/${formattedId}/children?${qs.toString()}`, {
        method: "GET",
      });

      blocks.push(...(data.results || []));
      if (!data.has_more) break;
      cursor = data.next_cursor;
    }

    return blocks;
  }
}

module.exports = NotionClient;
