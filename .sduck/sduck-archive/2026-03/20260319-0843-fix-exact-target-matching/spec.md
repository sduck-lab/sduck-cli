# [fix] exact target matching

> **작업 타입:** `fix` (Quick Fix)
> **심각도:** `medium`
> **작성자:** Claude
> **작성일:** 2026-03-19
> **연관 티켓:** -

---

## 1. 버그 개요

### 문제 요약

`spec approve`, `plan approve`, 그리고 관련 target 선택 로직이 exact match 외에 suffix 매칭까지 허용하고 있어,
사용자가 의도하지 않은 task가 선택될 수 있다.

fast-track으로 시작하더라도 이후 일반 승인 명령으로 자연스럽게 이어져야 하므로,
모든 승인 관련 target 해석은 `id exact` 또는 `slug exact` 기준으로 일관되게 맞춰야 한다.

### 발견 경위

- [x] 코드 리뷰 중 발견

### 발생 빈도

- [x] 특정 조건에서만 재현

---

## 2. 재현 방법 (Steps to Reproduce)

**환경 정보**
| 항목 | 내용 |
|------|------|
| 환경 (local / dev / staging / production) | local |
| OS / 브라우저 / 앱 버전 | macOS / Node 20+ |
| 계정 유형 / 권한 | 해당 없음 |
| 관련 데이터 ID / 조건 | 유사한 suffix를 가진 둘 이상의 task 존재 |

**재현 단계**

1. slug 또는 id suffix가 겹치는 둘 이상의 task를 만든다.
2. `sduck spec approve <partial>` 또는 `sduck plan approve <partial>`를 실행한다.
3. exact target이 아닌 suffix target이 매칭되는지 확인한다.

**실제 결과 (Actual)**

일부 경로에서 suffix 기반 매칭이 허용돼 exact target 정책과 다르게 동작할 수 있다.

**기대 결과 (Expected)**

`id exact` 또는 `slug exact`만 허용되고, 모호하거나 부분 문자열인 target은 거부돼야 한다.

---

## 3. 원인 분석 (Root Cause)

### 원인 파악 현황

- [x] 원인 특정 완료

### 원인 요약

`src/core/spec-approve.ts`, `src/core/plan-approve.ts`의 target 필터가 `task.id.endsWith(trimmedTarget)`를 포함하고 있어,
완전 일치가 아닌 값도 후보로 통과시킨다.

### 원인 코드 위치

```
파일: src/core/spec-approve.ts, src/core/plan-approve.ts
함수 / 라인: resolveTargetCandidates, resolvePlanApprovalCandidates 부근
```

### 발생 조건

- target이 전체 id가 아니라 suffix인 경우
- 같은 suffix를 공유하는 task가 둘 이상인 경우

---

## 4. 수정 방안

### 선택한 방안 및 이유

> **선택:** exact-only target 정책으로 통일
>
> **이유:** fast-track이 생성한 task도 이후 일반 승인 명령으로 이어지므로, 모든 승인 경로의 target 정책이 동일해야 예측 가능성과 안전성이 높아진다.

### 변경 파일 목록 (예상)

```text
target_paths:
  - src/core/spec-approve.ts
  - src/core/plan-approve.ts
  - tests/unit/spec-approve.test.ts
  - tests/unit/plan-approve.test.ts
  - tests/e2e/spec-approve.test.ts
  - tests/e2e/plan-approve.test.ts
  - README.md
```

---

## 5. 테스트 계획

### 수정 검증 테스트 (수정 후 통과 확인)

| 테스트 케이스      | 조건                | 예상 결과                |
| ------------------ | ------------------- | ------------------------ |
| exact id 승인      | 전체 id 입력        | 정상 승인                |
| exact slug 승인    | slug 입력           | 정상 승인                |
| suffix target 거부 | partial/suffix 입력 | 실패 또는 no match       |
| 다중 후보 상황     | 유사 task 둘 이상   | 모호성 없이 exact만 허용 |

### 회귀 테스트

- [x] 기존 `spec approve` 성공 경로 유지
- [x] 기존 `plan approve` 성공 경로 유지
- [x] fast-track 이후 일반 승인 흐름 유지

---

## 6. 영향 범위

### 사이드 이펙트 검토

- 기존에 suffix target에 의존하던 사용 흐름은 더 이상 동작하지 않는다
- 대신 메시지가 더 명확해야 사용자가 exact id/slug를 쓰도록 학습할 수 있다

### 데이터 정합성

- [x] DB 데이터 정정 작업 필요 없음

---

## 7. 롤백 계획

- 롤백 방법: exact-only 필터 제거 후 이전 suffix 허용 로직 복구
- 롤백 판단 기준: 승인 UX가 과도하게 불편해져 정상 task 지정이 어려운 경우

---

## 8. 임시 조치 (Workaround, 해당 시)

- 전체 task id 또는 정확한 slug를 입력해 승인한다

---

## 9. 재발 방지 대책

- [x] 테스트 케이스 추가
- [x] target 선택 정책을 fast-track/일반 승인 흐름 문서에 맞춘다

---

## 10. 참고 자료

- `src/core/spec-approve.ts`
- `src/core/plan-approve.ts`
- `src/core/fast-track.ts`
