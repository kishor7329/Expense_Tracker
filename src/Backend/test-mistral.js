const path = require("path");
require("dotenv").config({ path: "../../.env" });

const { Mistral } = require("@mistralai/mistralai");

async function testMistral() {
  console.log("Testing Mistral API...");
  console.log("API Key:", process.env.MISTRAL_API_KEY ? "Found" : "NOT FOUND");

  if (!process.env.MISTRAL_API_KEY) {
    console.error("❌ No API key found");
    return;
  }

  try {
    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    const response = await client.chat.complete({
      model: "mistral-tiny",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 50,
    });
    console.log("✅ Success:", response.choices[0].message.content);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testMistral();
