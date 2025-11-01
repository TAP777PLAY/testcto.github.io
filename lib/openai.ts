import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.warn('Warning: OPENAI_API_KEY is not defined. AI functionality will be disabled.');
}

export const openai = openaiApiKey
  ? new OpenAI({
      apiKey: openaiApiKey,
      organization: process.env.OPENAI_ORG_ID,
    })
  : null;

export async function generateText(prompt: string, maxTokens: number = 500): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY.');
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Вы - помощник по созданию контента для веб-сайтов. Отвечайте на русском языке.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || '';
}

export async function generatePageContent(
  title: string,
  description?: string
): Promise<{ blocks: any[] }> {
  if (!openai) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY.');
  }

  const prompt = `Создайте контент для веб-страницы с заголовком "${title}"${
    description ? ` и описанием "${description}"` : ''
  }.
  
Верните JSON структуру с массивом блоков. Каждый блок должен иметь:
- type: 'heading' | 'text' | 'button' | 'image'
- content: объект с контентом блока

Для heading: { text: string, level: 'h1' | 'h2' | 'h3' }
Для text: { text: string }
Для button: { text: string, link: string, style: 'primary' | 'secondary' }
Для image: { url: string, alt: string }

Создайте привлекательный и полезный контент на русском языке.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Вы - эксперт по созданию веб-контента. Возвращайте только валидный JSON без дополнительного текста.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 1000,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{"blocks": []}';
  return JSON.parse(content);
}

export async function improveText(text: string): Promise<string> {
  const prompt = `Улучшите следующий текст для веб-сайта, сделав его более профессиональным и привлекательным, но сохраняя основной смысл:

${text}`;

  return generateText(prompt, 800);
}

export async function generateSEOMetadata(
  pageTitle: string,
  pageContent: string
): Promise<{ metaTitle: string; metaDescription: string; keywords: string[] }> {
  if (!openai) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY.');
  }

  const prompt = `На основе заголовка страницы "${pageTitle}" и контента создайте SEO метаданные.
Верните JSON с полями:
- metaTitle: оптимизированный заголовок (до 60 символов)
- metaDescription: описание (до 160 символов)
- keywords: массив ключевых слов (5-10 слов)

Контент страницы:
${pageContent.substring(0, 500)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Вы - эксперт по SEO. Возвращайте только валидный JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 300,
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  const content =
    response.choices[0]?.message?.content ||
    '{"metaTitle":"","metaDescription":"","keywords":[]}';
  return JSON.parse(content);
}
