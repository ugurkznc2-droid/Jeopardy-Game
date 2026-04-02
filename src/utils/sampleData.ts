import type { Game } from '../types';
import { generateId } from './helpers';

export function createSampleGame(): Game {
  const gameId = generateId();

  return {
    id: gameId,
    title: 'School Knowledge Bowl',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    timerSeconds: 30,
    currentRound: 0,
    soundEnabled: true,
    teams: [
      { id: generateId(), name: 'Team Alpha', score: 0, color: '#3B82F6' },
      { id: generateId(), name: 'Team Beta', score: 0, color: '#EF4444' },
      { id: generateId(), name: 'Team Gamma', score: 0, color: '#10B981' },
    ],
    rounds: [
      {
        id: generateId(),
        name: 'Round 1',
        type: 'standard',
        categories: [
          {
            id: generateId(),
            name: 'Science',
            questions: [
              { id: generateId(), pointValue: 200, questionText: 'What planet is known as the Red Planet?', answer: 'Mars', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 400, questionText: 'What gas do plants absorb from the atmosphere?', answer: 'Carbon dioxide (CO2)', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 600, questionText: 'What is the chemical symbol for gold?', answer: 'Au', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 800, questionText: 'What is the powerhouse of the cell?', answer: 'Mitochondria', isDailyDouble: true, isRevealed: false },
              { id: generateId(), pointValue: 1000, questionText: 'What force keeps planets in orbit around the sun?', answer: 'Gravity', isDailyDouble: false, isRevealed: false },
            ],
          },
          {
            id: generateId(),
            name: 'History',
            questions: [
              { id: generateId(), pointValue: 200, questionText: 'In what year did World War II end?', answer: '1945', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 400, questionText: 'Who was the first President of the United States?', answer: 'George Washington', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 600, questionText: 'What ancient civilization built the pyramids at Giza?', answer: 'Ancient Egyptians', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 800, questionText: 'What was the name of the ship the Pilgrims sailed to America?', answer: 'The Mayflower', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 1000, questionText: 'Who wrote the Declaration of Independence?', answer: 'Thomas Jefferson', isDailyDouble: false, isRevealed: false },
            ],
          },
          {
            id: generateId(),
            name: 'Geography',
            questions: [
              { id: generateId(), pointValue: 200, questionText: 'What is the largest continent by area?', answer: 'Asia', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 400, questionText: 'What is the longest river in the world?', answer: 'The Nile', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 600, questionText: 'What country has the most population?', answer: 'India', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 800, questionText: 'What is the capital of Australia?', answer: 'Canberra', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 1000, questionText: 'What is the smallest country in the world?', answer: 'Vatican City', isDailyDouble: false, isRevealed: false },
            ],
          },
          {
            id: generateId(),
            name: 'Literature',
            questions: [
              { id: generateId(), pointValue: 200, questionText: 'Who wrote "Romeo and Juliet"?', answer: 'William Shakespeare', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 400, questionText: 'What is the name of Harry Potter\'s school?', answer: 'Hogwarts School of Witchcraft and Wizardry', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 600, questionText: 'Who wrote "To Kill a Mockingbird"?', answer: 'Harper Lee', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 800, questionText: 'In what novel does the character Jay Gatsby appear?', answer: 'The Great Gatsby', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 1000, questionText: 'Who is the author of "1984"?', answer: 'George Orwell', isDailyDouble: false, isRevealed: false },
            ],
          },
          {
            id: generateId(),
            name: 'Math',
            questions: [
              { id: generateId(), pointValue: 200, questionText: 'What is the value of Pi to two decimal places?', answer: '3.14', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 400, questionText: 'What is the square root of 144?', answer: '12', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 600, questionText: 'What is a triangle with all equal sides called?', answer: 'Equilateral triangle', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 800, questionText: 'What is 15% of 200?', answer: '30', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 1000, questionText: 'What is the formula for the area of a circle?', answer: 'A = Pi * r^2', isDailyDouble: true, isRevealed: false },
            ],
          },
          {
            id: generateId(),
            name: 'Pop Culture',
            questions: [
              { id: generateId(), pointValue: 200, questionText: 'What streaming service produces "Stranger Things"?', answer: 'Netflix', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 400, questionText: 'What is the highest-grossing film of all time?', answer: 'Avatar', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 600, questionText: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 800, questionText: 'What video game features a character named Mario?', answer: 'Super Mario Bros.', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 1000, questionText: 'What band performed "Bohemian Rhapsody"?', answer: 'Queen', isDailyDouble: false, isRevealed: false },
            ],
          },
        ],
      },
      {
        id: generateId(),
        name: 'Final Jeopardy',
        type: 'final',
        categories: [
          {
            id: generateId(),
            name: 'World Records',
            questions: [
              { id: generateId(), pointValue: 0, questionText: 'This country holds the record for the most Olympic gold medals in a single Summer Olympics.', answer: 'The United States (at the 1984 Los Angeles Olympics with 83 golds)', isDailyDouble: false, isRevealed: false },
            ],
          },
        ],
      },
    ],
  };
}
