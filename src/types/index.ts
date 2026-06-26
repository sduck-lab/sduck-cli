export type TaskStatus = 'OPEN' | 'BRIEF_READY' | 'CONFIRMED' | 'CLOSED' | 'ABANDONED';

export type DecisionKind = 'EXPLICIT' | 'INFERRED' | 'CARRIED' | 'CONFLICT' | 'OPEN';

export type DecisionStatus = 'DRAFT' | 'CONFIRMED' | 'REJECTED' | 'SUPERSEDED';

export type EvidenceSourceType =
  | 'USER_ANSWER'
  | 'CODE'
  | 'DECISION_DOC'
  | 'IMPLEMENTATION_TRACE'
  | 'GRAPHIFY_REPORT'
  | 'GRAPHIFY_GRAPH'
  | 'DISCOVERY';

export type ContextSourceType =
  | 'DISCOVERY'
  | 'FILE'
  | 'GRAPHIFY_REPORT'
  | 'GRAPHIFY_GRAPH'
  | 'MEMORY';

export type EventType =
  | 'TASK_CREATED'
  | 'CONTEXT_INDEXED'
  | 'CONTEXT_ITEM_ADDED'
  | 'DRAFT_SUBMITTED'
  | 'QUESTION_ANSWERED'
  | 'DECISION_CREATED'
  | 'BRIEF_CONFIRMED'
  | 'TRACE_CREATED'
  | 'EXPORT_WRITTEN'
  | 'TASK_CLOSED'
  | 'TASK_ABANDONED';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  expectedScope: string[];
  avoidScope: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  taskId: string;
  title: string;
  kind: DecisionKind;
  status: DecisionStatus;
  confidence: number;
  summary: string;
  rationale: string[];
  appliesTo: string[];
  avoids: string[];
  sourceRefs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  taskId: string;
  decisionId: string | null;
  sourceType: EvidenceSourceType;
  sourceRef: string;
  summary: string;
  confidence: number;
  createdAt: string;
}

export interface Question {
  id: string;
  taskId: string;
  decisionId: string | null;
  text: string;
  recommendedAnswer: string;
  rationale: string[];
  options: string[];
  answered: boolean;
  answer: string | null;
  createdAt: string;
}

export interface ContextItem {
  id: string;
  taskId: string;
  sourceType: ContextSourceType;
  sourceRef: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface DecisionToCodeMap {
  decisionId: string;
  files: string[];
  summary: string;
  score?: number;
  reason?: string;
}

export interface UnmappedDecisionReview {
  decisionId: string;
  summary: string;
  reason: string;
  score: number;
  files?: string[];
  appliesTo?: string[];
}

export interface ImplementationTrace {
  id: string;
  taskId: string;
  decisionIds: string[];
  filesChanged: string[];
  summary: string;
  decisionToCodeMap: DecisionToCodeMap[];
  unmappedDecisions?: UnmappedDecisionReview[];
  createdAt: string;
}

export interface BriefView {
  task: Task;
  decisions: Record<DecisionKind, Decision[]>;
  questions: Question[];
  evidence: Evidence[];
  expectedScope: string[];
  avoidScope: string[];
  openQuestionCount: number;
}

export interface BriefSnapshot {
  id: string;
  taskId: string;
  snapshot: BriefView;
  renderedMarkdown: string;
  createdAt: string;
}

export interface EventRecord {
  id: string;
  taskId: string | null;
  type: EventType;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface StatusView {
  task: Task | null;
  indicators: {
    contextItems: number;
    draftSubmissions: number;
    questionsOpen: number;
    questionsAnswered: number;
    decisionsByKind: Record<DecisionKind, number>;
    briefSnapshots: number;
    implementationTraces: number;
    exports: number;
  };
}

export interface ContextPack {
  task: Task;
  items: ContextItem[];
  evidence: Evidence[];
  priorDecisions: Decision[];
  priorTraces: ImplementationTrace[];
  grillMeProtocol: string[];
  grillMePrompt: string;
  grillMeChecklist: string[];
  draftSchemaExample: SduckDraft;
}

export interface DraftDecision {
  id?: string;
  title: string;
  kind: DecisionKind;
  status?: DecisionStatus;
  confidence?: number;
  summary: string;
  rationale?: string[];
  appliesTo?: string[];
  avoids?: string[];
  sourceRefs?: string[];
}

export interface DraftQuestion {
  id?: string;
  decisionId?: string;
  text: string;
  recommendedAnswer: string;
  rationale?: string[];
  options?: string[];
}

export interface DraftEvidence {
  id?: string;
  decisionId?: string;
  sourceType: EvidenceSourceType;
  sourceRef: string;
  summary: string;
  confidence?: number;
}

export interface SduckDraft {
  schemaVersion: 'v2alpha1';
  taskId?: string;
  decisions?: DraftDecision[];
  questions?: DraftQuestion[];
  evidence?: DraftEvidence[];
  expectedScope?: string[];
  avoidScope?: string[];
}

export interface TraceView {
  trace: ImplementationTrace;
  filesChanged: string[];
}

export interface RecallResult {
  query: string;
  decisions: Decision[];
  traces: ImplementationTrace[];
}
