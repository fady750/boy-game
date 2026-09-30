import React from 'react';
import './ResultsPanel.css';

import banalImg from './assets/banal.png';
import goodImg from './assets/good.png';
import moneyImg from './assets/money.png';
import rightImg from './assets/right.png';
import wrongImg from './assets/wrong.png';
import exitImg from './assets/exit.png';
import retryImg from './assets/retry.png';

const ResultsPanel = ({
  score = 0,
  totalScore = 0,
  correctAnswers = 0,
  wrongAnswers = 0,
  coins = 0,
  onRetry,
  onBack,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  // Displays good.png when score >= 50%, or Arabic red text when score < 50%
  const totalAnswers = correctAnswers + wrongAnswers;
  const isSuccess = totalAnswers > 0 && correctAnswers / totalAnswers >= 0.5;
  const correctPercent = totalAnswers ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  return (
    <div className="results-overlay">
      <section className="results-screen" aria-label="نتائج اللعبة">
        {/* Sci-Fi Frame Container */}
        <div
          className="results-panel"
          style={{ '--results-panel-image': `url(${banalImg})` }}
        >
          <img className="results-panel__frame" src={banalImg} alt="" aria-hidden="true" />
          <div className="results-panel__content">
            {/* Zone 1: Success Image OR Red Fail Text */}
            {isSuccess ? (
              <img className="results-panel__title" src={goodImg} alt="أحسنت" />
            ) : (
              <div className="results-panel__fail-title">حاول مرة أخرى!</div>
            )}
            <div className="results-grade" aria-label={`الدرجة ${correctPercent} من 100`}>
              <span>الدَّرَجَة</span>
              <strong>{correctPercent}/100</strong>
            </div>

            {/* Zone 2: 3 Stat Cards (LTR) */}
            <div className="results-stats">
              {/* 1. Correct Answers */}
              <div className="results-stat-card results-stat-card--correct">
                <img src={rightImg} alt="إجابات صحيحة" />
                <strong>{correctAnswers}</strong>
              </div>

              {/* 2. Earned Coins */}
              <div className="results-stat-card results-stat-card--coins">
                <img src={moneyImg} alt="عملات مكتسبة" />
                <strong>+{coins}</strong>
                <span>فِلُوس</span>
              </div>

              {/* 3. Wrong Answers */}
              <div className="results-stat-card results-stat-card--wrong">
                <img src={wrongImg} alt="إجابات خاطئة" />
                <strong>{wrongAnswers}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Zone 3: Bottom Action Buttons (RTL: Exit Right, Retry Left) */}
        <div className="results-actions">
          <button
            type="button"
            className="results-action results-action--back"
            aria-label="خروج"
            onClick={handleBack}
          >
            <img src={exitImg} className="results-action__bg" alt="خروج" />
          </button>
          <button
            type="button"
            className="results-action results-action--retry"
            aria-label="إعادة المحاولة"
            onClick={handleRetry}
          >
            <img src={retryImg} className="results-action__bg" alt="إعادة المحاولة" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default ResultsPanel;
