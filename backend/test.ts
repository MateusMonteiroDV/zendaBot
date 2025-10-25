import "dotenv/config";
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  const chat = await client.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: "Hello!" }],
  });
  console.log(chat.choices[0].message.content);
}

test().catch(console.error);
