/**
 * Performs basic formatting with state-aware parsing.
 * Rules:
 * 1. Normalize line breaks.
 * 2. Identify sentence endings (., ?, !, etc.).
 * 3. Handle multiple punctuation (e.g., ?!, !!!).
 * 4. CRITICAL: Protect content inside quotes (do not split sentences inside quotes).
 * 5. Include closing quotation marks or brackets if they immediately follow the punctuation.
 * 6. Add double newline after the complete sentence unit.
 */
export const basicFormat = (text: string): string => {
  if (!text) return '';

  const chunks: string[] = [];
  let buffer = '';
  
  // State for quotes
  let inSmartQuote = 0; // Tracks nesting for “” ‘’
  let inStraightQuote = false; // Toggles for ""

  // Helpers
  const isPunctuation = (c: string) => /[。\.?!？！]/.test(c);
  const isClosingPunctuation = (c: string) => /[”"’'\)）\]】]/.test(c);
  const isOpener = (c: string) => /[“‘]/.test(c);
  const isCloser = (c: string) => /[”’]/.test(c);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    buffer += char;

    // 1. Update Quote State
    if (isOpener(char)) {
      inSmartQuote++;
    } else if (isCloser(char)) {
      if (inSmartQuote > 0) inSmartQuote--;
    } else if (char === '"') {
      inStraightQuote = !inStraightQuote;
    }

    // 2. Check for Sentence End
    if (isPunctuation(char)) {
      // 2a. Consume continuous punctuation (e.g. !!! or 。。。)
      while (i + 1 < text.length && isPunctuation(text[i+1])) {
        const nextChar = text[i+1];
        buffer += nextChar;
        i++;
      }

      // 2b. Consume closing brackets/quotes immediately following
      while (i + 1 < text.length && isClosingPunctuation(text[i+1])) {
        const nextChar = text[i+1];
        buffer += nextChar;
        
        // IMPORTANT: Update state for consumed closing chars so we know we are 'out'
        if (isCloser(nextChar)) {
           if (inSmartQuote > 0) inSmartQuote--;
        } else if (nextChar === '"') {
           inStraightQuote = !inStraightQuote;
        }
        
        i++;
      }

      // 3. Determine if we should split
      // Only split if we are NOT inside quotes
      if (inSmartQuote === 0 && !inStraightQuote) {
        chunks.push(buffer.trim());
        buffer = '';
      }
    }
  }

  // Push remaining buffer
  if (buffer.trim()) {
    chunks.push(buffer.trim());
  }

  // Join with double newlines
  return chunks.filter(c => c.length > 0).join('\n\n');
};

export const countSentences = (text: string): number => {
  // Simple approximation for UI stats
  const matches = text.match(/[。\.?!？！]+/g);
  return matches ? matches.length : 0;
};