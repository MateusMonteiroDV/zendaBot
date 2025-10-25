import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
console.log("Using key:", process.env.GROQ_API_KEY);

(async () => {
  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Hello" }],
      model: "llama-3.3-70b-versatile",
    });
    console.log(response.choices[0].message.content);
  } catch (err) {
    //@ts-ignore
    console.error("Error:", err.message);
  }
})();
