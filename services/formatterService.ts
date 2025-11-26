/**
 * Performs basic regex-based formatting.
 * Rules:
 * 1. Normalize line breaks.
 * 2. Identify Chinese (。) and English (.) periods, question marks, and exclamation marks.
 * 3. CRITICAL: Include closing quotation marks or brackets if they immediately follow the punctuation.
 * 4. Add double newline after the complete sentence unit.
 */
export const basicFormat = (text: string): string => {
  if (!text) return '';

  let processed = text;

  // Regex Explanation:
  // ([。\.?!？！])       -> Group 1: Match sentence ending punctuation (periods, question marks, exclamation marks).
  // ([”"’'\)）\]】]*)    -> Group 2: Match zero or more closing quotes, apostrophes, or brackets immediately following the punctuation.
  // \s*                 -> Match any trailing whitespace (spaces, tabs, newlines).
  //
  // Replacement:
  // $1$2\n\n            -> Reconstruct the sentence (Punctuation + Quotes) followed by two newlines (one empty line).
  
  processed = processed.replace(/([。\.?!？！])([”"’'\)）\]】]*)\s*/g, '$1$2\n\n');

  // Cleanup: Remove triple+ newlines if they were created accidentally
  // This ensures we have exactly one empty line between paragraphs.
  processed = processed.replace(/\n{3,}/g, '\n\n');

  // Trim start/end to avoid empty whitespace at the top/bottom of the text area
  return processed.trim();
};

export const countSentences = (text: string): number => {
  // Count matches of sentence endings including their closing quotes
  // This provides a more accurate count than just counting dots.
  const matches = text.match(/[。\.?!？！][”"’'\)）\]】]*/g);
  return matches ? matches.length : 0;
};