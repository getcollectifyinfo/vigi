import React, { useState } from 'react';
import Shape from './Shape';
import { useGameLogic } from '../hooks/useGameLogic';

const Game = () => {
  const { gameState, actions, settings } = useGameLogic();
  const { isPlaying, isPaused, score, highScore, gameTime, level, position, shape, color } = gameState;
  const { startGame, stopGame, togglePause, handleInteraction, setSettings } = actions;

  // Calculate position
  const getPositionStyle = (pos) => {
    // 12 positions, 0 at top (12 o'clock)
    // Angle in degrees: pos * 30
    // To start at top, subtract 90 degrees
    const angle = (pos * 30 - 90) * (Math.PI / 180);
    // Using percentages for responsiveness
    // Center is 50, 50
    // x = 50 + r * cos
    // y = 50 + r * sin
    // r in %? Let's say 30%
    const r = 30; 
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)'
    };
  };

  // Button handlers
  const onBtnClick = (type) => {
    handleInteraction(type);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  const handlePause = () => {
    togglePause();
    setShowPauseMenu(true);
  };

  const handleResume = () => {
    togglePause();
    setShowPauseMenu(false);
  };

  const handleSettingsFromPause = () => {
    setShowPauseMenu(false);
    setShowSettings(true);
  };

  const handleQuitFromPause = () => {
    stopGame();
    setShowPauseMenu(false);
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 text-white overflow-hidden select-none font-mono">
      {/* HUD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center z-10">
        <div className="text-4xl font-bold mb-1">{score}</div>
        <div className="text-xs text-gray-400">HIGH: {highScore}</div>
        <div className="mt-2 text-xl text-yellow-400">{level.name}</div>
        <div className="text-sm">{formatTime(gameTime)}</div>
      </div>

      {/* Settings Button */}
      {!isPlaying && (
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white z-20"
        >
          ⚙️
        </button>
      )}

      {/* Start Button Overlay */}
      {!isPlaying && !showSettings && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm">
          <button 
            onClick={startGame}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            START GAME
          </button>
        </div>
      )}

      {/* Game Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Central Marker/Orbit */}
        <div className="w-[60%] aspect-square border-2 border-gray-800 rounded-full absolute pointer-events-none"></div>
        
        {/* The Moving Shape */}
        <div 
          className="absolute transition-all duration-300 ease-linear"
          style={getPositionStyle(position)}
        >
          <Shape type={shape} color={color} size={60} />
        </div>
      </div>

      {/* Controls - 4 Corners */}
      {/* Top Left - JUMP */}
      <button 
        onClick={() => onBtnClick('JUMP')}
        className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 flex items-start justify-start p-4 bg-transparent active:bg-white/10 outline-none"
      >
        <div className="w-full h-full border-t-4 border-l-4 border-purple-500 rounded-tl-3xl p-2">
          <span className="text-purple-400 font-bold text-lg md:text-xl">JUMP</span>
        </div>
      </button>

      {/* Top Right - COLOR */}
      <button 
        onClick={() => onBtnClick('COLOR')}
        className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 flex items-start justify-end p-4 bg-transparent active:bg-white/10 outline-none"
      >
        <div className="w-full h-full border-t-4 border-r-4 border-blue-500 rounded-tr-3xl p-2 text-right">
          <span className="text-blue-400 font-bold text-lg md:text-xl">COLOR</span>
        </div>
      </button>

      {/* Bottom Left - TURN */}
      <button 
        onClick={() => onBtnClick('TURN')}
        className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 flex items-end justify-start p-4 bg-transparent active:bg-white/10 outline-none"
      >
        <div className="w-full h-full border-b-4 border-l-4 border-yellow-500 rounded-bl-3xl p-2 flex items-end">
          <span className="text-yellow-400 font-bold text-lg md:text-xl">TURN</span>
        </div>
      </button>

      {/* Bottom Right - SHAPE */}
      <button 
        onClick={() => onBtnClick('SHAPE')}
        className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 flex items-end justify-end p-4 bg-transparent active:bg-white/10 outline-none"
      >
        <div className="w-full h-full border-b-4 border-r-4 border-green-500 rounded-br-3xl p-2 flex items-end justify-end">
          <span className="text-green-400 font-bold text-lg md:text-xl">SHAPE</span>
        </div>
      </button>
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-gray-900 z-30 p-8 overflow-y-auto">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            
            <div className="mb-4">
               <label className="block text-sm mb-2">Base Speed (ms)</label>
               <input 
                 type="range" 
                 min="500" max="2000" step="100"
                 value={settings.baseSpeed}
                 onChange={(e) => setSettings(s => ({...s, baseSpeed: parseInt(e.target.value)}))}
                 className="w-full"
               />
               <span className="text-xs text-gray-400">{settings.baseSpeed}ms</span>
            </div>

            <div className="mb-4">
               <label className="block text-sm mb-2">Change Frequency (0-1)</label>
               <input 
                 type="range" 
                 min="0.1" max="0.9" step="0.1"
                 value={settings.changeFrequency}
                 onChange={(e) => setSettings(s => ({...s, changeFrequency: parseFloat(e.target.value)}))}
                 className="w-full"
               />
               <span className="text-xs text-gray-400">{settings.changeFrequency}</span>
            </div>

            <div className="mb-4 border-t border-gray-700 pt-4">
               <h3 className="font-bold mb-2 text-green-400">Excellent Score</h3>
               <div className="flex gap-2">
                 <div>
                   <label className="block text-xs mb-1">Time (ms)</label>
                   <input 
                     type="number" 
                     value={settings.scoreWindows.excellent.time}
                     onChange={(e) => setSettings(s => ({
                       ...s, 
                       scoreWindows: {
                         ...s.scoreWindows,
                         excellent: { ...s.scoreWindows.excellent, time: parseInt(e.target.value) }
                       }
                     }))}
                     className="w-full bg-gray-800 p-2 rounded"
                   />
                 </div>
                 <div>
                   <label className="block text-xs mb-1">Points</label>
                   <input 
                     type="number" 
                     value={settings.scoreWindows.excellent.points}
                     onChange={(e) => setSettings(s => ({
                       ...s, 
                       scoreWindows: {
                         ...s.scoreWindows,
                         excellent: { ...s.scoreWindows.excellent, points: parseInt(e.target.value) }
                       }
                     }))}
                     className="w-full bg-gray-800 p-2 rounded"
                   />
                 </div>
               </div>
            </div>

            <div className="mb-4">
               <h3 className="font-bold mb-2 text-yellow-400">Good Score</h3>
               <div className="flex gap-2">
                 <div>
                   <label className="block text-xs mb-1">Time (ms)</label>
                   <input 
                     type="number" 
                     value={settings.scoreWindows.good.time}
                     onChange={(e) => setSettings(s => ({
                       ...s, 
                       scoreWindows: {
                         ...s.scoreWindows,
                         good: { ...s.scoreWindows.good, time: parseInt(e.target.value) }
                       }
                     }))}
                     className="w-full bg-gray-800 p-2 rounded"
                   />
                 </div>
                 <div>
                   <label className="block text-xs mb-1">Points</label>
                   <input 
                     type="number" 
                     value={settings.scoreWindows.good.points}
                     onChange={(e) => setSettings(s => ({
                       ...s, 
                       scoreWindows: {
                         ...s.scoreWindows,
                         good: { ...s.scoreWindows.good, points: parseInt(e.target.value) }
                       }
                     }))}
                     className="w-full bg-gray-800 p-2 rounded"
                   />
                 </div>
               </div>
            </div>

            <div className="flex gap-4 mt-6">
              {!isPlaying ? (
                 <button 
                 onClick={() => { stopGame(); setShowSettings(false); }}
                 className="flex-1 px-6 py-2 bg-red-700 hover:bg-red-600 rounded text-white"
               >
                 Quit Game
               </button>
              ) : (
                // If accessed via some other way (currently logic prevents it, but safe to handle)
                // Actually if we open settings from pause menu, game is paused.
                // We need a "Back" button to return to Pause Menu or Resume.
                <button 
                  onClick={() => { setShowSettings(false); setShowPauseMenu(true); }}
                  className="flex-1 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                >
                  Back
                </button>
              )}
              
              {!isPlaying && (
                <button 
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
