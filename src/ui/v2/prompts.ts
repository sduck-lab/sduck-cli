import { input, select } from '@inquirer/prompts';

import { enV2Messages } from './messages.js';

import type { V2MessageCatalog } from './messages.js';
import type { Question } from '../../types/index.js';

export async function promptForQuestionAnswer(
  question: Question,
  messages: V2MessageCatalog = enV2Messages,
): Promise<{ optionIndex?: number; text?: string }> {
  const choices = question.options.map((option, index) => ({ name: option, value: index + 1 }));
  choices.push({ name: messages.prompt.directInput, value: -1 });
  const selected = await select({
    message: question.text,
    choices,
  });
  if (selected === -1) {
    const text = await input({ message: messages.prompt.inputAnswer });
    return { text };
  }
  return { optionIndex: selected };
}
