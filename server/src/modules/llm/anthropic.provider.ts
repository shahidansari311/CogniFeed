import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { LlmGenerationConfig, LlmProvider } from './llm.provider.interface';

@Injectable()
export class AnthropicProvider implements LlmProvider {
  private anthropic: Anthropic;
  private readonly logger = new Logger(AnthropicProvider.name);
  
  // Default to Claude 3.5 Sonnet for optimal intelligence/speed/cost ratio
  private readonly MODEL = 'claude-3-5-sonnet-20241022';

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async generate(config: LlmGenerationConfig): Promise<string> {
    this.logger.debug(`Generating with ${this.MODEL}`);
    
    const msg = await this.anthropic.messages.create({
      model: this.MODEL,
      max_tokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.7,
      system: config.systemPrompt,
      messages: [
        { role: 'user', content: config.userPrompt }
      ],
    });

    if (msg.content[0].type === 'text') {
      return msg.content[0].text;
    }
    
    throw new Error('Unexpected response type from Anthropic');
  }

  async generateJson<T>(config: LlmGenerationConfig): Promise<T> {
    // For JSON, we inject a strong system instruction to only output JSON
    const jsonSystemPrompt = `${config.systemPrompt}\n\nIMPORTANT: You must respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json or any conversational text.`;
    
    const responseText = await this.generate({
      ...config,
      systemPrompt: jsonSystemPrompt,
    });

    try {
      // Clean potential markdown wrapped JSON just in case the model ignored the instruction
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      }
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      
      return JSON.parse(cleanText) as T;
    } catch (error) {
      this.logger.error(`Failed to parse JSON response: ${responseText}`);
      throw new Error('LLM did not return valid JSON');
    }
  }
}
