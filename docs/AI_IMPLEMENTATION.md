# Enhanced AI Content Generation & Optimization Engine

## Overview

This implementation provides production-ready AI-powered content generation for the Amplify Creator Platform, integrating with OpenAI (GPT-4, GPT-3.5) and Anthropic (Claude) APIs.

## Features

### 1. AI Provider Integration (`AIProviderService.ts`)
- **Multi-provider support**: OpenAI and Anthropic Claude
- **Automatic failover**: Falls back to alternative provider if primary fails
- **Cost tracking**: Tracks token usage and API costs in real-time
- **Rate limiting**: Prevents API quota overuse
- **Caching**: Reduces costs by caching responses (60-minute TTL)
- **Error handling**: Comprehensive error handling with retry logic

### 2. Enhanced Content Generation (`AIContentGenerationService.ts`)
- **Viral Content Ideas**: AI-generated content ideas with viral potential scoring
- **Smart Captions**: Platform-optimized captions with engagement predictions
- **Hashtag Research**: AI-powered hashtag generation and trending analysis
- **Viral Prediction**: Hybrid AI + statistical analysis for content performance
- **A/B Testing**: Generate caption variants for testing

### 3. Brand Voice Learning (`BrandVoiceAnalyzer.ts`)
- **Automatic Analysis**: Analyzes existing content to learn brand voice
- **Voice Profiles**: Creates reusable brand voice profiles
- **Continuous Learning**: Updates profiles based on content performance
- **Statistical Analysis**: Extracts tone, style, vocabulary patterns

### 4. Usage Tracking (`AIUsageTracker.ts`)
- **Cost Monitoring**: Track AI API costs per workspace/user
- **Rate Limiting**: Enforce usage limits
- **Analytics**: Detailed usage statistics and trends
- **Error Tracking**: Monitor and analyze API failures

### 5. Intelligent Caching (`AICache.ts`)
- **Response Caching**: Cache AI responses to reduce costs
- **Smart Invalidation**: Automatic cleanup of expired entries
- **Hit Rate Tracking**: Monitor cache effectiveness
- **Cost Savings**: Track money saved through caching

## Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
# OpenAI Configuration (Optional)
VITE_OPENAI_API_KEY=sk-...

# Anthropic Configuration (Optional)
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

**Note**: At least one AI provider API key is required. Both can be configured for automatic failover.

### 2. API Keys

#### OpenAI
1. Sign up at https://platform.openai.com
2. Navigate to API Keys section
3. Create a new API key
4. Add to environment as `VITE_OPENAI_API_KEY`

#### Anthropic
1. Sign up at https://console.anthropic.com
2. Navigate to API Keys
3. Create a new API key
4. Add to environment as `VITE_ANTHROPIC_API_KEY`

### 3. Configuration

The AI system is configured in `/src/config/ai.config.ts`:

```typescript
{
  defaultProvider: 'openai',
  defaultModel: 'gpt-3.5-turbo',
  rateLimit: {
    maxRequestsPerMinute: 60,
    maxTokensPerMinute: 100000,
    maxCostPerDay: 100, // $100/day
  },
  cache: {
    enabled: true,
    ttlMinutes: 60,
    maxSize: 1000,
  },
  fallback: {
    enabled: true,
    providers: ['openai', 'anthropic'],
  },
}
```

## Usage Examples

### Generate Content Ideas

```typescript
import { AIContentGenerationService } from '@/services/ai';

const ideas = await AIContentGenerationService.generateContentIdeas({
  workspace_id: workspaceId,
  user_id: userId,
  niche: 'fitness',
  target_audience: {
    age_range: '25-35',
    interests: ['health', 'wellness', 'workout'],
  },
  content_types: ['reel', 'post'],
  count: 5,
});
```

### Generate Platform-Optimized Captions

```typescript
const caption = await AIContentGenerationService.generateCaption({
  workspace_id: workspaceId,
  user_id: userId,
  platform: 'instagram',
  topic: '5 Morning Workout Tips',
  context: 'Quick and effective workout routines',
  brand_voice_id: brandVoiceId, // Optional
});
```

### Create Brand Voice Profile

```typescript
import { BrandVoiceAnalyzer } from '@/services/ai';

const profile = await BrandVoiceAnalyzer.analyzeAndCreateProfile({
  workspaceId,
  userId,
  name: 'Energetic Fitness Coach',
  description: 'High-energy, motivational fitness content',
  minSamples: 10, // Analyze last 10 captions
});
```

### Generate Hashtags

```typescript
const hashtags = await AIContentGenerationService.generateHashtags({
  workspace_id: workspaceId,
  user_id: userId,
  niche: 'fitness',
  platform: 'instagram',
  count: 10,
});
```

### Predict Viral Potential

```typescript
const prediction = await AIContentGenerationService.predictViralPotential({
  workspace_id: workspaceId,
  user_id: userId,
  content_type: 'reel',
  platform: 'tiktok',
  title: '5 Minute Morning Workout',
  description: 'Quick and effective workout routine...',
  niche: 'fitness',
});
```

## Cost Management

### Model Pricing (per 1K tokens)

| Model | Input Cost | Output Cost |
|-------|-----------|-------------|
| GPT-4 | $0.03 | $0.06 |
| GPT-4 Turbo | $0.01 | $0.03 |
| GPT-3.5 Turbo | $0.0005 | $0.0015 |
| Claude Opus | $0.015 | $0.075 |
| Claude Sonnet | $0.003 | $0.015 |
| Claude Haiku | $0.00025 | $0.00125 |

### Cost Optimization Strategies

1. **Use Caching**: Enabled by default, saves ~50% on repeated requests
2. **Choose Right Model**: Use GPT-3.5 or Claude Haiku for most tasks
3. **Set Rate Limits**: Configure daily cost limits in `ai.config.ts`
4. **Monitor Usage**: Check usage stats via `AIUsageTracker`

### Get Usage Statistics

```typescript
import { AIUsageTracker } from '@/services/ai';

const stats = await AIUsageTracker.getUsageStats(
  workspaceId,
  startDate,
  endDate
);

console.log('Total cost:', stats.totalCost);
console.log('Cache hit rate:', stats.cacheHitRate);
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         AIContentGenerationService                  │
│  (High-level content generation methods)            │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│            AIProviderService                        │
│  (Provider abstraction, failover, retry)            │
└────────┬────────────────────────┬───────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌─────────────────┐
│  OpenAI API     │      │ Anthropic API   │
│  (GPT-4, etc)   │      │ (Claude)        │
└─────────────────┘      └─────────────────┘

         ┌────────────────────────────┐
         │       AICache              │
         │  (Response caching)        │
         └────────────────────────────┘

         ┌────────────────────────────┐
         │    AIUsageTracker          │
         │  (Cost & rate tracking)    │
         └────────────────────────────┘
```

## Error Handling

The system includes comprehensive error handling:

```typescript
try {
  const ideas = await AIContentGenerationService.generateContentIdeas(...);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limit
  } else if (error.code === 'MISSING_API_KEY') {
    // API key not configured
  } else if (error.retryable) {
    // Can retry this request
  }
}
```

### Error Codes

- `RATE_LIMIT_EXCEEDED`: Daily/minute rate limit reached
- `MISSING_API_KEY`: API key not configured
- `API_ERROR`: Provider API error
- `NETWORK_ERROR`: Network/connection issue
- `VALIDATION_ERROR`: Invalid request parameters

## Security

### Best Practices

1. **Never commit API keys**: Use environment variables only
2. **Implement rate limiting**: Prevent API abuse
3. **Monitor costs**: Set up alerts for unusual usage
4. **Validate inputs**: All user inputs are validated before sending to AI
5. **Sanitize outputs**: AI responses are parsed and validated

### API Key Security

- API keys are stored in environment variables
- Keys are never exposed to client-side code
- Each workspace can have usage limits
- Failed requests are logged for audit

## Database Schema

### Required Tables

```sql
-- AI usage logs
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  operation TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost DECIMAL(10, 4) NOT NULL,
  response_time_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  cached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_ai_usage_workspace ON ai_usage_logs(workspace_id, created_at);
CREATE INDEX idx_ai_usage_user ON ai_usage_logs(user_id, created_at);
```

## Monitoring

### Cache Performance

```typescript
import { AIProviderService } from '@/services/ai';

const stats = AIProviderService.getCacheStats();
console.log('Hit rate:', stats.hitRate);
console.log('Total savings: $', stats.totalSavings);
```

### Recent Errors

```typescript
import { AIUsageTracker } from '@/services/ai';

const errors = await AIUsageTracker.getRecentErrors(workspaceId, 10);
errors.forEach(error => {
  console.log('Error:', error.error_message);
  console.log('Operation:', error.operation);
});
```

## Testing

### Mock Mode

For testing without API keys:

```typescript
// In test environment, services will gracefully degrade
// and use fallback mock data when API keys are missing
```

### Integration Testing

```typescript
import { AIProviderService } from '@/services/ai';

// Test with real API (requires API keys)
const response = await AIProviderService.generate(
  'Test prompt',
  {
    workspaceId: 'test-workspace',
    userId: 'test-user',
    operation: 'content_idea_generation',
  }
);
```

## Performance

### Typical Response Times

- **Cached responses**: < 10ms
- **GPT-3.5 Turbo**: 1-3 seconds
- **GPT-4**: 3-8 seconds
- **Claude Haiku**: 1-2 seconds
- **Claude Opus**: 3-10 seconds

### Optimization Tips

1. Use caching for repeated requests
2. Choose faster models for non-critical tasks
3. Implement request batching where possible
4. Set appropriate max_tokens limits

## Troubleshooting

### "Missing API Key" Error

- Ensure `VITE_OPENAI_API_KEY` or `VITE_ANTHROPIC_API_KEY` is set
- Check environment file is loaded correctly
- Verify API key format (starts with `sk-`)

### Rate Limit Errors

- Check current usage with `AIUsageTracker.getUsageStats()`
- Adjust rate limits in `ai.config.ts`
- Wait for rate limit reset time

### High Costs

- Enable caching (enabled by default)
- Use cheaper models (GPT-3.5, Claude Haiku)
- Reduce max_tokens in requests
- Set lower daily cost limits

## Roadmap

### Planned Features

- [ ] Fine-tuned models for specific niches
- [ ] Image generation integration (DALL-E, Midjourney)
- [ ] Video script generation
- [ ] Multi-language support
- [ ] Performance feedback loop
- [ ] Advanced A/B testing analytics

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in `AIUsageTracker`
3. Check AI provider status pages
4. Contact support team

## License

MIT License - See LICENSE file for details
