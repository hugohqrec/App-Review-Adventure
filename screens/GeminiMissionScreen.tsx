
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { GameContext } from '../contexts/GameContext';
import { Question } from '../types';
import { generateMathQuestion } from '../services/geminiService';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-cyan-500"></div>
        <p className="mt-4 text-cyan-700 font-bold">Generando pregunta...</p>
    </div>
);


const GeminiMissionScreen: React.FC = () => {
  const context = useContext(GameContext);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  const TOTAL_QUESTIONS = 5;

  if (!context) return null;
  const { gameState, completeMission, getCurrentPlayer } = context;
  const level = gameState.levels.find(l => l.id === gameState.currentLevelId);
  const player = getCurrentPlayer();

  const fetchNewQuestion = useCallback(async () => {
    if (!level) return;
    setIsLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    
    const newQuestion = await generateMathQuestion(level.name, player.level);
    if (newQuestion) {
        setCurrentQuestion(newQuestion);
    } else {
        setError('No se pudo generar una pregunta. Intenta de nuevo.');
    }
    setIsLoading(false);
  }, [level, player.level]);
  
  useEffect(() => {
    fetchNewQuestion();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!level) return <div className="p-4">Error: Nivel no encontrado.</div>;
  if (error) return <div className="p-4 text-red-500 font-bold">{error}</div>

  const handleAnswerClick = (index: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    setSelectedAnswer(index);
    const correct = index === currentQuestion.correctAnswerIndex;
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswersCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    const nextQuestionNum = questionCount + 1;
    setQuestionCount(nextQuestionNum);

    if (nextQuestionNum < TOTAL_QUESTIONS) {
        fetchNewQuestion();
    } else {
      const isPerfect = correctAnswersCount === TOTAL_QUESTIONS;
      const accuracy = correctAnswersCount / TOTAL_QUESTIONS;
      const stars = accuracy >= 0.8 ? 3 : accuracy > 0.5 ? 2 : 1;
      let xpEarned = correctAnswersCount * 10;
      if (isPerfect && TOTAL_QUESTIONS > 0) {
        xpEarned += 20; // Perfect bonus
      }
      const coinsEarned = correctAnswersCount * 5;
      completeMission(level.id, stars, xpEarned, coinsEarned, isPerfect);
    }
  };

  const getButtonClass = (index: number) => {
    if (selectedAnswer === null || !currentQuestion) {
      return 'bg-blue-400 border-blue-600 hover:bg-blue-500';
    }
    if (index === currentQuestion.correctAnswerIndex) {
      return 'bg-green-500 border-green-700 animate-pulse';
    }
    if (index === selectedAnswer && !isCorrect) {
      return 'bg-red-500 border-red-700';
    }
    return 'bg-gray-400 border-gray-600 opacity-70';
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e7f9ee] p-4 pb-24">
       <div className="flex justify-between items-center mb-4">
          <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-gray-400">
              <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${((questionCount + 1) / TOTAL_QUESTIONS) * 100}%` }}></div>
          </div>
          <p className="text-sm font-bold text-gray-600 ml-2 whitespace-nowrap">{questionCount + 1} / {TOTAL_QUESTIONS}</p>
      </div>

      {isLoading ? <LoadingSpinner /> : currentQuestion ? (
          <>
            <div className="text-center my-8">
                <h2 className="text-lg sm:text-xl text-gray-700 font-bold">Práctica Infinita: {level.name}</h2>
                <p className="text-3xl sm:text-4xl font-fredoka text-cyan-700 mt-2">{currentQuestion.text}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-grow">
                {currentQuestion.options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => handleAnswerClick(index)}
                    disabled={selectedAnswer !== null}
                    className={`text-white font-bold text-2xl sm:text-3xl p-2 sm:p-4 rounded-2xl border-b-8 transition-transform active:scale-95 active:border-b-4 ${getButtonClass(index)}`}
                >
                    {option}
                </button>
                ))}
            </div>

            {selectedAnswer !== null && (
                <div className="text-center mt-4">
                <p className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '¡Respuesta correcta!' : '¡Inténtalo de nuevo!'}
                </p>
                <button
                    onClick={handleNext}
                    className="mt-2 bg-lime-500 text-white font-bold font-fredoka text-xl sm:text-2xl py-3 px-10 rounded-full border-b-8 border-lime-700 hover:bg-lime-600 transition-transform active:scale-95 active:border-b-4"
                >
                    {questionCount < TOTAL_QUESTIONS - 1 ? 'Siguiente →' : 'Finalizar'}
                </button>
                </div>
            )}
        </>
      ) : null}
    </div>
  );
};

export default GeminiMissionScreen;
