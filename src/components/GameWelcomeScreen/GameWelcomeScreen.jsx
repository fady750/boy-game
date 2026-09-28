import React from 'react';
import './GameWelcomeScreen.css';

/**
 * GameWelcomeScreen — Reusable full-screen welcome/lobby layout.
 *
 * Props:
 * ──────────────────────────────────────────────────────────────────
 * backgroundImage  {string}   URL/import of the full-screen background image.
 * statsBgImage     {string}   URL/import of the stats badge background image.
 * statLeftIcon     {string}   URL/import of the left icon inside the stats badge (e.g. coin).
 * statLeftValue    {string|number}  Value shown next to the left icon.
 * statRightValue   {string|number}  Highlighted value (yellow) shown after "=".
 * statRightIcon    {string}   URL/import of the right icon inside the stats badge.
 * heroImage        {string}   URL/import of the main description/how-to-play image.
 * heroAlt          {string}   Alt text for the hero image.
 * startButtonImage {string}   URL/import of the start button graphic.
 * exitButtonImage  {string}   URL/import of the exit button graphic.
 * onStart          {function} Called when the start button is clicked.
 * onExit           {function} Called when the exit button is clicked. Defaults to window.history.back().
 * isLoading        {boolean}  Disables the start button while content loads.
 * isReady          {boolean}  Disables the start button when false (e.g. no questions loaded).
 * ──────────────────────────────────────────────────────────────────
 */
export default function GameWelcomeScreen({
  // Background
  backgroundImage,

  // Header / Stats Badge
  statsBgImage,
  statLeftIcon,
  statLeftAlt = 'Stat',
  statLeftValue,
  statRightValue,
  statRightIcon,
  statRightAlt = 'Points',

  // Body
  heroImage,
  heroAlt = 'How to Play',

  // Footer Buttons
  startButtonImage,
  exitButtonImage,
  onStart,
  onExit,
  isLoading = false,
  isReady = true,
}) {
  const handleExit = onExit || (() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  });

  const startDisabled = isLoading || !isReady;

  return (
    <div
      className="gws-screen"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >

      {/* HEADER: Stats Badge */}
      <header className="gws-header">
        <div
          className="gws-stats-bg"
          style={{ backgroundImage: `url(${statsBgImage})` }}
        >
          {statLeftIcon && (
            <img src={statLeftIcon} alt={statLeftAlt} className="gws-stat-icon" />
          )}
          {statLeftValue !== undefined && (
            <span className="gws-stat-text">{statLeftValue}</span>
          )}
          {statRightValue !== undefined && (
            <>
              <span className="gws-stat-text">=</span>
              <span className="gws-stat-text gws-stat-text--yellow">{statRightValue}</span>
            </>
          )}
          {statRightIcon && (
            <img src={statRightIcon} alt={statRightAlt} className="gws-stat-icon" />
          )}
        </div>
      </header>

      {/* BODY: Hero / Description Image */}
      <main className="gws-body">
        <img
          src={heroImage}
          alt={heroAlt}
          className="gws-hero-img"
        />
      </main>

      {/* FOOTER: Exit + Start Buttons */}
      <footer className="gws-footer">
        <div className="gws-footer-buttons">

          {/* Exit button — uses an <img> child */}
          <button className="gws-img-btn" onClick={handleExit}>
            <img src={exitButtonImage} alt="Exit" />
          </button>

          {/* Start button — uses a CSS background-image */}
          <button
            className="gws-start-btn"
            style={{ backgroundImage: `url(${startButtonImage})` }}
            onClick={onStart}
            disabled={startDisabled}
          />

        </div>
      </footer>

    </div>
  );
}
