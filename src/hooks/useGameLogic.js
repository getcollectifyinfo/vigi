import { useState, useEffect, useRef, useCallback } from 'react';
import { SHAPES, COLORS, DIRECTIONS, INITIAL_SETTINGS, LEVELS } from '../utils/constants';

export const useGameLogic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('vigi_highscore') || '0'));
  const [gameTime, setGameTime] = useState(0); // seconds
  const [level, setLevel] = useState(LEVELS.EASY);

  // Game Object State
  const [position, setPosition] = useState(0); // 0-11
  const [shape, setShape] = useState(SHAPES[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [direction, setDirection] = useState(DIRECTIONS.CLOCKWISE);
  
  // Event tracking for scoring
  // Store timestamp of last change for each type
  const lastEvents = useRef({
    SHAPE: { time: 0, handled: false },
    COLOR: { time: 0, handled: false },
    TURN: { time: 0, handled: false },
    JUMP: { time: 0, handled: false },
  });

  // Settings
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  // Refs for loop
  const timerRef = useRef(null);
  const loopRef = useRef(null);

  // Audio refs (optional, placeholders)
  // const playSound = (type) => { ... }

  const startGame = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setScore(0);
    setGameTime(0);
    setLevel(LEVELS.EASY);
    setPosition(0);
    setShape(SHAPES[0]);
    setColor(COLORS[0]);
    setDirection(DIRECTIONS.CLOCKWISE);
    lastEvents.current = {
      SHAPE: { time: 0, handled: false },
      COLOR: { time: 0, handled: false },
      TURN: { time: 0, handled: false },
      JUMP: { time: 0, handled: false },
    };
  };

  const stopGame = () => {
    setIsPlaying(false);
    setIsPaused(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('vigi_highscore', score.toString());
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (loopRef.current) clearTimeout(loopRef.current);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Timer for difficulty and game time
  useEffect(() => {
    if (isPlaying && !isPaused) {
      timerRef.current = setInterval(() => {
        setGameTime(prev => {
          const newTime = prev + 1;
          // Check Level
          if (newTime >= LEVELS.HARD.duration) setLevel(LEVELS.HARD);
          else if (newTime >= LEVELS.MEDIUM.duration) setLevel(LEVELS.MEDIUM);
          else setLevel(LEVELS.EASY);
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, isPaused]);

  // Refactoring tick to avoid closure staleness on state variables that aren't functional updates.
  // We use Refs for current state to avoid re-creating the tick function.

  const stateRef = useRef({ shape, color, direction, level, settings });
  useEffect(() => {
    stateRef.current = { shape, color, direction, level, settings };
  }, [shape, color, direction, level, settings]);

  const tickRef = useRef(null);

  // State for cooldown tracking
  const cooldownRef = useRef(0); // timestamp until when no new events can happen

  const robustTick = useCallback(() => {
    if (!isPlaying || isPaused) return;

    const { shape, color, direction, level, settings } = stateRef.current;
    const now = Date.now();
    let nextDelay = settings.baseSpeed * level.speedMult;
    const changeChance = settings.changeFrequency * level.freqMult;

    let eventTriggered = false;

    // Only try to trigger event if cooldown has passed
    if (now > cooldownRef.current) {
      const rand = Math.random();
      
      // We will try one event type per tick based on probability slices
      // Normalize probabilities roughly:
      // Total chance space. Let's say we check events in sequence but with exclusive else-if
      // to ensure only one happens.

      // Priority can be random or fixed. Let's shuffle check order or just use random value ranges.
      // Let's use a single random value for event selection to guarantee mutual exclusivity.
      
      // 4 event types: SHAPE, COLOR, TURN, JUMP
      // Let's say total event probability is changeChance.
      // We divide changeChance into 4 slices.
      
      if (rand < changeChance) {
        // Which event?
        const eventTypeRand = Math.random();
        
        // Equal probability for each event type for simplicity, or weighted
        if (eventTypeRand < 0.25) {
           // SHAPE
           const newShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
           if (newShape !== shape) {
             setShape(newShape);
             lastEvents.current.SHAPE = { time: now, handled: false };
             eventTriggered = true;
           }
        } else if (eventTypeRand < 0.50) {
           // COLOR
           const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
           if (newColor !== color) {
             setColor(newColor);
             lastEvents.current.COLOR = { time: now, handled: false };
             eventTriggered = true;
           }
        } else if (eventTypeRand < 0.75) {
           // TURN
           const newDir = direction * -1;
           setDirection(newDir);
           lastEvents.current.TURN = { time: now, handled: false };
           eventTriggered = true;
        } else {
           // JUMP
           // Jump logic handles movement in this tick immediately
           // so we set a flag to skip normal movement or add extra steps
           // Actually, jump is just moving more steps in this tick.
           // We'll handle movement below, just mark event here.
           lastEvents.current.JUMP = { time: now, handled: false };
           eventTriggered = true;
        }

        if (eventTriggered) {
          // Set cooldown to prevent another event for a few steps (e.g. 2-3 seconds or steps)
          // Let's say 2 seconds to give user time to react and "settle"
          cooldownRef.current = now + 2000; 
        }
      }
    }

    // Movement Logic
    // If JUMP event just happened (this tick), we move extra steps.
    // We need to know if JUMP happened *this specific tick*.
    // We can check if lastEvents.current.JUMP.time === now
    
    let steps = 1;
    if (lastEvents.current.JUMP.time === now) {
      steps = 3; // Jump 3 steps
    }

    setPosition(prev => {
      // Use current direction (which might have just changed if TURN happened)
      // If TURN happened this tick, we use the NEW direction.
      // stateRef.current.direction is OLD direction.
      // We need the effective direction for this tick.
      // If we called setDirection, React state update hasn't happened yet in this scope,
      // but we know we changed it.
      
      let effectiveDirection = direction;
      if (lastEvents.current.TURN.time === now) {
        effectiveDirection = direction * -1; // We know we flipped it
      }

      let nextPos = prev + (steps * effectiveDirection);
      if (nextPos >= 12) nextPos = nextPos % 12;
      if (nextPos < 0) nextPos = 12 + (nextPos % 12);
      return nextPos;
    });

    loopRef.current = setTimeout(() => tickRef.current?.(), nextDelay);
  }, [isPlaying, isPaused]); 

  useEffect(() => {
    tickRef.current = robustTick;
  }, [robustTick]);

  // Re-bind tick only when isPlaying changes
  useEffect(() => {
    if (isPlaying && !isPaused) {
      tickRef.current?.();
    }
    return () => clearTimeout(loopRef.current);
  }, [isPlaying, isPaused]);


  const handleInteraction = (type) => { // type: 'SHAPE', 'COLOR', 'TURN', 'JUMP'
    if (!isPlaying) return;

    const event = lastEvents.current[type];
    if (!event) return;

    const now = Date.now();
    const diff = now - event.time;

    if (event.handled) {
      // Already handled, maybe negative points? Or ignore.
      return;
    }

    if (diff <= settings.scoreWindows.excellent.time) {
      setScore(s => s + settings.scoreWindows.excellent.points);
      event.handled = true;
      // Show feedback?
    } else if (diff <= settings.scoreWindows.good.time) {
      setScore(s => s + settings.scoreWindows.good.points);
      event.handled = true;
    } else {
      // Too late, or wrong click. 
      // Prompt says "2 saniyeden sonra basma: 0 puan".
      // Maybe penalty for wrong click?
    }
  };

  return {
    gameState: { isPlaying, isPaused, score, highScore, gameTime, level, position, shape, color, direction },
    actions: { startGame, stopGame, togglePause, handleInteraction, setSettings },
    settings
  };
};
