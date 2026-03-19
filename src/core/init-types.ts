import type { SupportedAgentId } from './agent-rules.js';

export interface InitCommandOptions {
  force: boolean;
  agents: SupportedAgentId[];
}

export type InitMode = 'safe' | 'force';

export interface ResolvedInitOptions {
  mode: InitMode;
  agents: SupportedAgentId[];
}
