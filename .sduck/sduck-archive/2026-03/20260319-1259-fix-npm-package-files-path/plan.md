# Plan

## Step 1. package.json files 필드 경로 수정

- **파일:** `package.json` (라인 11)
- **변경:** `"sduck-assets"` → `".sduck/sduck-assets"`
- **이유:** npm pack/publish 시 실제 디렉토리 경로인 `.sduck/sduck-assets`가 패키지에 포함되도록 함
- **검증:** `npm pack --dry-run` 출력에서 `.sduck/sduck-assets/` 하위 파일들이 포함되는지 확인
