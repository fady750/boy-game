import React from "react";
import "./ResultsPanel.css";

import banalImg from "./assets/banal.png";
import goodImg from "./assets/good.png";
import moneyImg from "./assets/money.png";
import rightImg from "./assets/right.png";
import bouttonImg from "./assets/boutton.png";

import retryImg from "../assets/retry.png";
import exitBtnImg from "../assets/ExitButton.svg";

const ResultsPanel = ({
  score = 0,
  totalScore = 0,
  correctAnswers = 0,
  wrongAnswers = 0,
  coins = 0,
  onRetry
}) => {
  const handleBack = () => {
    window.history.back();
  };

  const isSuccess = score >= totalScore / 2;

  return (
    <div className="results-overlay">
      <div className="results-screen" dir="rtl">
        <div className="results-panel">
          <div className="results-panel__content">
            <img src={isSuccess ? goodImg : banalImg} alt={isSuccess ? "أحسنت!" : "حاول مرة أخرى!"} className="results-title-img" />


            <div className="results-stats">
              <div className="results-stat-card">
                <img src={rightImg} alt="صحيح" className="stat-icon" />
                <span className="stat-value">{correctAnswers}</span>
                <span className="stat-label">صحيح</span>
              </div>

              <div className="results-stat-card">
                <img src={moneyImg} alt="فلوس" className="stat-icon" />
                <span className="stat-value" style={{ direction: "ltr" }}>+{coins}</span>
                <span className="stat-label">فُلُوس</span>
              </div>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button className="results-action btn-red" onClick={handleBack}>
            <span>ارْجِعْ</span>
            <img src={exitBtnImg} alt="Exit" className="btn-icon-img" />
          </button>

          <button className="results-action btn-blue" onClick={onRetry}>
            <span>ثانِيَةً</span>
            <img src={retryImg} alt="Retry" className="btn-icon-img" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
