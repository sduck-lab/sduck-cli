# Plan

## Step 1. release version metadata를 `0.2.7`로 갱신

대상 파일:

- `package.json`
  - root `version` 값을 `0.2.6`에서 `0.2.7`로 변경한다.
  - 기존 `files` 설정(`dist`, `.sduck/sduck-assets`)은 유지한다.
- `package-lock.json`
  - root `version`과 `packages[""].version` 값을 `0.2.7`로 맞춘다.

실행 방법:

```bash
npm version 0.2.7 --no-git-tag-version
```

검증:

```bash
node -p "require('./package.json').version"
node -p "require('./package-lock.json').version"
```

## Step 2. release artifact를 검증하고 npm package contents를 확인

대상 파일/산출물:

- `dist/cli.js`, `dist/cli.js.map`, `dist/cli.d.ts`
  - `npm run build`로 생성되는 publish artifact다.
  - git commit 대상은 아니어도 publish 전 최신 상태여야 한다.
- `.sduck/sduck-assets/**`
  - `npm pack --dry-run --json` 결과에 포함되는지 확인한다.

검증 명령:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
npm pack --dry-run --json
```

확인 기준:

- 모든 검증 명령이 exit code 0으로 끝난다.
- `npm pack --dry-run --json` 출력에 `.sduck/sduck-assets/agent-rules/core.md`, `.sduck/sduck-assets/eval/spec.yml`, `.sduck/sduck-assets/types/feature.md`가 포함된다.

## Step 3. SDD release 기록을 완료하고 release commit/tag를 생성해 push

대상 파일:

- `.sduck/sduck-workspace/20260616-0544-chore-release-v0-2-7/spec.md`
  - 검증 완료 후 완료 조건 checklist를 실제 결과에 맞춰 체크한다.
  - `.sduck/sduck-assets/eval/task.yml` 기준 task 자체 평가를 추가한다.
- `.sduck/sduck-workspace/20260616-0544-chore-release-v0-2-7/review.md`
  - 변경 요약, 테스트 결과, 리뷰 체크리스트를 작성한다.
- `.sduck/sduck-workspace/20260616-0544-chore-release-v0-2-7/meta.yml`, `agent-context.json`
  - `sduck step done <N>`, `sduck review ready`, `sduck done` 흐름으로 상태를 기록한다.

실행 방법:

```bash
npx tsx src/cli.ts step done 1
npx tsx src/cli.ts step done 2
npx tsx src/cli.ts review ready release-v0-2-7
npx tsx src/cli.ts done release-v0-2-7
git status
git diff --check
git add package.json package-lock.json .sduck/sduck-workspace/20260616-0544-chore-release-v0-2-7
git commit -m "chore: release v0.2.7"
git tag v0.2.7
git push
git push origin v0.2.7
```

검증:

```bash
git status -sb
git log --oneline -3
git tag --list v0.2.7
```

## Step 4. npm에 `@sduck/sduck-cli@0.2.7`을 publish하고 registry를 확인

대상:

- npm package: `@sduck/sduck-cli`
- dist tag: `latest`

실행 방법:

```bash
npm publish --access public
npm view @sduck/sduck-cli@latest version
npm view @sduck/sduck-cli@0.2.7 version
```

검증:

- `npm publish --access public`가 성공한다.
- `npm view @sduck/sduck-cli@latest version`이 `0.2.7`을 출력한다.
- `npm view @sduck/sduck-cli@0.2.7 version`이 `0.2.7`을 출력한다.

롤백/주의:

- npm publish는 사실상 되돌릴 수 없으므로 publish 전 Step 2 검증과 release commit/tag push를 완료한다.
- publish 후 문제가 발견되면 npm package를 덮어쓰지 않고 `0.2.8` patch로 수정 배포한다.

## Plan 자체 평가

`.sduck/sduck-assets/eval/plan.yml` 기준 자체 평가:

| 기준             | 점수 | 근거                                                                       |
| ---------------- | ---- | -------------------------------------------------------------------------- |
| semantic_clarity | 5    | 버전 갱신, 검증, git release 기록, npm publish를 순서대로 분리함           |
| abstraction      | 5    | release 작업 특성에 맞게 파일/명령/검증 단위로 구체화함                    |
| typing           | 5    | 코드 타입 변경은 없고 package metadata consistency를 검증함                |
| security         | 4    | npm publish 전 pack contents와 registry 확인, publish 불변성 주의를 포함함 |
| maintainability  | 5    | package/package-lock 동기화와 SDD release 기록을 명확히 남김               |
| testability      | 5    | lint/typecheck/unit/e2e/build/pack/npm view 검증을 명시함                  |

총평: 승인 후 바로 release를 진행할 수 있는 실행 계획이다.
