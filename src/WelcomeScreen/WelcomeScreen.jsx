import React from 'react';
import GameWelcomeScreen from '../components/GameWelcomeScreen/GameWelcomeScreen';
import BG from '../BG.png';
import questionCoinImg from '../assets/QuestionCoin.png';
import questionNumberImg from '../assets/QuestionNumber.png';
import descriptionImg from '../assets/description.png';
import startButtonImg from '../assets/start_transparent.png';
import daddcoinImg from '../assets/daddcoin.webp';
import exitButtonImg from '../assets/Exit1.png';

export default function WelcomeScreen({ questionsCount = 0, isLoading = false, onStart }) {
  const daddPoints = questionsCount;
  const hasQuestions = questionsCount > 0;

  return (
    <GameWelcomeScreen
      backgroundImage={BG}
      statsBgImage={questionNumberImg}
      statLeftIcon={questionCoinImg}
      statLeftAlt="عدد الأسئلة"
      statLeftValue={questionsCount}
      statRightValue={daddPoints}
      statRightIcon={daddcoinImg}
      statRightAlt="النقاط"
      descriptionImage={descriptionImg}
      startButtonImage={startButtonImg}
      exitButtonImage={exitButtonImg}
      onStart={onStart}
      isLoading={isLoading}
      isReady={hasQuestions}
    />
  );
}
