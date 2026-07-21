import type {
  BriefSnapshot,
  ContextItem,
  Decision,
  EventRecord,
  Evidence,
  ImplementationTrace,
  EvaluationRecord,
  Question,
  Task,
} from '../../types/index.js';

export interface SourceBundle {
  tasks: Task[];
  decisions: Decision[];
  questions: Question[];
  evidence: Evidence[];
  contextItems: ContextItem[];
  briefSnapshots: BriefSnapshot[];
  implementationTraces: ImplementationTrace[];
  evaluations: EvaluationRecord[];
  events: EventRecord[];
}

export interface TaskSourceDocument {
  task: Task;
  questions: Question[];
  evidence: Evidence[];
  contextItems: ContextItem[];
  briefSnapshots: BriefSnapshot[];
  evaluations?: EvaluationRecord[];
  events: EventRecord[];
}

export interface DecisionSourceDocument {
  decision: Decision;
}

export interface TraceSourceDocument {
  trace: ImplementationTrace;
}

export type SourceDocument = TaskSourceDocument | DecisionSourceDocument | TraceSourceDocument;

export interface SourceWriteResult {
  written: string[];
}
