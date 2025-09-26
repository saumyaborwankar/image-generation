import OpenAI from "openai";
// import dotenv from "dotenv";

// dotenv.config();
// console.log(process.env.VITE_OPENAI_API_KEY);
export const openai = new OpenAI({
  dangerouslyAllowBrowser: true,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});
