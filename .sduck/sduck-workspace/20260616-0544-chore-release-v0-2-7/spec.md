# [chore] release v0.2.7

> **작업 타입:** `chore` (Chore)
> **세부 분류:** `ci-cd` / `release`
> **작성자:** taehee
> **작성일:** 2026-06-16
> **연관 티켓:** -

---

## 1. 작업 개요

### 작업 목적

직전 커밋 `0154cb0 fix: restore init agent rules`의 변경사항을 npm에 배포한다. 현재 npm latest는 `0.2.6`이고, 이번 배포는 patch 버전 `0.2.7`로 올린다.

### 작업 범위

- [x] 패키지 버전 업데이트
- [x] 빌드/테스트/패키징 검증
- [x] npm publish
- [x] Git release commit 및 tag/branch push
- [x] 빌드 스크립트 / 설정 변경: 해당 없음
- [x] CI/CD 파이프라인 수정: 해당 없음
- [x] 문서 작성 / 수정: release task 기록 외 해당 없음
- [x] 환경 설정 변경: 해당 없음
- [x] 기타: npm registry 배포 확인

---

## 2. 변경 상세

### 현재 상태 (As-Is)

- `package.json` version: `0.2.6`
- `package-lock.json` root/package version: `0.2.6`
- npm latest: `@sduck/sduck-cli@0.2.6`
- 최신 코드 변경은 `origin/sduck-verison-2`에 push되어 있음

### 변경 후 상태 (To-Be)

- `package.json` version: `0.2.7`
- `package-lock.json` root/package version: `0.2.7`
- npm latest: `@sduck/sduck-cli@0.2.7`
- release commit이 remote branch에 push됨
- 가능하면 annotated/lightweight git tag `v0.2.7`을 생성해 push함

### 변경 파일 목록

```yaml
target_paths:
  - package.json
  - package-lock.json
  - .sduck/sduck-workspace/20260616-0544-chore-release-v0-2-7/spec.md
  - .sduck/sduck-workspace/20260616-0544-chore-release-v0-2-7/plan.md
  - .sduck/sduck-workspace/20260616-0544-chore-release-v0-2-7/review.md
  - .sduck/sduck-workspace/20260616-0544-chore-release-v0-2-7/meta.yml
  - .sduck/sduck-workspace/20260616-0544-chore-release-v0-2-7/agent-context.json
```

---

## 3. 의존성 변경

### 업데이트 목록

| 패키지             | 현재 버전 | 변경 버전 | 변경 유형 | 변경 이유                       |
| ------------------ | --------- | --------- | --------- | ------------------------------- |
| `@sduck/sduck-cli` | `0.2.6`   | `0.2.7`   | patch     | init agent rules 복구 변경 배포 |

### 주요 Breaking Changes 검토

- major 업데이트가 아니므로 해당 없음.

### 제거 패키지

- 해당 없음.

---

## 4. CI/CD 변경

- 변경 없음.

---

## 5. 문서 변경

| 문서          | 변경 내용 요약                | 변경 이유   |
| ------------- | ----------------------------- | ----------- |
| SDD task 문서 | release spec/plan/review 기록 | 릴리즈 추적 |

---

## 6. 검증 계획

### 검증 체크리스트

- [x] `npm run lint` 통과
- [x] `npm run typecheck` 통과
- [x] `npm run test:unit` 통과
- [x] `npm run test:e2e` 통과
- [x] `npm run build` 성공
- [x] `npm pack --dry-run --json`에 `.sduck/sduck-assets` 포함 확인
- [x] npm publish 성공
- [x] `npm view @sduck/sduck-cli@latest version`이 `0.2.7` 반환

### 검증 방법

```bash
npm version 0.2.7 --no-git-tag-version
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
npm pack --dry-run --json
npm publish --access public
npm view @sduck/sduck-cli@latest version
```

---

## 7. 영향 범위

### 런타임 영향

- [x] 런타임 코드 변경 없음: release task 자체는 버전 메타데이터만 변경한다.
- [x] 런타임에 영향 있음: npm 사용자는 직전 커밋의 init/agent-rule 복구 기능을 `0.2.7`로 설치 가능해진다.

### 개발자 환경 영향

- [x] `npm install` 재실행 필요 없음
- [x] `.env` 파일 업데이트 필요 없음
- [x] 별도 마이그레이션 절차 필요 없음
- [x] 변경 없음

---

## 8. 롤백 계획

- Git 롤백: release commit을 revert하고 필요 시 tag를 삭제한다.
- npm 롤백: 이미 publish된 npm version은 삭제/변경하지 않고, 문제가 있으면 `0.2.8` patch로 수정 배포한다.

---

## 9. 공지 사항

- 배포 후 사용자는 `npm i -g @sduck/sduck-cli@latest` 또는 `npm exec @sduck/sduck-cli@latest -- init`로 최신 init agent-rule 복구 기능을 사용할 수 있다.

---

## 10. 완료 조건

- [x] `package.json`과 `package-lock.json` version이 `0.2.7`이다.
- [x] 검증 명령이 통과한다.
- [x] npm package dry-run contents에 `.sduck/sduck-assets`가 포함된다.
- [x] `npm publish --access public`가 성공한다.
- [x] npm latest가 `0.2.7`을 가리킨다.
- [x] release commit과 `v0.2.7` tag가 remote에 push된다.

---

## 11. 참고 자료

- Changelog / Release Notes: `0154cb0 fix: restore init agent rules`
- npm package: `@sduck/sduck-cli`

---

## 12. Spec 자체 평가

`.sduck/sduck-assets/eval/spec.yml` 기준 자체 평가:

| 기준                | 점수 | 근거                                                                     |
| ------------------- | ---- | ------------------------------------------------------------------------ |
| problem_clarity     | 5    | 배포 목적, 대상 버전, 직전 변경 커밋을 명확히 기술함                     |
| scope_definition    | 5    | 버전 파일, 검증, npm publish, git push/tag 범위를 구분함                 |
| completion_criteria | 5    | npm latest 확인까지 검증 가능한 완료 조건을 정의함                       |
| feasibility         | 5    | 기존 release 흐름과 npm package 설정이 준비되어 있음                     |
| risk_coverage       | 4    | npm publish 불변성, tag/remote push, package contents 검증 위험을 포함함 |
| testability         | 5    | 실행 명령과 확인 방법을 구체적으로 명시함                                |

총평: patch release 진행에 충분한 spec이다.

---

## 13. Task 자체 평가

`.sduck/sduck-assets/eval/task.yml` 기준 자체 평가:

| 기준                   | 점수 | 근거                                                                             |
| ---------------------- | ---- | -------------------------------------------------------------------------------- |
| spec_alignment         | 5    | `0.2.7` 버전 갱신, 검증, git push/tag, npm publish, latest 확인을 모두 수행함    |
| plan_alignment         | 5    | 승인된 4단계 plan의 version bump, 검증, release 기록, publish 검증 흐름을 완료함 |
| implementation_quality | 5    | 코드 변경 없이 package metadata release만 수행해 변경 범위를 최소화함            |
| test_completeness      | 5    | lint/typecheck/unit/e2e/build/pack/npm registry 확인을 모두 수행함               |
| documentation_quality  | 5    | SDD spec/plan/review에 release 결과와 검증 내역을 남김                           |
| maintainability        | 5    | release commit/tag와 SDD 기록 커밋을 분리해 추적 가능성을 높임                   |

총평: `@sduck/sduck-cli@0.2.7` npm 배포가 완료되었고 release 추적 조건을 충족한다.
