import axios from 'axios';

const HF_API_URL = 'https://hellord789456--roommate-matcher-ai.hf.space/run/predict';

export async function callHuggingFaceModel(prompt) {
  try {
    const response = await axios.post(HF_API_URL, {
      data: [prompt]
    });

    const generatedText = response.data?.data?.[0];
    return generatedText || "No response from Hugging Face model.";

  } catch (err) {
    console.error("AI Match Failed:", err.response?.data || err.message);
    throw new Error("AI matching failed.");
  }
}
