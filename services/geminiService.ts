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
    Format the input text so that each complete sentence is separated by an empty line (double line break).
    
    DEFINITION OF A SENTENCE UNIT:
    1. A sentence ends with a terminal punctuation mark: Period (.), Chinese Period (。), Question Mark (?/？), or Exclamation Mark (!/！).
    2. CRITICAL RULE: If the terminal punctuation is immediately followed by closing quotation marks (” " ’ ') or closing parentheses () ）), these closing marks BELONG to the sentence. Do NOT split the line between the punctuation and the closing mark.
    
    Example of CORRECT behavior:
    Input: He asked, "Are you ready?" The game began.
    Output: 
    He asked, "Are you ready?"
    
    The game began.
    
    Example of INCORRECT behavior (Do NOT do this):
    Input: He asked, "Are you ready?" The game began.
    Output: 
    He asked, "Are you ready?
    " The game began.
    
    INSTRUCTIONS:
    1. Preserve all original wording, spelling, and non-structural punctuation exactly.
    2. Do not treat abbreviations (like "Mr.", "U.S.A.", "No. 1") as sentence endings.
    3. Ensure there is exactly one empty line (two newlines) between valid sentence units.
    4. Return ONLY the formatted text.
    
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