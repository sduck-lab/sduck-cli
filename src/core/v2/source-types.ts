import type {
  BriefSnapshot,
  ContextItem,
  Decision,
  EventRecord,
  Evidence,
  ImplementationTrace,
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
  events: EventRecord[];
}

export interface TaskSourceDocument {
  task: Task;
  questions: Question[];
  evidence: Evidence[];
  contextItems: ContextItem[];
  briefSnapshots: BriefSnapshot[];
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
