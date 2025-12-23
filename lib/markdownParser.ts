import { TypingSnippetFormData, SUPPORTED_LANGUAGES } from '@/models/typingSnippet';

interface ParsedSnippet {
  title: string;
  code: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language?: string;
}

interface ParseResult {
  language: string;
  languageName: string;
  snippets: ParsedSnippet[];
  errors: string[];
}

/**
 * Parse markdown content into typing snippets
 *
 * Expected format:
 *
 * # Language Name (e.g., # React Snippets, # Go)
 *
 * ## Snippet Title
 * - difficulty: easy|medium|hard
 *
 * ```language
 * code here
 * ```
 */
export function parseMarkdownToSnippets(content: string): ParseResult {
  const errors: string[] = [];
  const snippets: ParsedSnippet[] = [];

  // Extract language from first h1
  const h1Match = content.match(/^#\s+(.+?)(?:\s+Snippets?)?\s*$/m);
  let detectedLanguage = 'other';
  let languageName = 'Other';

  if (h1Match) {
    const langText = h1Match[1].trim().toLowerCase();
    // Try to match with supported languages
    const matched = SUPPORTED_LANGUAGES.find(
      (l) => l.name.toLowerCase() === langText || l.id === langText
    );
    if (matched) {
      detectedLanguage = matched.id;
      languageName = matched.name;
    } else {
      languageName = h1Match[1].trim();
    }
  }

  // Split by h2 headers (## Title)
  const sections = content.split(/(?=^##\s+)/m);

  for (const section of sections) {
    if (!section.trim() || section.startsWith('# ')) continue;

    // Extract title from h2
    const titleMatch = section.match(/^##\s+(.+)$/m);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();

    // Extract difficulty
    const difficultyMatch = section.match(/[-*]\s*difficulty:\s*(easy|medium|hard)/i);
    const difficulty = (difficultyMatch?.[1]?.toLowerCase() || 'medium') as 'easy' | 'medium' | 'hard';

    // Extract code block
    const codeBlockMatch = section.match(/```(\w+)?\n([\s\S]*?)```/);
    if (!codeBlockMatch) {
      errors.push(`No code block found for "${title}"`);
      continue;
    }

    const codeLanguage = codeBlockMatch[1];
    const code = codeBlockMatch[2].trim();

    if (!code) {
      errors.push(`Empty code block for "${title}"`);
      continue;
    }

    // If code block has language hint, try to use it
    let snippetLanguage = detectedLanguage;
    if (codeLanguage) {
      const langFromCode = SUPPORTED_LANGUAGES.find(
        (l) => l.id === codeLanguage.toLowerCase() ||
               l.name.toLowerCase() === codeLanguage.toLowerCase()
      );
      if (langFromCode) {
        snippetLanguage = langFromCode.id;
      }
    }

    snippets.push({
      title,
      code,
      difficulty,
      language: snippetLanguage,
    });
  }

  if (snippets.length === 0) {
    errors.push('No valid snippets found in the markdown file');
  }

  return {
    language: detectedLanguage,
    languageName,
    snippets,
    errors,
  };
}

/**
 * Convert parsed snippets to form data ready for saving
 */
export function convertToFormData(
  parseResult: ParseResult,
  isPublic: boolean = false
): TypingSnippetFormData[] {
  return parseResult.snippets.map((snippet) => ({
    language: snippet.language || parseResult.language,
    languageName: parseResult.languageName,
    title: snippet.title,
    code: snippet.code,
    difficulty: snippet.difficulty,
    isPublic,
  }));
}

/**
 * Generate sample markdown template
 */
export function generateMarkdownTemplate(language: string = 'JavaScript'): string {
  return `# ${language} Snippets

## Hello World
- difficulty: easy

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

## Arrow Function
- difficulty: easy

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

## Async/Await
- difficulty: medium

\`\`\`javascript
async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}
\`\`\`
`;
}

/**
 * Validate markdown content before parsing
 */
export function validateMarkdown(content: string): { valid: boolean; message: string } {
  if (!content.trim()) {
    return { valid: false, message: 'Markdown content is empty' };
  }

  if (!content.includes('```')) {
    return { valid: false, message: 'No code blocks found (use ``` to create code blocks)' };
  }

  if (!content.match(/^##\s+/m)) {
    return { valid: false, message: 'No snippet titles found (use ## to create titles)' };
  }

  return { valid: true, message: 'Markdown format is valid' };
}
