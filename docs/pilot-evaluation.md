# sduck team pilot evaluation

## 목적과 기간

팀이 실제 개발에서 sduck의 decision brief가 재작업을 줄이고 과거 결정을 재사용하게 만드는지 검증한다. 권장 pilot은 4–6주, 최소 20개 작업, 최소 5명의 기여자를 대상으로 한다. 같은 제품 영역의 직전 작업을 baseline cohort로 잡고 작업 복잡도와 변경 규모를 맞춘다.

## 대상 작업

- 둘 이상의 구현 선택지가 있거나 둘 이상의 모듈을 건드리는 중간 이상 복잡도 작업
- API, 데이터 모델, 상태 전이, 운영 정책처럼 이후 작업이 재사용할 결정을 포함하는 작업
- 요구사항 해석 오류나 기존 설계 위반으로 재작업이 반복되던 영역의 작업
- 신규 기능, 비단순 버그 수정, 구조 변경, 팀 간 계약 변경

각 작업은 시작 시 `small`, `medium`, `large`로 분류하고 근거를 남긴다. `small`은 한 개의 간결한 decision과 질문 0개로 끝낼 수 있어야 하며 full briefing을 강제하지 않는다.

## 적용 제외 기준

- 오탈자, 주석, 기계적 포맷, 단일 상수 변경처럼 선택지가 없는 사소한 작업
- 즉시 완화가 우선인 장애 대응의 최초 hotfix. 사후 decision 기록은 별도 작업으로 수행할 수 있다.
- 자동 생성 파일만 바꾸는 작업
- 조사만 수행하고 구현하지 않는 작업
- 비밀정보나 고객 원문을 decision source에 기록해야만 측정 가능한 작업

제외 작업도 전체 작업 수에는 기록하되, 제외 사유와 `brief_not_required`를 남겨 절차 회피와 적절한 경량화를 구분한다.

## 측정 항목

| 지표              | 정의                                                                                                  | 수집 방법                                           | 권장 기준                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------ |
| Brief 작성 시간   | `sduck work`부터 성공한 `sduck confirm`까지의 사람+agent 활성 시간. 대기 시간은 제외한다.             | task event와 5분 단위 작업 기록                     | medium/large에서 전체 작업 시간의 15% 이하 |
| 재작업률          | confirm된 decision 위반, 누락된 scope, 이미 답한 질문 때문에 폐기·재작성한 구현 시간 / 전체 구현 시간 | PR review 사유와 `decision-caused-rework` 태그      | matched baseline보다 감소                  |
| Decision 재사용률 | 반복 영역의 eligible 작업 중 `recall` 결과가 brief/구현/리뷰에 실제 source ref로 사용된 작업 비율     | brief의 `CARRIED` decision, source refs, trace 확인 | 30% 이상                                   |
| 사용자 만족도     | “brief가 구현 결정을 명확하게 했다”, “절차 비용이 합리적이었다”, “recall이 유용했다”의 1–5점 평균     | 작업 종료 직후 3문항 설문                           | 평균 3.8 이상, 1–2점 응답 20% 미만         |
| Confirm 실패 품질 | 열린 질문·conflict·invalid source를 구현 전에 차단한 비율과 false block 수                            | CLI 실패 코드와 후속 해결 기록                      | false block 5% 미만                        |
| Trace 완전성      | 실제 구현 파일 중 trace에 포함된 비율과 harness/generated noise 비율                                  | PR changed files와 trace 비교                       | 실제 파일 95% 이상, noise 0%               |

“Decision 재사용”은 단순 검색 노출이 아니다. 과거 decision ID가 새 brief의 `CARRIED` 항목, evidence/source ref, 구현 선택 설명, 또는 리뷰 근거 중 하나에 인용되고 실제 선택에 영향을 줘야 한다.

## 작업별 기록 양식

```text
task_id:
complexity: small | medium | large
eligible_for_brief: true | false
exclusion_reason:
brief_active_minutes:
total_active_minutes:
rework_minutes:
decision_caused_rework_minutes:
repeat_domain: true | false
reused_decision_ids: []
reuse_effect:
trace_files_expected: []
trace_noise_files: []
satisfaction_clarity_1_to_5:
satisfaction_overhead_1_to_5:
satisfaction_recall_1_to_5:
notes:
```

주간 review에서 raw 기록과 Git/decision source를 대조한다. 만족도 응답은 개인 평가에 사용하지 않고 집계값만 공유한다.

## Go / No-Go 결정

Go는 다음 조건을 모두 만족할 때 권장한다.

1. medium/large 작업의 median brief 절차 비용이 전체 활성 작업 시간의 15% 이하이다.
2. 반복 영역 eligible 작업의 30% 이상에서 과거 decision이 실제로 활용된다.
3. decision 위반·scope 오해로 인한 재작업률이 matched baseline보다 감소한다.
4. 사용자 만족도 평균이 3.8/5 이상이고 심각한 데이터 손실이나 부분 commit이 없다.
5. trace noise가 0%이고 실제 구현 파일 포착률이 95% 이상이다.

No-Go 또는 재설계는 다음 중 하나라도 해당하면 권장한다.

- 절차 비용이 15%를 초과하고 2주 연속 개선되지 않는다.
- 재사용률이 20% 미만이거나 recall 결과가 반복적으로 잘못된 현재 decision처럼 해석된다.
- 재작업률이 baseline보다 증가한다.
- canonical source 손상, 동시 writer 데이터 손실, 복구 불가능한 cache 문제가 한 번이라도 발생한다.
- 만족도 평균이 3.0 미만이거나 1–2점 응답이 30%를 넘는다.

20–30% 재사용률, 3.0–3.8 만족도처럼 경계 구간이면 2주간 한 번의 개선 iteration을 수행하고 다시 측정한다. 이때 small 작업 경량화, 질문 수, context relevance를 먼저 조정하며 기준 자체를 사후 완화하지 않는다.
