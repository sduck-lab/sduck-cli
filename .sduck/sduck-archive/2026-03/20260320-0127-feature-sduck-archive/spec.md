# [feature] sduck archive

> **작업 타입:** `feature`
> **작성일:** 2026-03-20

---

## 1. 배경 및 목적

### 문제

`sduck-workspace/`에 완료된 태스크 폴더가 계속 쌓여 디렉토리가 비대해진다.
설계 문서(spec.md, plan.md)는 팀의 자산이므로 삭제하면 안 되고, Git을 쓰지 않는 환경도 고려해야 한다.

### 기대 효과

완료된 태스크 폴더를 월별 archive 디렉토리로 이동하여, workspace는 활성 태스크만 남기고 설계 자산은 원본 그대로 보존한다.

---

## 2. 기능 명세

### 사용자 스토리

```
As a sduck 사용자,
I want to archive completed tasks into monthly directories,
So that my workspace stays clean while preserving design assets as-is.
```

### 수용 기준 (Acceptance Criteria)

- [x] AC1: `sduck archive`는 DONE 상태 태스크만 대상으로 한다
- [x] AC2: 대상 태스크 폴더를 `.sduck/sduck-archive/YYYY-MM/` 아래로 이동한다 (원본 구조 그대로)
- [x] AC3: 이동 후 workspace에서 원본 폴더가 사라진다
- [x] AC4: `--keep N` 옵션으로 최근 완료 N개를 workspace에 남길 수 있다 (기본값: 0, 전부 아카이브)
- [x] AC5: 이미 archive에 동일 id 폴더가 있으면 skip한다
- [x] AC6: 아카이브 대상이 없으면 안내 메시지를 출력하고 정상 종료한다

### 기능 상세

**archive 후 디렉토리 구조:**

```
.sduck/
├── sduck-workspace/          # 활성 태스크만 남음
│   └── 20260320-xxxx-feature-current/
├── sduck-archive/
│   └── 2026-03/              # 월별 디렉토리
│       ├── 20260318-1430-build-sduck-cli/
│       │   ├── meta.yml
│       │   ├── spec.md
│       │   └── plan.md
│       └── 20260319-1325-chore-windows-install-guide/
│           ├── meta.yml
│           ├── spec.md
│           └── plan.md
```

**동작 흐름:**

1. `sduck-workspace/`에서 DONE 태스크 목록 수집
2. `--keep N`이면 completedAt 기준 최근 N개 제외
3. 태스크별 completedAt의 YYYY-MM로 대상 월 결정
4. `.sduck/sduck-archive/YYYY-MM/` 디렉토리 생성 (없으면)
5. 태스크 폴더를 해당 월 디렉토리로 rename(이동)
6. 이미 동일 id 폴더가 존재하면 skip

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어  | 파일 / 모듈                      | 변경 내용 요약              |
| ------- | -------------------------------- | --------------------------- |
| Core    | `src/core/project-paths.ts`      | archive 경로 상수/함수 추가 |
| Core    | `src/core/archive.ts` (신규)     | archive 비즈니스 로직       |
| Command | `src/commands/archive.ts` (신규) | CLI I/O, 결과 포맷팅        |
| CLI     | `src/cli.ts`                     | archive 커맨드 등록         |

---

## 4. 테스트 계획

### 단위 테스트

| 대상        | 테스트 케이스              | 예상 결과              |
| ----------- | -------------------------- | ---------------------- |
| 대상 필터링 | DONE만 필터                | DONE 아닌 태스크 제외  |
| --keep N    | 최근 2개 제외              | 나머지만 아카이브 대상 |
| 월 결정     | completedAt → YYYY-MM 추출 | 올바른 월 문자열       |
| 중복 감지   | 이미 있는 폴더             | skip 처리              |

### E2E 테스트

| 시나리오                        | 예상 결과                                  |
| ------------------------------- | ------------------------------------------ |
| DONE 2개 archive                | archive 월 폴더에 이동, workspace에서 삭제 |
| 대상 없음                       | 안내 메시지, exitCode 0                    |
| --keep 1로 3개 중 2개만 archive | 최근 1개 남음                              |

---

## 5. 영향 범위 분석

### 변경 파일 목록

```
target_paths:
  - src/cli.ts
  - src/core/project-paths.ts
  - src/core/archive.ts (신규)
  - src/commands/archive.ts (신규)
  - tests/unit/archive.test.ts (신규)
  - tests/e2e/archive.test.ts (신규)
```

### 사이드 이펙트

- 기존 명령어에 영향 없음 (새 명령어 추가만)
- `sduck-archive/` 디렉토리는 archive 최초 실행 시 생성
