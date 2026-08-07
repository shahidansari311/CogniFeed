import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  
  DATABASE_URL: z.string().url(),
  
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  
  ANTHROPIC_API_KEY: z.string().min(1, "Anthropic API key is required"),
  OPENAI_API_KEY: z.string().optional(),
  
  SERPER_API_KEY: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),
  
  JWT_SECRET: z.string().min(8),
  CORS_ORIGIN: z.string().url(),
}).refine(data => data.SERPER_API_KEY || data.TAVILY_API_KEY, {
  message: "At least one search API key (SERPER_API_KEY or TAVILY_API_KEY) must be provided",
  path: ["SERPER_API_KEY"],
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment variables');
  }
  return result.data;
}
