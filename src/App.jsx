import React, { useState, useRef, useEffect } from "react";
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

const SpaceShooterGame = ({ onGameCompleted, gameCompleted, setGameCompleted }) => {
  const [playerHealth, setPlayerHealth] = useState(100);
  const [bossHealth, setBossHealth] = useState(143);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 80 });
  const [bossPosition, setBossPosition] = useState({ x: 50, y: 10 });
  const [bossDirection, setBossDirection] = useState(1);
  const [bullets, setBullets] = useState([]);
  const [bossBullets, setBossBullets] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [displayText, setDisplayText] = useState("143");
  
  const gameAreaRef = useRef(null);
  const animationStarted = useRef(false); 

  
  const playerShootAudioRef = useRef(null);
  const bossHitAudioRef = useRef(null);
  const playerHitAudioRef = useRef(null);
  const backgroundMusicAudioRef = useRef(null);

  const bossWidth = 100, bossHeight = 100;
  const playerWidth = 50, playerHeight = 50;
  const bulletSize = 20;
  const hitRadius = 50;

  const playerPosRef = useRef(playerPosition);
  const bossPosRef = useRef(bossPosition);
  const bulletsRef = useRef(bullets);
  const bossBulletsRef = useRef(bossBullets);

  useEffect(() => { playerPosRef.current = playerPosition; }, [playerPosition]);
  useEffect(() => { bossPosRef.current = bossPosition; }, [bossPosition]);
  useEffect(() => { bulletsRef.current = bullets; }, [bullets]);
  useEffect(() => { bossBulletsRef.current = bossBullets; }, [bossBullets]);

  const movePlayer = (e) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setPlayerPosition({ x, y });
  };
  

  const shootBullet = () => {
    if (gameOver) return; 
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const { x, y } = playerPosRef.current;
      const bulletX = (x / 100) * rect.width;
      const bulletY = (y / 100) * rect.height;
      setBullets((prev) => [
        ...prev,
        { x: bulletX, y: bulletY, id: Date.now() }
      ]);
  
      if (playerShootAudioRef.current) {
        playerShootAudioRef.current.currentTime = 0;
        playerShootAudioRef.current.play();
      }
    }
  };
  

  const spawnBossBullet = (boss) => {
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const bossPixelX = (boss.x / 100) * rect.width;
      const bossPixelY = (boss.y / 100) * rect.height;
      const { x: pX, y: pY } = playerPosRef.current;
      const playerPixelX = (pX / 100) * rect.width;
      const playerPixelY = (pY / 100) * rect.height;
      const dx = playerPixelX - bossPixelX;
      const dy = playerPixelY - bossPixelY;
      const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;
      const directionX = dx / magnitude;
      const directionY = dy / magnitude;
      setBossBullets((prev) => [
        ...prev,
        {
          x: bossPixelX,
          y: bossPixelY,
          id: Date.now(),
          directionX,
          directionY,
        }
      ]);
    }
  };

  useEffect(() => {
    const movementInterval = setInterval(() => {
      setBossPosition((prev) => {
        const speed = 0.5;
        let newX = prev.x + bossDirection * speed;
        if (newX > 95) { newX = 95; setBossDirection(-1); }
        else if (newX < 5) { newX = 5; setBossDirection(1); }
        return { ...prev, x: newX };
      });
    }, 20);
    return () => clearInterval(movementInterval);
  }, [bossDirection]);

  useEffect(() => {
    const shootingInterval = setInterval(() => {
      spawnBossBullet(bossPosRef.current);
    }, 250);
    return () => clearInterval(shootingInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      shootBullet();
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBullets((prev) =>
        prev.map((bullet) => ({ ...bullet, y: bullet.y - 10 }))
      );
      setBossBullets((prev) =>
        prev.map((bullet) => ({
          ...bullet,
          x: bullet.x + bullet.directionX * 10,
          y: bullet.y + bullet.directionY * 10,
        }))
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      if (!gameAreaRef.current) return;
      const rect = gameAreaRef.current.getBoundingClientRect();

  
      const bossPixelX = (bossPosRef.current.x / 100) * rect.width;
      const bossPixelY = (bossPosRef.current.y / 100) * rect.height;
      const bossCenterX = bossPixelX + bossWidth / 2;
      const bossCenterY = bossPixelY + bossHeight / 2;


      const playerPixelX = (playerPosRef.current.x / 100) * rect.width;
      const playerPixelY = (playerPosRef.current.y / 100) * rect.height;
      const playerCenterX = playerPixelX + playerWidth / 2;
      const playerCenterY = playerPixelY + playerHeight / 2;


      bulletsRef.current.forEach((bullet) => {
        const bulletCenterX = bullet.x + bulletSize / 2;
        const bulletCenterY = bullet.y + bulletSize / 2;
        const dx = bulletCenterX - bossCenterX;
        const dy = bulletCenterY - bossCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < hitRadius) {
          const damage = 1;
          setBossHealth((prev) => Math.max(0, prev - damage));
          setScore((prev) => Math.min(143, prev + damage));
          setBullets((prev) => prev.filter((b) => b.id !== bullet.id));

          if (bossHitAudioRef.current) {
            bossHitAudioRef.current.currentTime = 0;
            bossHitAudioRef.current.play();
          }
        }
      });

     
      bossBulletsRef.current.forEach((bullet) => {
        const bulletCenterX = bullet.x + bulletSize / 2;
        const bulletCenterY = bullet.y + bulletSize / 2;
        const dx = bulletCenterX - playerCenterX;
        const dy = bulletCenterY - playerCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < hitRadius) {
          setPlayerHealth((prev) => Math.max(0, prev - 10));
          setBossBullets((prev) => prev.filter((b) => b.id !== bullet.id));
   
          if (playerHitAudioRef.current) {
            playerHitAudioRef.current.currentTime = 0;
            playerHitAudioRef.current.play();
          }
        }
      });
    }, 50);
    return () => clearInterval(interval);
  }, [gameOver]);


  useEffect(() => {
    if (bossHealth <= 0 && !gameOver) {
      setGameOver(true);
    }
  }, [bossHealth, gameOver]);


  useEffect(() => {
    if (playerHealth <= 0 && !gameOver) {
      setGameOver(true);
      setDisplayText("Game Over");
    }
  }, [playerHealth, gameOver]);


const bellAudioRef = useRef(null);
useEffect(() => {
  if (gameOver && bossHealth <= 0 && !animationStarted.current) {
    animationStarted.current = true;

    const animateText = async () => {
  
      await new Promise((resolve) => setTimeout(resolve, 2000));

  
      let current = "143";
      while (current.length > 0) {
        current = current.slice(0, -1);
        setDisplayText(current);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

    
      const newMessage = "I love you";
      let typed = "";
      for (let i = 0; i < newMessage.length; i++) {
        typed += newMessage[i];
        setDisplayText(typed);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

   
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setDisplayText((prev) => prev + "\nGeraldine");
      if (bellAudioRef.current) {
        bellAudioRef.current.currentTime = 0;
        bellAudioRef.current.play();
      }

      
      await new Promise((resolve) => setTimeout(resolve, 2000));

  
      triggerConfetti();
      setGameCompleted(true);
      onGameCompleted();
    };

    animateText();
  }
}, [gameOver, bossHealth, onGameCompleted, setGameCompleted]);

  const progress = score / 143;
  // Interpolate from top-right (left: 95%, top: 5%) to center (left: 50%, top: 50%)
  const offsetLeft = 0.5; 
  const offsetTop = -0.5; 
  const leftPosition = progress === 1 ? `calc(50% - ${offsetLeft}%)` : `${95 - 48 * progress - offsetLeft}%`;
  const topPosition = progress === 1 ? `calc(50% + ${offsetTop}%)` : `${5 + 42 * progress + offsetTop}%`;
  const scoreFontSize = 1 + progress * 3;

  useEffect(() => {
    if (!gameOver && backgroundMusicAudioRef.current) {
      backgroundMusicAudioRef.current.currentTime = 0;
      backgroundMusicAudioRef.current.play();
    } else if (gameOver && backgroundMusicAudioRef.current) {
      backgroundMusicAudioRef.current.pause();
    }
  }, [gameOver]);

  return (

    <div
  className="game"
  ref={gameAreaRef}
  onMouseMove={movePlayer}
  onTouchMove={(e) => {
    e.preventDefault(); 
    movePlayer(e);
  }}
  style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
>
      {!gameOver && (
        <>
          <div className="health-bar">
            <div className="player-health" style={{ width: `${playerHealth}%` }}></div>
            <div className="boss-health" style={{ width: `${(bossHealth / 143) * 100}%` }}></div>
          </div>
          <motion.div
            className="score"
            initial={{ left: "95%", top: "5%", fontSize: "1rem", scale: 1 }}
            animate={{
              left: leftPosition,
              top: topPosition,
              fontSize: `${scoreFontSize}rem`
            }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              color: "white",
              transform: "translate(-50%, -50%)",
              fontWeight: "bold",
              margin: 0,
              lineHeight: 1,
              textAlign: "center"
            }}
          >
            {score}
          </motion.div>
          <img
            className="player"
            src="/images/bam.png"
            alt="Player"
            style={{
              position: "absolute",
              left: `${(playerPosRef.current.x / 100) * (gameAreaRef.current?.clientWidth || 0)}px`,
              top: `${(playerPosRef.current.y / 100) * (gameAreaRef.current?.clientHeight || 0)}px`,
              width: `${playerWidth}px`,
              height: `${playerHeight}px`
            }}
          />
          <img
            className="boss"
            src="/images/boss.png"
            alt="Boss"
            style={{
              position: "absolute",
              left: `${(bossPosRef.current.x / 100) * (gameAreaRef.current?.clientWidth || 0)}px`,
              top: `${(bossPosRef.current.y / 100) * (gameAreaRef.current?.clientHeight || 0)}px`,
              width: `${bossWidth}px`,
              height: `${bossHeight}px`
            }}
          />
          {bullets.map((bullet) => (
            <img
              key={bullet.id}
              className="bullet"
              src="/images/bullet.png"
              alt="Bullet"
              style={{
                position: "absolute",
                left: `${bullet.x}px`,
                top: `${bullet.y}px`,
                width: `${bulletSize}px`,
                height: `${bulletSize}px`
              }}
            />
          ))}
          {bossBullets.map((bullet) => (
            <img
              key={bullet.id}
              className="boss-bullet"
              src="/images/boss-bullet.png"
              alt="Boss Bullet"
              style={{
                position: "absolute",
                left: `${bullet.x}px`,
                top: `${bullet.y}px`,
                width: `${bulletSize}px`,
                height: `${bulletSize}px`
              }}
            />
          ))}
        </>
      )}

      {gameOver && (
        <motion.div
          className="final-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000
          }}
        >
          <h1
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              fontSize: "4rem",
              fontWeight: "bold",
              margin: 0,
              lineHeight: 1,
              textAlign: "center",
              whiteSpace: "pre-line"
            }}
          >
            {displayText}
          </h1>
        </motion.div>
      )}


<audio ref={bossHitAudioRef} src="/music/pakyu na problem.wav" preload="auto" />
<audio ref={playerHitAudioRef} src="/music/bammy-hit.wav" preload="auto" />
<audio ref={backgroundMusicAudioRef} src="/music/boss.mp3" preload="auto" loop />
<audio ref={bellAudioRef} src="/music/bell.mp3" preload="auto" />

    </div>
  );
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
  const warningAudioRef = useRef(null);

 
  const handleFlip = () => {
    if (step === messages.length - 1 && !flipped) {
  
      if (warningAudioRef.current) {
        warningAudioRef.current.currentTime = 0;
        warningAudioRef.current.play();
      }
      alert("Something's not right... let's fix it together!"); 
      setFlipped(true);
      setTimeout(() => {
        setShowSurprise(true);
        setGameActive(true);
        startBackgroundEffect();
      }, 800);
    }
  };

  const handleNext = () => {
    if (step < messages.length - 1) {
      setStep(step + 1);
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
  const handleGameCompleted = () => {
    setGameCompleted(true);
    setGameActive(false);
    triggerConfetti();
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
              {!gameActive && gameCompleted && (
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

      {gameActive && (
        <SpaceShooterGame
          onGameCompleted={handleGameCompleted}
          gameCompleted={gameCompleted} 
          setGameCompleted={setGameCompleted} 
        />
      )}
    </div>
  );

}

export default App;