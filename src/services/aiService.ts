import OpenAI from 'openai';
import { AIResponseData } from '@/hooks/useAIResponse';

class AIService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
      throw new Error('NEXT_PUBLIC_OPENROUTER_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://jsoninsight.com',
        'X-Title': 'JsonInsight',
      },
      dangerouslyAllowBrowser: true
    });
  }

  // 构建分析JSON的prompt模板
  private buildPrompt(jsonData: string): string {
    const prompt = `
你是一个资深前端开发者，请帮我分析以下 JSON 数据。

输出格式严格如下：

1. 简短总结：这个 JSON 接口的整体功能是什么？
2. 字段解释：每条包含：
   - 字段路径
   - 字段含义（结合上下文判断）
   - 字段类型
3. TypeScript interface 类型定义，字段命名保持一致，嵌套结构清晰展开
4. 接口说明文档：用中文说明每个字段的用途，适合 PM 或文档写作使用

请开始分析以下 JSON，并严格按照以下 JSON 结构返回你的回答：

{
  "summary": "string，接口整体功能描述",
  "fields": [
    {
      "path": "字段路径",
      "type": "字段类型",
      "description": "字段含义"
    }
  ],
  "typescript": "TypeScript interface 类型定义，字段命名保持一致，嵌套结构清晰展开",
  "doc": "接口说明文档，用中文说明每个字段的用途，适合 PM 或文档写作使用"
}

以下是要分析的 JSON 数据：

{{json_here}}
    `.trim();

    return prompt.replace('{{json_here}}', jsonData);
  }

  // 解析AI返回的JSON响应
  private parseAIResponse(content: string): AIResponseData {
    try {
      // 清除可能的markdown标记
      const cleanContent = content.replace(/^```json\s*|\s*```$/g, '').trim();
      console.log('调用大模型解析后得到的 json 数据',cleanContent);
      const parsed = JSON.parse(cleanContent);
      
      // 验证返回的数据结构
      if (!parsed.summary || !parsed.fields || !parsed.typescript || !parsed.doc) {
        throw new Error('AI返回的数据结构不完整');
      }

      return {
        summary: parsed.summary,
        fields: Array.isArray(parsed.fields) ? parsed.fields : [],
        typescript: parsed.typescript,
        doc: parsed.doc
      };
    } catch (error) {
      console.error('解析AI响应失败:', error);
      throw new Error('AI返回的数据格式无法解析，请重试');
    }
  }

  // 分析JSON结构的主要方法
  async analyzeJsonStructure(jsonInput: string): Promise<AIResponseData> {
    try {
      // 验证输入的JSON格式
      let parsedJson;
      try {
        parsedJson = JSON.parse(jsonInput);
      } catch {
        throw new Error('输入的JSON格式不正确');
      }

      // 构建prompt
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      const prompt = this.buildPrompt(formattedJson);

      console.log('🚀 开始调用AI分析接口...');

      // 调用OpenRouter API
      const completion = await this.openai.chat.completions.create({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      const responseContent = completion.choices[0]?.message?.content;
      
      if (!responseContent) {
        throw new Error('AI没有返回有效的分析结果');
      }

      console.log('✅ AI分析完成');

      // 解析AI返回的结果
      return this.parseAIResponse(responseContent);

    } catch (error) {
      console.error('AI分析出错:', error);
      
      if (error instanceof Error) {
        // 处理特定的错误类型
        if (error.message.includes('rate limit')) {
          throw new Error('请求过于频繁，请稍后重试');
        } else if (error.message.includes('unauthorized')) {
          throw new Error('API密钥无效，请检查配置');
        } else if (error.message.includes('network')) {
          throw new Error('网络连接失败，请检查网络后重试');
        }
        throw error;
      }
      
      throw new Error('分析过程中发生未知错误，请重试');
    }
  }
}

// 导出单例实例
export const aiService = new AIService();
