# Plan

## Step 1. README.md에 Windows 트러블슈팅 섹션 추가

- **대상 파일:** `README.md`
- **수정 위치:** `## 🛠 설치 및 초기화` 섹션 아래에 Windows 안내 추가
- **변경 내용:**
  - Windows(PowerShell)에서 `sduck`을 찾지 못하는 증상 설명
  - `npm config get prefix`로 전역 경로 확인하는 방법
  - PATH에 추가하는 PowerShell 명령어 안내
  - 영구 PATH 설정 방법
- **검증:** README.md 내용 확인, `npm run format:check`
