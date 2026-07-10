import { describe, expect, it } from 'vitest';

import { extractGatingUncheckedItems } from '../../src/core/done.js';

describe('extractGatingUncheckedItems', () => {
  it('gates only unchecked items inside the acceptance-criteria section (feature template)', () => {
    const spec = [
      '# [feature] login',
      '',
      '## 2. 기능 명세',
      '',
      '### 수용 기준 (Acceptance Criteria)',
      '',
      '- [ ] AC1: 로그인 성공',
      '- [x] AC2: 실패 처리',
      '',
      '### 기능 상세 설명',
      '',
      '- [ ] 완료 섹션 밖이라 무시된다',
      '',
      '## 10. 미결 사항 (Open Questions)',
      '',
      '- [ ] 열린 질문',
      '',
    ].join('\n');

    expect(extractGatingUncheckedItems(spec)).toEqual(['AC1: 로그인 성공']);
  });

  it('returns empty when every completion-section box is checked', () => {
    const spec = ['## 완료 조건', '', '- [x] 핵심 동작 구현', '- [x] 테스트 통과', ''].join('\n');

    expect(extractGatingUncheckedItems(spec)).toEqual([]);
  });

  it('does not gate when there is no completion section (fix template)', () => {
    const spec = [
      '# [fix] bug',
      '',
      '### 발견 경위',
      '',
      '- [ ] 사용자 제보',
      '- [ ] 모니터링 알림',
      '',
      '### 발생 빈도',
      '',
      '- [ ] 항상 재현됨',
      '- [ ] 간헐적 재현',
      '',
      '## 9. 재발 방지 대책',
      '',
      '- [ ] 테스트 케이스 추가',
      '',
    ].join('\n');

    expect(extractGatingUncheckedItems(spec)).toEqual([]);
  });

  it('recognizes the "완료 조건" heading and stops at a sibling-level heading', () => {
    const spec = [
      '## 완료 조건',
      '',
      '- [ ] 핵심 동작이 구현된다',
      '- [ ] 관련 테스트가 통과한다',
      '',
      '## 참고 자료',
      '',
      '- [ ] 다른 섹션이라 무시',
      '',
    ].join('\n');

    expect(extractGatingUncheckedItems(spec)).toEqual([
      '핵심 동작이 구현된다',
      '관련 테스트가 통과한다',
    ]);
  });

  it('includes lower-level subheadings within the completion section', () => {
    const spec = [
      '## 완료 조건',
      '',
      '### 필수',
      '',
      '- [ ] 필수 항목',
      '',
      '### 선택',
      '',
      '- [x] 선택 항목',
      '',
      '## 다음 섹션',
      '',
      '- [ ] 무시됨',
      '',
    ].join('\n');

    expect(extractGatingUncheckedItems(spec)).toEqual(['필수 항목']);
  });

  it('aggregates unchecked items across multiple completion sections', () => {
    const spec = [
      '## 수용 기준',
      '',
      '- [ ] A',
      '',
      '## 중간 섹션',
      '',
      '- [ ] 무시',
      '',
      '## 완료 조건',
      '',
      '- [ ] B',
      '',
    ].join('\n');

    expect(extractGatingUncheckedItems(spec)).toEqual(['A', 'B']);
  });
});
