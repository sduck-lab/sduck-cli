# [feature] task eval

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-03-19
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 워크플로우에는 `spec` 평가와 `plan` 평가 asset만 있고,
실제 구현 결과나 task 완료 품질을 점검하는 `task` 평가 기준은 없다.

그래서 사용자가 작업을 완료했을 때

- 구현 품질이 충분한지
- spec/plan과 실제 산출물이 일치하는지
- 테스트/문서/유지보수성이 충분한지
  를 일관된 기준으로 확인하기 어렵다.

이번 작업의 목표는 `.sduck/sduck-assets/eval/task.yml`을 도입하고,
워크플로우 문서와 향후 CLI/에이전트 흐름에서 task 완료 품질을 같은 기준으로 점검한 뒤,
그 결과를 보고 `task done` 또는 동등한 완료 처리로 넘어가게 만드는 것이다.

### 기대 효과

- 작업 완료 시 사용할 공통 평가 기준이 생긴다
- spec/plan뿐 아니라 구현 결과도 구조적으로 점검할 수 있다
- 사용자가 task 평가 항목을 asset으로 커스터마이즈할 수 있다
- 향후 `done` 명령이나 완료 검증 UX에서 재사용할 수 있다

---

## 2. 기능 명세

### 사용자 스토리

```text
As a developer,
I want a configurable task evaluation asset,
So that completed work can be reviewed against consistent quality criteria before final completion.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `.sduck/sduck-assets/eval/task.yml`이 추가된다
- [x] AC2: task 평가 asset은 spec/plan eval과 같은 커스터마이즈 가능한 구조를 가진다
- [x] AC3: `AGENT.md`, `CLAUDE.md`, agent rule 자산에서 task 평가 기준 경로를 명시할 수 있다
- [x] AC4: 완료 처리 또는 완료 직전 검토 시 task 평가 기준을 읽고, 그 결과를 본 뒤 `task done`으로 넘어가는 워크플로우 문서가 정리된다
- [x] AC5: 기본 task 평가 항목은 구현 품질, spec/plan 일치성, 테스트, 문서화, 유지보수성 등을 포함한다

### 기능 상세 설명

- 새 asset 경로: `.sduck/sduck-assets/eval/task.yml`
- 구조는 `spec.yml`, `plan.yml`과 유사하게 아래를 포함한다
  - `version`
  - 평가 이름 또는 section
  - `scale.min`, `scale.max`
  - `criteria[]`
- 기본 평가 항목은 최소 아래 영역을 덮어야 한다
  - spec alignment
  - plan alignment
  - implementation quality
  - test completeness
  - documentation quality
  - maintainability
- task eval은 구현 완료 직후, `task done` 또는 최종 완료 처리 직전에 수행하는 것을 기본 흐름으로 둔다
- task eval 결과는 사용자 메시지에 표시하고, 그 결과를 확인한 뒤 완료 처리로 넘어가도록 문서화한다

### 엣지 케이스

- 사용자가 `task.yml` 항목 수를 늘리거나 줄였을 때도 문서 흐름이 깨지지 않아야 한다
- spec/plan eval만 존재하고 task eval이 없을 때의 이전 저장소와 호환 정책이 필요하다

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어                       | 파일 / 모듈                               | 변경 내용 요약                |
| ---------------------------- | ----------------------------------------- | ----------------------------- |
| Assets                       | `.sduck/sduck-assets/eval/task.yml`       | task 평가 기준 추가           |
| Docs                         | `AGENT.md`                                | task 평가 기준 사용 규칙 반영 |
| Docs                         | `CLAUDE.md`                               | task 평가 기준 사용 규칙 반영 |
| Assets                       | `.sduck/sduck-assets/agent-rules/core.md` | task eval 경로 반영           |
| Tests / future workflow docs | 향후 `done` 연계 지점 명시                | 재사용 가능 구조 정리         |

### API 명세 (해당 시)

해당 없음.

### 데이터 모델 변경 (해당 시)

해당 없음.

---

## 4. UI/UX 명세 (해당 시)

CLI보다는 워크플로우 문서와 에이전트 동작 기준을 정의한다.

### 인터랙션 정의

- task 완료 직전에는 spec/plan과 별도로 task 평가 기준을 참고할 수 있어야 한다
- 평가 결과를 사용자 메시지에 표시하는 형식은 spec/plan 평가와 일관되게 유지할 수 있어야 한다
- 기본 흐름은 `구현 완료 -> task eval 결과 확인 -> task done` 순서여야 한다

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

- 이번 작업은 자산/문서 구조 변경이 중심이므로 런타임 로직 테스트는 필수 아님
- 다만 향후 eval 로더가 있다면 `task.yml`도 같은 구조로 읽을 수 있어야 한다

### 통합 / 검증 체크

- [ ] `task.yml`이 올바른 YAML 구조인지 확인
- [ ] `AGENT.md`, `CLAUDE.md`, agent rule 자산의 경로가 일치하는지 확인
- [ ] 기존 `spec.yml`, `plan.yml` 구조와 일관성이 유지되는지 확인

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - .sduck/sduck-assets/eval/task.yml
  - AGENT.md
  - CLAUDE.md
  - .sduck/sduck-assets/agent-rules/core.md
```

### 사이드 이펙트 검토

- 향후 `done` 또는 `task done` 명령 설계가 task eval 자산을 전제로 하게 된다
- 문서에 task eval 사용 시점을 명확히 써두지 않으면 혼란이 생길 수 있다

### 롤백 계획

- `task.yml`과 관련 문서 참조를 제거한다

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 해당 없음
- **입력값 검증:** asset 구조는 사용자 커스터마이즈 가능하지만 YAML 문법은 유지되어야 한다
- **성능:** 정적 자산/문서 변경 수준이므로 성능 영향은 거의 없다
- **민감 데이터 처리:** 없음

---

## 8. 비기능 요구사항

| 항목             | 요구사항                         |
| ---------------- | -------------------------------- |
| 응답 시간        | 해당 없음                        |
| 동시 사용자      | 고려 대상 아님                   |
| 데이터 보존 기간 | asset은 저장소에 지속적으로 유지 |

---

## 9. 의존성 및 선행 조건

- 이 작업 시작 전 완료되어야 하는 작업: `spec eval`, `plan eval` 구조 정리 완료
- 외부 서비스 / API 연동 필요 여부: 없음
- 피처 플래그(Feature Flag) 사용 여부: 없음

---

## 10. 미결 사항 (Open Questions)

- [ ] task eval을 `done` 또는 `task done` 명령에서 자동으로 사용할지, 우선 문서 규칙 수준으로만 둘지 -> plan approve 하면 implement 하잖아 그 이후에 task eval 하도록 해줘 그리고 자동으로 done 해줘
- [ ] 기본 평가 항목 이름을 영어 key + 한국어 question 조합으로 유지할지 -> 이거는 사용자가 커스텀 할 수 있고 기본은 한국어로 쓸거야

---

## 11. 참고 자료

- `.sduck/sduck-assets/eval/spec.yml`
- `.sduck/sduck-assets/eval/plan.yml`
- `AGENT.md`
- `CLAUDE.md`
