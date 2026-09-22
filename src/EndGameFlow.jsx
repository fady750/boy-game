import React, { useState } from 'react';
import Celebration from './Celebration/Celebration';
import ResultsPanel from './ResultsPanel/ResultsPanel';

export default function EndGameFlow({
  score,
  totalScore,
  correctAnswers,
  wrongAnswers,
  coins,
  onRetry,
  onBack
}) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Expose a way to start the flow externally if needed, 
  // but since we mount it on win, we can just run it immediately.
  // Actually, let's start celebration on mount as this component 
  // is only rendered when the game is won.
  React.useEffect(() => {
    setShowCelebration(true);
  }, []);

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setShowResults(true);
  };

  return (
    <>
      <Celebration 
        isVisible={showCelebration} 
        onComplete={handleCelebrationComplete} 
      />
      
      {showResults && (
        <ResultsPanel
          score={score}
          totalScore={totalScore}
          correctAnswers={correctAnswers}
          wrongAnswers={wrongAnswers}
          coins={coins}
          onRetry={onRetry}
          onBack={onBack}
        />
      )}
    </>
  );
}
