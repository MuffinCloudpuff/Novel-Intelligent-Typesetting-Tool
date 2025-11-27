import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Uses Gemini to smartly format the text.
 * This is useful for edge cases (e.g., "Mr. Smith" where "." isn't a sentence end)
 * or for fixing mixed punctuation.
 */
export const smartFormatWithGemini = async (text: string): Promise<string> => {
  if (!text.trim()) return "";

  const ai = getAiClient();

  const prompt = `
    You are an expert text formatting engine.
    
    OBJECTIVE:
    Format the input text so that each valid sentence unit is separated by an empty line (double line break).
    
    CORE RULES:
    1. SEPARATOR: Separate each valid sentence unit with a DOUBLE NEWLINE (\\n\\n).
    2. ENDING PUNCTUATION: Sentences end with Period (.), Chinese Period (。), Question Mark (? ？), Exclamation (! ！).
    3. MULTIPLE PUNCTUATION: Treat sequences like "!!!", "?!", "......", "???" as a SINGLE ending punctuation. Do NOT split between them.
    4. QUOTE PROTECTION (CRITICAL): 
       - Content entirely inside quotation marks ("" or “”) should be treated as a SINGLE unit. 
       - Do NOT break lines inside a quote, even if it contains multiple sentences.
       - Example Input: He said, "I am here. Wait for me."
       - Example Output: He said, "I am here. Wait for me." (One line)
    5. CLOSING PUNCTUATION INCLUSION: 
       - If a sentence ends with punctuation followed by closing quotes/brackets (” " ’ ' ) ] } 】 ）), keep them attached to the sentence.
       - Break the line AFTER the closing mark.
    
    INSTRUCTIONS:
    1. Preserve all original wording, spelling, and non-structural punctuation exactly.
    2. Do not treat abbreviations (like "Mr.", "U.S.A.", "No. 1") as sentence endings.
    3. Return ONLY the formatted text.
    
    Input Text:
    """
    ${text}
    """
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini formatting error:", error);
    throw error;
  }
};