import { useEffect, useState } from "react";
import { Theme } from "../utils/firework";

interface EmojiCascadeProps {
  theme: Theme;
  isActive: boolean;
  onComplete: () => void;
}

const THEME_EMOJIS: Record<Theme, string[]> = {
  confetti: ["🎉", "🎊", "🥳", "🎈", "🎁", "🍰", "🎂", "🎪"],
  hearts: ["💖", "💕", "💓", "💗", "❤️", "💙", "💚", "💛", "🧡", "💜"],
  stars: ["✨", "⭐", "🌟", "💫", "🔆", "⚡", "🌠", "💥"],
  magic: ["🪄", "✨", "🔮", "🎭", "🌙", "⭐", "🧙‍♀️", "🦄"],
  dinosaurs: ["🦕", "🦖", "🦴", "🥚", "🌿", "🦘", "🐊", "🌋"],
  princess: ["👸", "👑", "💎", "🏰", "🦄", "🌸", "💖", "🌹"],
  vehicles: ["🚗", "🚙", "🚐", "🚛", "✈️", "🚁", "🚂", "🚢"],
  party: ["🥳", "🎉", "🎊", "🎈", "🎂", "🍰", "🎁", "🎪"],
  pets: ["🐶", "🐱", "🐠", "🐦", "🦎", "❤️", "💖", "🎉", "✨", "🌟"]
};

interface FallingEmoji {
  id: string;
  emoji: string;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
}

export function EmojiCascade({ theme, isActive, onComplete }: EmojiCascadeProps) {
  const [emojis, setEmojis] = useState<FallingEmoji[]>([]);
  const [animationId, setAnimationId] = useState<number | null>(null);

  useEffect(() => {
    console.log(`EmojiCascade effect: isActive=${isActive}, theme=${theme}`);
    if (!isActive) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        setAnimationId(null);
      }
      setEmojis([]);
      return;
    }

    // Prevent multiple starts - exit early if already running
    if (animationId) {
      console.log('Animation already running, skipping restart');
      return;
    }

    console.log(`Starting ${theme} cascade animation`);
    const themeEmojis = THEME_EMOJIS[theme] || THEME_EMOJIS.confetti;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Adjust animation parameters based on screen size
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    const isDesktop = screenWidth >= 1024;
    
    // FINAL FIX: Use time-based movement instead of frame-based
    // Desktop high refresh rate was making movement crawl
    const emojiCount = isMobile ? 30 : isTablet ? 40 : 60;
    // Speed in pixels per SECOND, not per frame
    const baseSpeedPerSecond = isMobile ? 240 : isTablet ? 400 : 800; // 800px/sec for desktop
    const speedVariationPerSecond = isMobile ? 120 : isTablet ? 200 : 400; // High variation
    const startHeight = isMobile ? 300 : isTablet ? 400 : 800;
    
    // Create initial batch of emojis - scaled for screen size
    const initialEmojis: FallingEmoji[] = [];
    const baseTime = Date.now();
    for (let i = 0; i < emojiCount; i++) {
      initialEmojis.push({
        id: `initial-${baseTime}-${i}`, // Unique string IDs
        emoji: themeEmojis[Math.floor(Math.random() * themeEmojis.length)],
        x: Math.random() * screenWidth,
        y: -50 - (Math.random() * startHeight), // Start higher above screen
        speed: baseSpeedPerSecond + Math.random() * speedVariationPerSecond, // Speed in px/sec
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 3, // Slightly slower rotation
        size: 28 + Math.random() * 16, // Slightly larger emojis
      });
    }
    
    setEmojis(initialEmojis);

    let startTime = Date.now();
    let lastSpawnTime = 0;
    let lastUpdateTime = startTime;
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const deltaTime = currentTime - lastUpdateTime;
      lastUpdateTime = currentTime;
      
      setEmojis(prevEmojis => {
        let newEmojis = [...prevEmojis];
        
        // AGGRESSIVE SPAWNING: Flood the screen for full coverage
        const spawnDuration = isMobile ? 2500 : isTablet ? 3000 : 8000; // Long spawn period for coverage
        const spawnInterval = isMobile ? 150 : isTablet ? 130 : 50; // Very fast spawning
        const spawnCount = isMobile ? 3 : isTablet ? 3 : 8; // Many emojis per spawn
        
        if (elapsed < spawnDuration && currentTime - lastSpawnTime > spawnInterval) {
          for (let i = 0; i < spawnCount; i++) {
            newEmojis.push({
              id: `spawn-${currentTime}-${Math.random()}-${i}`, // Unique string IDs
              emoji: themeEmojis[Math.floor(Math.random() * themeEmojis.length)],
              x: Math.random() * screenWidth,
              y: -50,
              speed: baseSpeedPerSecond + Math.random() * speedVariationPerSecond,
              rotation: Math.random() * 360,
              rotationSpeed: (Math.random() - 0.5) * 3,
              size: 28 + Math.random() * 16,
            });
          }
          lastSpawnTime = currentTime;
        }
        
        // FINAL FIX: Use time-based movement for consistent speed across all refresh rates
        // Convert speed from pixels/second to pixels/frame based on actual deltaTime
        const secondsElapsed = deltaTime / 1000; // Convert ms to seconds
        newEmojis = newEmojis
          .map(emoji => ({
            ...emoji,
            y: emoji.y + (emoji.speed * secondsElapsed), // Time-based movement
            rotation: emoji.rotation + (emoji.rotationSpeed * secondsElapsed * 60), // Scale rotation
          }))
          .filter(emoji => emoji.y < screenHeight + 100);
        
        // Remove emojis that are far off screen to prevent memory buildup
        newEmojis = newEmojis.filter(emoji => emoji.y > -200 && emoji.y < screenHeight + 200);
        
        // FIXED: Don't terminate early - let the timing logic handle completion
        // This was causing premature termination when fast emojis fell off screen
        
        return newEmojis;
      });
      
      // FIXED TIMING: Force full duration regardless of emoji positions
      // Don't check if emojis are gone - just run for the full time
      const maxTime = isMobile ? 6000 : isTablet ? 7000 : 20000; // Force full duration
      const maxTimeReached = elapsed > maxTime;

      if (!maxTimeReached) {
        const id = requestAnimationFrame(animate);
        setAnimationId(id);
      } else {
        // Animation finished - clean up
        console.log(`Cascade animation completed after ${elapsed}ms`);
        setAnimationId(null);
        setEmojis([]);
        onComplete();
      }
    };
    
    const id = requestAnimationFrame(animate);
    setAnimationId(id);
    
    return () => {
      if (id) cancelAnimationFrame(id);
    };
  }, [isActive, theme, onComplete]);

  if (!isActive || emojis.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50"
      style={{ zIndex: 9999 }}
    >
      {emojis.map(emoji => (
        <div
          key={emoji.id}
          className="absolute select-none"
          style={{
            left: `${emoji.x}px`,
            top: `${emoji.y}px`,
            fontSize: `${emoji.size}px`,
            transform: `rotate(${emoji.rotation}deg)`,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
}