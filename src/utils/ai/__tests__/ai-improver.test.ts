import { describe, it, expect } from 'vitest';
import { DynamicLocalAIService } from '../ai-service';

describe('ai-improver service utilities', () => {
  it('should generate simulated rewrite alternatives in local fallback mode', async () => {
    const service = new DynamicLocalAIService();
    const result = await service.improveText('Senior software engineer', 'More professional', 'title');
    
    expect(result.alternatives).toHaveLength(3);
    expect(result.alternatives[0]).toContain('engineer');
  });

  it('should generate alternatives for different tones', async () => {
    const service = new DynamicLocalAIService();
    const resultConcise = await service.improveText('Frontend dev', 'More concise', 'aboutMe');
    const resultTechnical = await service.improveText('Frontend dev', 'More technical', 'aboutMe');
    
    expect(resultConcise.alternatives[0]).not.toBe(resultTechnical.alternatives[0]);
  });
});
