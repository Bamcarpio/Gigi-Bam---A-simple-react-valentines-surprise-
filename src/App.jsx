import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import "./App.css";
import confetti from "canvas-confetti";

const messages = [
  "Happy Valentine's Day, love!",
  "Salamat at natagpuan kita.",
  "You're my favorite part of being alive.",
  "Tap the card for a surprise!",
];

const backgroundImages = [
  "https://placehold.co/600x400",
  "https://placehold.co/600x400",
  "https://placehold.co/600x400",
  "https://placehold.co/600x400",
  "https://placehold.co/600x400",
];

const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
};

function App() {
  const [step, setStep] = useState(0);
  const [showSurprise, setShowSurprise] = useState(false);
  const [heartsActive, setHeartsActive] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [activeImages, setActiveImages] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const handleNext = () => {
    if (step < messages.length - 1) {
      setStep(step + 1);
    }
  };

  const handleFlip = () => {
    if (step === messages.length - 1 && !flipped) {
      setFlipped(true);
      setTimeout(() => {
        setShowSurprise(true);
        setGameActive(true); // Start the game
        startBackgroundEffect();
      }, 800);
    }
  };

  const startHeartRain = () => {
    if (heartsActive) return;
    setHeartsActive(true);
    setInterval(() => {
      const heart = document.createElement("div");
      heart.className = "heart";
      heart.innerText = "❤️";
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.animationDuration = `${Math.random() * 2 + 3}s`;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 5000);
    }, 300);
  };

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setMusicPlaying(true);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      musicPlaying ? audioRef.current.pause() : audioRef.current.play();
      setMusicPlaying(!musicPlaying);
    }
  };

  const startBackgroundEffect = () => {
    setInterval(() => {
      setActiveImages((prev) => {
        const newImages = [...prev];
        if (newImages.length < 5) {
          newImages.push({
            id: Math.random(),
            src: backgroundImages[Math.floor(Math.random() * backgroundImages.length)],
            left: `${Math.random() * 80}vw`,
            top: `${Math.random() * 80}vh`,
          });
        } else {
          newImages.shift();
        }
        return newImages;
      });
    }, 1000);
  };

  const handleGameClick = () => {
    setGameCompleted(true);
    setGameActive(false);
    triggerConfetti(); // Trigger confetti after game is completed
    startHeartRain();
    playMusic();
    startBackgroundEffect();
  };
  

  return (
    <div className="container">
      <audio ref={audioRef} loop>
        <source src="/music/gii.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      {showSurprise && (
        <div className="background-effect">
          {activeImages.map((image) => (
            <motion.img
              key={image.id}
              src={image.src}
              className="background-tile"
              style={{ left: image.left, top: image.top }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          ))}
        </div>
      )}

      <motion.div
        className={`card ${flipped ? "flipped" : ""}`}
        onClick={step === messages.length - 1 ? handleFlip : null}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-inner">
          {!showSurprise ? (
            <div className="card-front">
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="message"
              >
                {messages[step]}
              </motion.p>
              {step < messages.length - 1 && (
                <button className="next-btn" onClick={handleNext}>
                  Next 
                </button>
              )}
            </div>
          ) : (
            <div className="card-back">
              {gameActive && !gameCompleted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="game"
                >
                  <p>Catch the love! ❤️</p>
                  <motion.div
                    className="game-heart"
                    onClick={handleGameClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      position: "absolute",
                      left: `${Math.random() * 80}%`,
                      top: `${Math.random() * 80}%`,
                      cursor: "pointer",
                    }}
                  >
                    ❤️
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="surprise"
                >
                  I love you forever, my Geraldine!
                  <motion.video
                    ref={videoRef}
                    src="/videos/gigiandbam.mp4" 
                    alt="Love"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    autoPlay
                    loop
                    muted
                    controls={false}
                    style={{ width: "100%", height: "auto", borderRadius: "10px" }}
                  />
                  <button className="music-btn" onClick={toggleMusic}>
                    {musicPlaying ? "Pause Music ⏸️" : "Play Music ▶️"}
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default App;
