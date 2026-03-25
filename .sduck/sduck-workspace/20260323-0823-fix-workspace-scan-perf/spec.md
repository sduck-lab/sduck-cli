# [fix] workspace-scan-perf

## 목표

`listWorkspaceTasks`의 순차 I/O를 병렬화하여 태스크 수가 많을 때 스캔 지연을 줄인다.

## 범위

- `listWorkspaceTasks`: meta.yml 읽기를 `Promise.all`로 병렬화
- `findActiveTask`: 전체 목록 불필요 — active 상태 하나 찾으면 조기 종료하는 전용 경로 추가
- 불필요한 동적 import (`await import('node:fs/promises')`) 제거

## 제외 범위

- 캐싱, 인덱스 파일 도입은 하지 않는다
- 함수 시그니처 변경 없음 (기존 호출부 영향 없음)

## 완료 조건

- [x] `listWorkspaceTasks`가 meta.yml을 병렬로 읽는다
- [x] `findActiveTask`가 전체 목록을 읽지 않고 조기 종료한다
- [x] 기존 테스트 전부 통과 (회귀 없음)
