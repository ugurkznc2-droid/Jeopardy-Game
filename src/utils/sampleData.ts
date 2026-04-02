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
              { id: generateId(), pointValue: 200, questionText: 'What planet is known as the Red Planet?', choices: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctChoice: 1, answer: 'Mars', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 400, questionText: 'What gas do plants absorb from the atmosphere?', choices: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correctChoice: 2, answer: 'Carbon dioxide', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 600, questionText: 'What is the chemical symbol for gold?', choices: ['Ag', 'Au', 'Go', 'Gd'], correctChoice: 1, answer: 'Au', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 800, questionText: 'What is the powerhouse of the cell?', choices: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'], correctChoice: 2, answer: 'Mitochondria', isDailyDouble: true, isRevealed: false },
              { id: generateId(), pointValue: 1000, questionText: 'What force keeps planets in orbit around the sun?', choices: ['Magnetism', 'Friction', 'Gravity', 'Inertia'], correctChoice: 2, answer: 'Gravity', isDailyDouble: false, isRevealed: false },
            ],
          },
          {
            id: generateId(),
            name: 'History',
            questions: [
              { id: generateId(), pointValue: 200, questionText: 'In what year did World War II end?', choices: ['1943', '1944', '1945', '1946'], correctChoice: 2, answer: '1945', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 400, questionText: 'Who was the first President of the United States?', choices: ['Thomas Jefferson', 'John Adams', 'Benjamin Franklin', 'George Washington'], correctChoice: 3, answer: 'George Washington', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 600, questionText: 'What ancient civilization built the pyramids at Giza?', choices: ['Ancient Romans', 'Ancient Greeks', 'Ancient Egyptians', 'Mesopotamians'], correctChoice: 2, answer: 'Ancient Egyptians', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 800, questionText: 'What was the name of the ship the Pilgrims sailed to America?', choices: ['The Santa Maria', 'The Mayflower', 'The Endeavour', 'The Speedwell'], correctChoice: 1, answer: 'The Mayflower', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 1000, questionText: 'Who wrote the Declaration of Independence?', choices: ['George Washington', 'Benjamin Franklin', 'Thomas Jefferson', 'John Adams'], correctChoice: 2, answer: 'Thomas Jefferson', isDailyDouble: false, isRevealed: false },
            ],
          },
          {
            id: generateId(),
            name: 'Geography',
            questions: [
              { id: generateId(), pointValue: 200, questionText: 'What is the largest continent by area?', choices: ['Africa', 'North America', 'Europe', 'Asia'], correctChoice: 3, answer: 'Asia', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 400, questionText: 'What is the longest river in the world?', choices: ['Amazon', 'The Nile', 'Mississippi', 'Yangtze'], correctChoice: 1, answer: 'The Nile', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 600, questionText: 'What country has the most population?', choices: ['China', 'United States', 'India', 'Indonesia'], correctChoice: 2, answer: 'India', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 800, questionText: 'What is the capital of Australia?', choices: ['Sydney', 'Melbourne', 'Brisbane', 'Canberra'], correctChoice: 3, answer: 'Canberra', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 1000, questionText: 'What is the smallest country in the world?', choices: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], correctChoice: 1, answer: 'Vatican City', isDailyDouble: false, isRevealed: false },
            ],
          },
          {
            id: generateId(),
            name: 'Literature',
            questions: [
              { id: generateId(), pointValue: 200, questionText: 'Who wrote "Romeo and Juliet"?', choices: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], correctChoice: 1, answer: 'William Shakespeare', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 400, questionText: 'What is the name of Harry Potter\'s school?', choices: ['Durmstrang', 'Beauxbatons', 'Hogwarts', 'Ilvermorny'], correctChoice: 2, answer: 'Hogwarts', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 600, questionText: 'Who wrote "To Kill a Mockingbird"?', choices: ['Harper Lee', 'F. Scott Fitzgerald', 'Ernest Hemingway', 'John Steinbeck'], correctChoice: 0, answer: 'Harper Lee', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 800, questionText: 'In what novel does the character Jay Gatsby appear?', choices: ['Moby Dick', 'The Great Gatsby', 'Pride and Prejudice', 'The Catcher in the Rye'], correctChoice: 1, answer: 'The Great Gatsby', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 1000, questionText: 'Who is the author of "1984"?', choices: ['Aldous Huxley', 'Ray Bradbury', 'George Orwell', 'H.G. Wells'], correctChoice: 2, answer: 'George Orwell', isDailyDouble: false, isRevealed: false },
            ],
          },
          {
            id: generateId(),
            name: 'Math',
            questions: [
              { id: generateId(), pointValue: 200, questionText: 'What is the value of Pi to two decimal places?', choices: ['3.14', '3.16', '3.12', '3.18'], correctChoice: 0, answer: '3.14', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 400, questionText: 'What is the square root of 144?', choices: ['10', '11', '12', '14'], correctChoice: 2, answer: '12', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 600, questionText: 'What is a triangle with all equal sides called?', choices: ['Isosceles', 'Scalene', 'Right triangle', 'Equilateral'], correctChoice: 3, answer: 'Equilateral', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 800, questionText: 'What is 15% of 200?', choices: ['20', '25', '30', '35'], correctChoice: 2, answer: '30', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 1000, questionText: 'What is the formula for the area of a circle?', choices: ['A = 2*Pi*r', 'A = Pi*r^2', 'A = Pi*d', 'A = 4*Pi*r^2'], correctChoice: 1, answer: 'A = Pi*r^2', isDailyDouble: true, isRevealed: false },
            ],
          },
          {
            id: generateId(),
            name: 'Pop Culture',
            questions: [
              { id: generateId(), pointValue: 200, questionText: 'What streaming service produces "Stranger Things"?', choices: ['Hulu', 'Disney+', 'Netflix', 'Amazon Prime'], correctChoice: 2, answer: 'Netflix', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 400, questionText: 'What is the highest-grossing film of all time?', choices: ['Avengers: Endgame', 'Avatar', 'Titanic', 'Star Wars'], correctChoice: 1, answer: 'Avatar', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 600, questionText: 'Who painted the Mona Lisa?', choices: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'], correctChoice: 2, answer: 'Leonardo da Vinci', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 800, questionText: 'What video game features a character named Mario?', choices: ['Sonic the Hedgehog', 'Super Mario Bros.', 'Pac-Man', 'Donkey Kong'], correctChoice: 1, answer: 'Super Mario Bros.', isDailyDouble: false, isRevealed: false },
              { id: generateId(), pointValue: 1000, questionText: 'What band performed "Bohemian Rhapsody"?', choices: ['The Beatles', 'Led Zeppelin', 'Queen', 'Pink Floyd'], correctChoice: 2, answer: 'Queen', isDailyDouble: false, isRevealed: false },
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
              { id: generateId(), pointValue: 0, questionText: 'Which country holds the record for the most Olympic gold medals in a single Summer Olympics?', choices: ['China', 'Soviet Union', 'Great Britain', 'United States'], correctChoice: 3, answer: 'United States', isDailyDouble: false, isRevealed: false },
            ],
          },
        ],
      },
    ],
  };
}
