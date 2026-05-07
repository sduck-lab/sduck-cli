import { input, select } from '@inquirer/prompts';

import type { Question } from '../../types/index.js';

export async function promptForQuestionAnswer(
  question: Question,
): Promise<{ optionIndex?: number; text?: string }> {
  const choices = question.options.map((option, index) => ({ name: option, value: index + 1 }));
  choices.push({ name: '직접 입력', value: -1 });
  const selected = await select({
    message: question.text,
    choices,
  });
  if (selected === -1) {
    const text = await input({ message: '답변을 입력하세요' });
    return { text };
  }
  return { optionIndex: selected };
}
