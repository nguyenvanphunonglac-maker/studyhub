import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình API Key OpenRouter' }, { status: 500 });
    }

    const systemPrompt = "Bạn là trợ lý StudyBuddy. Trả lời bằng tiếng Việt, thân thiện và sử dụng Markdown.";

    // Danh sách model Free 2026 - Xác nhận qua API OpenRouter
    const models = [
      "qwen/qwen3-next-80b-a3b-instruct:free",
      "nvidia/nemotron-3-super-120b-a12b:free",
      "openai/gpt-oss-120b:free",
      "openai/gpt-oss-20b:free",
      "google/gemma-3-27b-it:free",
      "meta-llama/llama-3.2-3b-instruct:free",
    ];

    let errorDetails = "";

    for (const model of models) {
      try {
        console.log(`📡 Server đang thử: ${model}...`);
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://studyhub-2026.web.app",
            "X-Title": "StudyHub"
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: context ? `Ghi chú: ${context}\n\nHỏi: ${message}` : message }
            ]
          }),
          signal: AbortSignal.timeout(20000)
        });

        const data = await response.json();

        if (response.ok && data.choices?.[0]?.message?.content) {
          console.log(`✅ Thành công: ${model}`);
          return NextResponse.json({ content: data.choices[0].message.content });
        }

        errorDetails += `${model}: ${data.error?.message || response.status}\n`;
      } catch (err: any) {
        errorDetails += `${model}: ${err.message}\n`;
      }
    }

    return NextResponse.json({ error: `Tất cả model đều bận:\n${errorDetails}` }, { status: 503 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
