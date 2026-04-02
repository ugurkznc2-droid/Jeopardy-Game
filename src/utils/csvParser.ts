import type { Category, Question } from '../types';
import { generateId } from './helpers';

const CORRECT_MAP: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

export interface CSVParseResult {
  categories: Category[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

/** Parse CSV text handling quoted fields with commas inside */
function splitCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/** Parse and validate CSV text into categories with questions */
export function parseCSV(text: string): CSVParseResult {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const errors: string[] = [];
  const categoryMap = new Map<string, Question[]>();

  if (lines.length === 0) {
    return { categories: [], errors: ['CSV is empty'], totalRows: 0, validRows: 0 };
  }

  // Check if first row is a header
  let startIdx = 0;
  const firstFields = splitCSVLine(lines[0]);
  if (firstFields[0]?.toLowerCase().includes('category')) {
    startIdx = 1;
  }

  let validRows = 0;
  const totalRows = lines.length - startIdx;

  for (let i = startIdx; i < lines.length; i++) {
    const rowNum = i + 1;
    const fields = splitCSVLine(lines[i]);

    if (fields.length < 8) {
      errors.push(`Row ${rowNum}: Expected 8 columns, got ${fields.length}`);
      continue;
    }

    const [category, pointsStr, questionText, choiceA, choiceB, choiceC, choiceD, correctLetter] = fields;

    if (!category) {
      errors.push(`Row ${rowNum}: Missing category name`);
      continue;
    }
    if (!questionText) {
      errors.push(`Row ${rowNum}: Missing question text`);
      continue;
    }

    const points = parseInt(pointsStr);
    if (isNaN(points) || points < 0) {
      errors.push(`Row ${rowNum}: Invalid point value "${pointsStr}"`);
      continue;
    }

    const correctIdx = CORRECT_MAP[correctLetter.toLowerCase().trim()];
    if (correctIdx === undefined) {
      errors.push(`Row ${rowNum}: Correct answer must be A, B, C, or D — got "${correctLetter}"`);
      continue;
    }

    const choices = [choiceA, choiceB, choiceC, choiceD];
    if (choices.some(c => !c)) {
      errors.push(`Row ${rowNum}: All 4 choices must be filled in`);
      continue;
    }

    const question: Question = {
      id: generateId(),
      pointValue: points,
      questionText,
      choices,
      correctChoice: correctIdx,
      answer: choices[correctIdx],
      isDailyDouble: false,
      isRevealed: false,
    };

    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(question);
    validRows++;
  }

  const categories: Category[] = Array.from(categoryMap.entries()).map(([name, questions]) => ({
    id: generateId(),
    name,
    questions,
  }));

  return { categories, errors, totalRows, validRows };
}

/** Generate a CSV template string */
export function generateCSVTemplate(): string {
  return `Category,Points,Question,Choice A,Choice B,Choice C,Choice D,Correct
Science,200,What planet is known as the Red Planet?,Venus,Mars,Jupiter,Saturn,B
Science,400,What gas do plants absorb from the atmosphere?,Oxygen,Nitrogen,Carbon dioxide,Hydrogen,C
History,200,In what year did World War II end?,1943,1944,1945,1946,C
History,400,Who was the first President of the United States?,Thomas Jefferson,John Adams,Benjamin Franklin,George Washington,D`;
}
