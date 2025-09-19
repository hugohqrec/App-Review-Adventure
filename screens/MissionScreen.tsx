
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { GameContext } from '../contexts/GameContext';
import { Question, Screen } from '../types';

const MissionScreen: React.FC = () => {
  const context = useContext(GameContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  if (!context) return null;
  const { gameState, completeMission, setScreen, setMissionPart1Result } = context;
  const level = gameState.levels.find(l => l.id === gameState.currentLevelId);

  const [timeLeft, setTimeLeft] = useState(level?.timeLimit || 0);

  const resetForNextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    if(level?.timeLimit) {
      setTimeLeft(level.timeLimit);
    }
  }, [level]);

  useEffect(() => {
    if(level?.timeLimit) {
      setTimeLeft(level.timeLimit);
    }
  }, [level]);

  useEffect(() => {
    if (level?.timeLimit && selectedAnswer === null && timeLeft > 0) {
        const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timerId);
    } else if (level?.timeLimit && timeLeft === 0 && selectedAnswer === null) {
        // Time's up, count as wrong answer
        setSelectedAnswer(-1); // Use -1 to denote a timeout
        setIsCorrect(false);
    }
  }, [timeLeft, selectedAnswer, level]);


  if (!level || !level.questions || level.questions.length === 0) {
    return <div className="p-4">Cargando misión...</div>;
  }

  const currentQuestion: Question = level.questions[currentQuestionIndex];

  const handleAnswerClick = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const correct = index === currentQuestion.correctAnswerIndex;
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswersCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < level.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetForNextQuestion();
    } else {
      // Mission complete or move to next stage
      const totalQuestions = level.questions.length;
      const isPerfect = correctAnswersCount === totalQuestions;
      
      let xpEarned = correctAnswersCount * 10;
      if (isPerfect && totalQuestions > 0) {
        xpEarned += 20; // Perfect bonus
      }
      const coinsEarned = correctAnswersCount * 5;

      if (level.hasBubbleGame) {
          setMissionPart1Result({ xp: xpEarned, coins: coinsEarned, isPerfect });
          setScreen(Screen.BubbleGame);
      } else {
          const accuracy = totalQuestions > 0 ? correctAnswersCount / totalQuestions : 0;
          const stars = accuracy >= 0.8 ? 3 : accuracy > 0.5 ? 2 : 1;
          completeMission(level.id, stars, xpEarned, coinsEarned, isPerfect);
      }
    }
  };

  const getButtonClass = (index: number) => {
    if (selectedAnswer === null) {
      return 'bg-blue-400 border-blue-600 hover:bg-blue-500';
    }
    if (index === currentQuestion.correctAnswerIndex) {
      return 'bg-green-500 border-green-700 animate-correct';
    }
    if (index === selectedAnswer && !isCorrect) {
      return 'bg-red-500 border-red-700 animate-incorrect';
    }
    return 'bg-gray-400 border-gray-600 opacity-70';
  };

  const timerColorClass = timeLeft <= 3 ? 'text-red-500 font-bold' : 'text-gray-600';

  return (
    <div className="flex flex-col h-full w-full bg-[#e7f9ee] p-4 pb-24">
      <div className="flex justify-between items-center mb-4 gap-2">
          <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-gray-400">
              <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${((currentQuestionIndex + 1) / level.questions.length) * 100}%` }}></div>
          </div>
          <p className="text-sm font-bold text-gray-600 whitespace-nowrap">{currentQuestionIndex + 1} / {level.questions.length}</p>
          {level.timeLimit && (
            <div className={`text-lg font-mono p-1 rounded-md bg-white/50 ${timerColorClass}`}>{timeLeft}s</div>
          )}
      </div>

      <div className="text-center my-8">
        <h2 className="text-lg sm:text-xl text-gray-700 font-bold">¡Resuelve las multiplicaciones para avanzar!</h2>
        <p className="text-3xl sm:text-4xl md:text-5xl font-fredoka text-cyan-700 mt-2">{currentQuestion.text}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(index)}
            disabled={selectedAnswer !== null}
            className={`text-white font-bold text-2xl sm:text-3xl md:text-4xl p-2 sm:p-4 rounded-2xl border-b-8 transition-transform active:scale-95 active:border-b-4 ${getButtonClass(index)}`}
          >
            {option}
          </button>
        ))}
      </div>

      {selectedAnswer !== null && (
        <div className="text-center mt-4">
          <p className={`text-2xl font-bold ${isCorrect === true ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect === true ? '¡Respuesta correcta!' : (selectedAnswer === -1 ? '¡Se acabó el tiempo!' : '¡Respuesta incorrecta!')}
          </p>
          <button
            onClick={handleNext}
            className="mt-2 bg-lime-500 text-white font-bold font-fredoka text-xl sm:text-2xl py-3 px-10 rounded-full border-b-8 border-lime-700 hover:bg-lime-600 transition-transform active:scale-95 active:border-b-4"
          >
            {currentQuestionIndex < level.questions.length - 1 ? 'Siguiente →' : 'Finalizar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MissionScreen;
