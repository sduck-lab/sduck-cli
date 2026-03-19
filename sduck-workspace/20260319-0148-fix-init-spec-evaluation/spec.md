# [fix] `sduck init` 누락 asset 보완

> **작업 타입:** `fix` (Quick Fix)
> **심각도:** `medium`
> **작성자:** taehee
> **작성일:** 2026-03-19
> **연관 티켓:** -

---

## 1. 버그 개요

### 문제 요약

현재 `sduck init`은 `sduck-assets/plan-evaluation.yml`과 스펙 템플릿 파일들은 생성하지만,
워크플로우에서 실제로 사용하는 `sduck-assets/spec-evaluation.yml`은 기본 생성 대상에 포함하지 않는다.

### 발견 경위

- [ ] 사용자 제보
- [ ] 모니터링 알림
- [x] 코드 리뷰 중 발견
- [ ] QA 테스트
- [ ] 기타:

### 발생 빈도

- [x] 항상 재현됨 (100%)
- [ ] 간헐적 재현 (약 %)
- [ ] 특정 조건에서만 재현

---

## 2. 재현 방법 (Steps to Reproduce)

**환경 정보**
| 항목 | 내용 |
|------|------|
| 환경 (local / dev / staging / production) | local |
| OS / 브라우저 / 앱 버전 | macOS / Node.js 20 |
| 계정 유형 / 권한 | 해당 없음 |
| 관련 데이터 ID / 조건 | 빈 temp workspace |

**재현 단계**

1. 비어 있는 디렉토리에서 `sduck init`을 실행한다.
2. 생성된 `sduck-assets/` 내용을 확인한다.
3. `spec-evaluation.yml` 존재 여부를 확인한다.

**실제 결과 (Actual)**

`spec-evaluation.yml`이 생성되지 않는다.

**기대 결과 (Expected)**

`spec-evaluation.yml`도 다른 기본 asset과 함께 생성되어, spec 평가 워크플로우가 초기화 직후 바로 동작해야 한다.

---

## 3. 원인 분석 (Root Cause)

### 원인 파악 현황

- [x] 원인 특정 완료
- [ ] 원인 조사 중
- [ ] 원인 불명

### 원인 요약

`sduck init`의 기본 asset 목록 상수에 `spec-evaluation.yml`이 빠져 있다.
그래서 safe mode와 force mode 모두 이 파일을 생성/재생성 대상으로 다루지 않는다.

### 원인 코드 위치

```
파일: src/core/init.ts
함수 / 라인: ASSET_TEMPLATE_DEFINITIONS
```

### 발생 조건

- `sduck init`을 새 프로젝트에서 실행할 때
- `sduck init --force`를 실행해도 동일하게 누락됨

---

## 4. 수정 방안

### 방안 검토

| 방안   | 설명                                        | 장점                           | 단점                                     |
| ------ | ------------------------------------------- | ------------------------------ | ---------------------------------------- |
| 방안 A | asset 목록에 `spec-evaluation.yml` 추가     | 현재 구조 유지, 영향 범위 작음 | 목록 누락 재발 가능성은 남음             |
| 방안 B | `sduck-assets/`를 동적으로 스캔해 전부 생성 | 누락 가능성 감소               | 현재 init 정책과 테스트 변경 범위가 커짐 |

### 선택한 방안 및 이유

> **선택:** 방안 A
>
> **이유:** 현재 구조와 테스트를 가장 적게 흔들면서, 실제 누락 버그를 정확히 수정할 수 있다.

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - src/core/init.ts
  - tests/unit/init.test.ts
  - tests/e2e/init.test.ts
  - sduck-workspace/20260319-0148-fix-init-spec-evaluation/spec.md
```

---

## 5. 테스트 계획

### 버그 재현 테스트 (수정 전 실패 확인)

- [x] `sduck init` 실행 후 `sduck-assets/spec-evaluation.yml` 누락을 검증하는 테스트를 추가한다

### 수정 검증 테스트 (수정 후 통과 확인)

| 테스트 케이스  | 조건                                   | 예상 결과                         |
| -------------- | -------------------------------------- | --------------------------------- |
| 신규 초기화    | 빈 프로젝트에서 `sduck init` 실행      | `spec-evaluation.yml` 생성        |
| 강제 재생성    | `sduck init --force` 실행              | `spec-evaluation.yml` 포함 재생성 |
| 부분 손상 복구 | `spec-evaluation.yml`만 삭제 후 재실행 | 누락 파일만 복구                  |

### 회귀 테스트

- [x] 기존 asset 생성 개수와 summary 출력이 함께 업데이트되는지 확인
- [x] `plan-evaluation.yml` 및 기존 spec 템플릿 생성이 유지되는지 확인

---

## 6. 영향 범위

### 사이드 이펙트 검토

- `sduck init`의 asset 생성 개수와 summary 출력이 바뀐다
- init 관련 unit/e2e 테스트 expectation이 바뀐다

### 데이터 정합성

- [x] DB 데이터 정정 작업 필요 없음
- [ ] DB 데이터 정정 작업 필요: _(내용 작성)_

---

## 7. 롤백 계획

- 롤백 방법: `spec-evaluation.yml`을 asset 목록에서 제거하고 관련 테스트 기대값을 되돌린다
- 롤백 판단 기준 (임계값 또는 조건): init 출력 또는 테스트가 다른 기본 asset 생성 정책을 깨뜨릴 때

---

## 8. 임시 조치 (Workaround, 해당 시)

- 사용자가 수동으로 `sduck-assets/spec-evaluation.yml`을 복사해 둘 수 있다.

---

## 9. 재발 방지 대책

- [x] 테스트 케이스 추가
- [ ] 코드 리뷰 체크리스트 항목 추가
- [ ] 모니터링 알림 추가
- [ ] 기타:

---

## 10. 참고 자료

- `sduck-assets/spec-evaluation.yml`
- `src/core/init.ts`
- `sduck-workspace/20260319-0114-feature-sduck-init/spec.md`
