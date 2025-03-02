import OpenAI, { ClientOptions } from 'openai';
import type { RequestOptions } from 'openai/core.mjs';

type QueryOpts = {
  /**
   * OpenAI model name, example: deepseek-chat
   */
  model: string;
  /**
   * OpenAI client options
   * QueryAi.init() will be called with these options
   */
  openAiOpts?: ClientOptions;
  openai?: OpenAI;
};
export class QueryAI {
  private openai: OpenAI;
  model?: string;
  constructor(opts?: QueryOpts) {
    this.model = opts?.model;
    if (opts?.openai) {
      this.openai = opts.openai;
    } else if (opts?.openAiOpts) {
      this.init(opts?.openAiOpts);
    }
  }
  init(opts: ClientOptions) {
    this.openai = new OpenAI(opts);
  }
  async query(prompt: string, opts?: RequestOptions) {
    return this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
      stream: false,
      ...opts,
    });
  }
  async queryAsync(prompt: string, opts?: RequestOptions) {
    return this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
      stream: true,
      ...opts,
    });
  }
}

export { OpenAI };
