import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { ConfigService } from '@nestjs/config';
import { LlmGenerationConfig, LlmProvider } from './llm.provider.interface';

@Injectable()
export class GroqProvider implements LlmProvider {
  private groq: Groq;
  private readonly logger = new Logger(GroqProvider.name);
  
  // Defaulting to llama3-70b-8192 for high intelligence tasks
  private readonly MODEL = 'llama3-70b-8192';

  constructor(private configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY') || 'mock-key',
    });
  }

  async generate(config: LlmGenerationConfig): Promise<string> {
    this.logger.debug(`Generating with Groq model: ${this.MODEL}`);
    
    const completion = await this.groq.chat.completions.create({
      model: this.MODEL,
      max_tokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.7,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: config.userPrompt }
      ],
    });

    if (completion.choices[0]?.message?.content) {
      return completion.choices[0].message.content;
    }
    
    throw new Error('Unexpected response type from Groq');
  }

  async generateJson<T>(config: LlmGenerationConfig): Promise<T> {
    // For JSON, Groq supports response_format: { type: 'json_object' }
    // But we still need to instruct it via system prompt
    const jsonSystemPrompt = `${config.systemPrompt}\n\nIMPORTANT: You must respond ONLY with a valid JSON object.`;
    
    const completion = await this.groq.chat.completions.create({
      model: this.MODEL,
      max_tokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: jsonSystemPrompt },
        { role: 'user', content: config.userPrompt }
      ],
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('Groq did not return valid JSON');
    }

    try {
      return JSON.parse(responseText.trim()) as T;
    } catch (error) {
      this.logger.error(`Failed to parse JSON response: ${responseText}`);
      throw new Error('LLM did not return valid JSON');
    }
  }
}
