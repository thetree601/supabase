/**
 * URL 경로 관리 시스템
 * 모든 URL 경로를 중앙에서 관리하고, 다이나믹 라우팅과 접근 제어를 지원합니다.
 */

// 접근 권한 타입 정의
export type AccessLevel = 'public' | 'member-only';

// URL 경로 타입 정의
export interface UrlPath {
  /** 실제 경로 문자열 */
  path: string;
  /** 접근 가능 상태 */
  accessLevel: AccessLevel;
  /** 다이나믹 라우팅 파라미터가 포함된 경로인지 여부 */
  isDynamic?: boolean;
}

// URL 경로 상수 정의
export const URL_PATHS = {
  // 인증 관련
  LOGIN: {
    path: '/auth/login',
    accessLevel: 'public' as AccessLevel,
    isDynamic: false,
  },
  SIGNUP: {
    path: '/auth/signup',
    accessLevel: 'public' as AccessLevel,
    isDynamic: false,
  },

  // 잡지 관련
  MAGAZINES: {
    path: '/magazines',
    accessLevel: 'public' as AccessLevel,
    isDynamic: false,
  },
  MAGAZINE_DETAIL: {
    path: '/magazines/[id]',
    accessLevel: 'member-only' as AccessLevel,
    isDynamic: true,
  },
  MAGAZINE_NEW: {
    path: '/magazines/new',
    accessLevel: 'member-only' as AccessLevel,
    isDynamic: false,
  },
  SUBSCRIBE: {
    path: '/subscribe',
    accessLevel: 'member-only' as AccessLevel,
    isDynamic: false,
  },
} as const;

// URL 헬퍼 함수들
export class UrlManager {
  /**
   * 다이나믹 라우팅 파라미터를 포함한 실제 URL을 생성합니다.
   * @param urlPath - URL 경로 객체
   * @param params - 다이나믹 라우팅 파라미터
   * @returns 실제 URL 문자열
   */
  static buildUrl(urlPath: UrlPath, params?: Record<string, string | number>): string {
    if (!urlPath.isDynamic || !params) {
      return urlPath.path;
    }

    let builtPath = urlPath.path;
    
    // 다이나믹 파라미터 치환
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = `[${key}]`;
      builtPath = builtPath.replace(placeholder, String(value));
    });

    return builtPath;
  }

  /**
   * 특정 ID로 잡지 상세 페이지 URL을 생성합니다.
   * @param id - 잡지 ID
   * @returns 잡지 상세 페이지 URL
   */
  static getMagazineDetailUrl(id: string | number): string {
    return this.buildUrl(URL_PATHS.MAGAZINE_DETAIL, { id });
  }

  /**
   * 접근 권한에 따른 URL 목록을 반환합니다.
   * @param accessLevel - 접근 권한 레벨
   * @returns 해당 권한의 URL 배열
   */
  static getUrlsByAccessLevel(accessLevel: AccessLevel): UrlPath[] {
    return Object.values(URL_PATHS).filter(url => url.accessLevel === accessLevel);
  }

  /**
   * 공개 접근 가능한 URL 목록을 반환합니다.
   * @returns 공개 URL 배열
   */
  static getPublicUrls(): UrlPath[] {
    return this.getUrlsByAccessLevel('public');
  }

  /**
   * 회원 전용 URL 목록을 반환합니다.
   * @returns 회원 전용 URL 배열
   */
  static getMemberOnlyUrls(): UrlPath[] {
    return this.getUrlsByAccessLevel('member-only');
  }

  /**
   * URL이 회원 전용인지 확인합니다.
   * @param path - 확인할 URL 경로
   * @returns 회원 전용 여부
   */
  static isMemberOnlyUrl(path: string): boolean {
    return Object.values(URL_PATHS).some(url => 
      url.accessLevel === 'member-only' && 
      (url.path === path || (url.isDynamic && this.matchesDynamicPath(url.path, path)))
    );
  }

  /**
   * 다이나믹 경로와 실제 경로가 매치되는지 확인합니다.
   * @param dynamicPath - 다이나믹 경로 패턴
   * @param actualPath - 실제 경로
   * @returns 매치 여부
   */
  private static matchesDynamicPath(dynamicPath: string, actualPath: string): boolean {
    const dynamicRegex = dynamicPath.replace(/\[([^\]]+)\]/g, '([^/]+)');
    const regex = new RegExp(`^${dynamicRegex}$`);
    return regex.test(actualPath);
  }
}

// 편의를 위한 개별 URL 상수들
export const LOGIN_URL = URL_PATHS.LOGIN.path;
export const SIGNUP_URL = URL_PATHS.SIGNUP.path;
export const MAGAZINES_URL = URL_PATHS.MAGAZINES.path;
export const MAGAZINE_NEW_URL = URL_PATHS.MAGAZINE_NEW.path;
export const SUBSCRIBE_URL = URL_PATHS.SUBSCRIBE.path;

// 다이나믹 URL 생성 함수들
export const getMagazineDetailUrl = UrlManager.getMagazineDetailUrl.bind(UrlManager);

// 기본 내보내기
export default URL_PATHS;
