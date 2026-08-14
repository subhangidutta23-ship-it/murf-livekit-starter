import asyncio
from dotenv import load_dotenv
load_dotenv('.env.local')
from livekit.plugins import google
from livekit.agents import llm

async def _test_model(model_name):
    print(f"\n--- Testing model: {model_name} ---")
    try:
        model = google.LLM(model=model_name)
        ctx = llm.ChatContext()
        ctx.messages().append(llm.ChatMessage(role="user", content=["Hello, test response."]))
        stream = model.chat(chat_ctx=ctx)
        full_text = ""
        async for chunk in stream:
            if hasattr(chunk, 'delta') and chunk.delta and hasattr(chunk.delta, 'content'):
                full_text += chunk.delta.content or ""
        print(f"[{model_name}] SUCCESS: '{full_text.strip()}'")
    except Exception as e:
        print(f"[{model_name}] FAILED: {e}")

async def main():
    for m in ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash", "gemini-3.5-flash-lite"]:
        await _test_model(m)

if __name__ == '__main__':
    asyncio.run(main())
