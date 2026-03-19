# [fix] resolve missing agents field on init execution result

> **작업 타입:** `fix` (Quick Fix)
> **심각도:** `high`
> **작성자:** Claude
> **작성일:** 2026-03-19
> **연관 티켓:**

---

## 1. 버그 개요

### 문제 요약

`src/commands/init.ts`에서 `InitExecutionResult`의 `agents` 필드를 참조하는데, 일부 타입 해석 경로에서는 `Property 'agents' does not exist on type 'InitExecutionResult'` 오류가 발생한다.

### 발견 경위

- [x] 사용자 제보
- [ ] 모니터링 알림
- [ ] 코드 리뷰 중 발견
- [ ] QA 테스트
- [ ] 기타:

### 발생 빈도

- [ ] 항상 재현됨 (100%)
- [x] 간헐적 재현 (약 환경 의존)
- [ ] 특정 조건에서만 재현

---

## 2. 재현 방법 (Steps to Reproduce)

**환경 정보**
| 항목 | 내용 |
|------|------|
| 환경 (local / dev / staging / production) | local |
| OS / 브라우저 / 앱 버전 | TypeScript 개발 환경 |
| 계정 유형 / 권한 | 해당 없음 |
| 관련 데이터 ID / 조건 | `src/commands/init.ts`의 `formatResult` 타입 검사 |

**재현 단계**

1. `src/commands/init.ts`에서 `formatResult`의 `result.agents` 참조를 확인한다.
2. TypeScript 서버 또는 타입 검사 환경에서 `InitExecutionResult` 해석 결과를 확인한다.
3. `agents` 필드가 누락된 타입으로 해석되면 오류가 발생한다.

**실제 결과 (Actual)**

`result.agents` 접근에서 TS2339 오류가 발생해 개발 흐름이 막힌다.

**기대 결과 (Expected)**

`InitExecutionResult`의 타입과 실제 반환 구조가 일치해 `result.agents` 접근이 안정적으로 타입 검사되어야 한다.

---

## 3. 원인 분석 (Root Cause)

### 원인 파악 현황

- [ ] 원인 특정 완료
- [x] 원인 조사 중
- [ ] 원인 불명

### 원인 요약

소스상 `InitExecutionResult`에는 `agents`가 정의되어 있지만, 타입 재내보내기나 빌드 산출물, 편집기 타입 캐시 중 하나가 오래된 구조를 참조할 가능성이 있다. `src/commands/init.ts`가 바라보는 타입 소스와 실제 인터페이스 선언 간 정합성을 확인해야 한다.

### 원인 코드 위치

```text
파일: src/commands/init.ts, src/core/init.ts, dist/*.d.ts(필요 시)
함수 / 라인: formatResult, InitExecutionResult 선언 및 export 경로
```

### 발생 조건

타입 정의 변경 후 편집기/빌드 산출물/모듈 해석이 엇갈릴 때 발생 가능성이 있다.

---

## 4. 수정 방안

### 방안 검토

| 방안   | 설명                                                                           | 장점           | 단점                    |
| ------ | ------------------------------------------------------------------------------ | -------------- | ----------------------- |
| 방안 A | 참조 코드를 우회해 `agents` 의존 제거                                          | 빠름           | 실제 타입 불일치를 숨김 |
| 방안 B | `InitExecutionResult` 타입 export 경로와 사용 지점을 정렬하고 테스트/빌드 확인 | 근본 해결 가능 | 조사 범위가 조금 넓음   |

### 선택한 방안 및 이유

> **선택:** 방안 B
>
> **이유:** 실제 문제는 타입 정합성이라 참조를 없애는 방식보다 타입 소스와 소비 지점을 맞추는 것이 안전하다.

### 변경 파일 목록 (예상)

```text
target_paths:
  - src/commands/init.ts
  - src/core/init.ts
  - tests/unit/...
  - tests/e2e/...
```

---

## 5. 테스트 계획

### 버그 재현 테스트 (수정 전 실패 확인)

- [ ] 타입 불일치 재현 경로 확인

### 수정 검증 테스트 (수정 후 통과 확인)

| 테스트 케이스    | 조건                | 예상 결과                         |
| ---------------- | ------------------- | --------------------------------- |
| typecheck        | 전체 타입 검사 실행 | TS2339 오류 없음                  |
| init output      | `sduck init` 실행   | selected agents 출력 유지         |
| build regression | 빌드 실행           | 선언 파일과 런타임 출력 모두 정상 |

### 회귀 테스트

- [ ] 타입 검사 통과
- [ ] init 관련 단위/e2e 회귀 확인

---

## 6. 영향 범위

### 사이드 이펙트 검토

init 명령 출력 포맷, 타입 export 구조, 빌드 산출 선언 파일에 영향이 있을 수 있다.

### 데이터 정합성

- [x] DB 데이터 정정 작업 필요 없음
- [ ] DB 데이터 정정 작업 필요: _(내용 작성)_

---

## 7. 롤백 계획

문제 발생 시 최근 타입 정렬 변경분을 되돌리고 마지막 정상 타입 구조로 복귀한다.

- 롤백 방법: 관련 타입 변경 revert
- 롤백 판단 기준 (임계값 또는 조건): typecheck 또는 build가 계속 실패할 경우

---

## 8. 임시 조치 (Workaround, 해당 시)

임시로는 TypeScript 서버 재시작이나 재빌드로 증상이 사라질 수 있으나, 근본 해결 전까지는 재발 가능성이 있다.

---

## 9. 재발 방지 대책

타입 구조와 init 출력 사용 지점을 함께 검증하는 회귀 테스트 및 빌드 확인을 유지한다.

- [x] 테스트 케이스 추가
- [ ] 코드 리뷰 체크리스트 항목 추가
- [ ] 모니터링 알림 추가
- [ ] 기타:

---

## 10. 참고 자료

- `src/commands/init.ts`
- `src/core/init.ts`
