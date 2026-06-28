import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6BFF","#FF9F43","#A29BFE","#FD79A8","#00CEC9","#FDCB6E"];
const BALLOON_COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6BFF","#FF9F43","#FD79A8"];
const FIREWORK_COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FFFFFF","#FD79A8","#A29BFE"];

function randomBetween(a, b) { return a + Math.random() * (b - a); }
function randomInt(a, b) { return Math.floor(randomBetween(a, b)); }

function useConfetti(active) {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!active) return;
    const count = 120;
    const ps = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: randomBetween(0, 100),
      y: randomBetween(-20, -5),
      size: randomBetween(6, 14),
      color: COLORS[randomInt(0, COLORS.length)],
      speed: randomBetween(1.5, 4),
      drift: randomBetween(-1, 1),
      rotation: randomBetween(0, 360),
      rotSpeed: randomBetween(-4, 4),
      shape: randomInt(0, 3),
    }));
    setParticles(ps);
  }, [active]);

  useEffect(() => {
    if (!active || particles.length === 0) return;
    let frame;
    let ticks = 0;
    const animate = () => {
      ticks++;
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            y: p.y + p.speed * 0.5,
            x: p.x + p.drift * 0.15,
            rotation: p.rotation + p.rotSpeed,
          }))
          .filter(p => p.y < 110)
      );
      if (ticks < 400) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active, particles.length]);

  return particles;
}

function Confetti({ particles }) {
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden" }}>
      {particles.map(p => {
        const shapes = [
          <div key={p.id} style={{
            width: p.size, height: p.size,
            background: p.color,
            borderRadius: "2px",
            transform: `rotate(${p.rotation}deg)`,
          }} />,
          <div key={p.id} style={{
            width: 0, height: 0,
            borderLeft: `${p.size/2}px solid transparent`,
            borderRight: `${p.size/2}px solid transparent`,
            borderBottom: `${p.size}px solid ${p.color}`,
            transform: `rotate(${p.rotation}deg)`,
          }} />,
          <div key={p.id} style={{
            width: p.size, height: p.size / 3,
            background: p.color,
            borderRadius: p.size,
            transform: `rotate(${p.rotation}deg)`,
          }} />,
        ];
        return (
          <div key={p.id} style={{
            position:"absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            transition: "none",
          }}>
            {shapes[p.shape]}
          </div>
        );
      })}
    </div>
  );
}

function Balloon({ x, color, delay, size = 60 }) {
  return (
    <div style={{
      position: "absolute",
      bottom: "-80px",
      left: `${x}%`,
      animation: `floatUp ${randomBetween(6, 10).toFixed(1)}s ${delay}s ease-in infinite`,
      zIndex: 1,
    }}>
      <svg width={size} height={size * 1.4} viewBox="0 0 60 84" fill="none">
        <ellipse cx="30" cy="28" rx="26" ry="28" fill={color} />
        <ellipse cx="22" cy="18" rx="7" ry="5" fill="white" opacity="0.3" />
        <polygon points="30,56 26,64 34,64" fill={color} />
        <line x1="30" y1="64" x2="28" y2="84" stroke={color} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function Firework({ x, y, color }) {
  const lines = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const rad = (angle * Math.PI) / 180;
    const len = randomBetween(18, 32);
    return {
      x2: x + Math.cos(rad) * len,
      y2: y + Math.sin(rad) * len,
      color: FIREWORK_COLORS[randomInt(0, FIREWORK_COLORS.length)],
    };
  });
  return (
    <g>
      {lines.map((l, i) => (
        <line key={i} x1={x} y1={y} x2={l.x2} y2={l.y2}
          stroke={l.color} strokeWidth="2.5" strokeLinecap="round"
          style={{ animation: `sparkOut 0.8s ease-out forwards` }} />
      ))}
      <circle cx={x} cy={y} r="4" fill={color} style={{ animation: `sparkOut 0.8s ease-out forwards` }} />
    </g>
  );
}

function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    cx: randomBetween(0, 100),
    cy: randomBetween(0, 100),
    r: randomBetween(0.5, 2.5),
    delay: randomBetween(0, 3),
  }));
  return (
    <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none" }} viewBox="0 0 100 100" preserveAspectRatio="none">
      {stars.map(s => (
        <circle key={s.id} cx={s.cx} cy={s.cy} r={s.r} fill="white"
          style={{ animation: `twinkle 2s ${s.delay}s ease-in-out infinite alternate`, opacity: 0.6 }} />
      ))}
    </svg>
  );
}

function useSounds() {
  const musicRef = useRef(null);
  const ctx = useRef(null);

  const getCtx = () => {
    if (!ctx.current) {
      ctx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx.current;
  };

  /* ================= 🎵 BACKGROUND MUSIC ================= */
  useEffect(() => {
    const audio = new Audio("/the_mountain-birthday-490600.mp3");
    audio.loop = true;
    audio.volume = 0.25; // base volume
    musicRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const playMusic = () => {
    const audio = musicRef.current;
    if (!audio) return;

    audio.volume = 0;
    audio.play().catch(() => {});

    // 🔥 smooth fade-in
    let v = 0;
    const fade = setInterval(() => {
      if (v >= 0.25) {
        clearInterval(fade);
        return;
      }
      v += 0.02;
      audio.volume = v;
    }, 100);
  };

  const stopMusic = () => {
    musicRef.current?.pause();
  };

  /* ================= 🔊 POP SOUND ================= */
  const playPopSound = useCallback(() => {
    try {
      const ac = getCtx();

      const buffer = ac.createBuffer(1, ac.sampleRate * 0.1, ac.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      }

      const source = ac.createBufferSource();
      const gain = ac.createGain();

      gain.gain.setValueAtTime(0.08, ac.currentTime); // 🔥 reduced volume

      source.buffer = buffer;
      source.connect(gain);
      gain.connect(ac.destination);

      source.start();
    } catch {}
  }, []);

  /* ================= 🎆 FIREWORK SOUND ================= */
  const playFirework = useCallback(() => {
    try {
      const ac = getCtx();

      [400, 600, 800].forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.05, ac.currentTime);

        osc.connect(gain);
        gain.connect(ac.destination);

        osc.start(ac.currentTime + i * 0.1);
        osc.stop(ac.currentTime + i * 0.1 + 0.25);
      });
    } catch {}
  }, []);

  return {
    playMusic,
    stopMusic,
    // playPopSound,
    playFirework
  };
}
const MESSAGES = [
  "🎉 Wishing you a day filled with love, laughter, and endless joy!",
  "💖 Stay safe, stay blessed, and keep smiling every day.",
  "🥳 Cheers to another year of amazing adventures, unforgettable memories, and new achievements!",
  "🌟 May all your dreams come true. Never give up—always believe in yourself and keep moving forward.",
  "🎂 May this new year of your life bring happiness, success, good health, and countless reasons to smile.",
  "✨ Thank you for being such an amazing friend. I'm grateful to have you in my life.",
  "🤝 No matter where life takes us, I'll always be cheering for you. Keep shining!",
  "🌈 Wishing you endless happiness, peace, and all the success you truly deserve.",
  "🎁 May every moment of your life be filled with love, laughter, and beautiful surprises.",
  "❤️ Happy Birthday, my dear friend! Have a fantastic year ahead and make every moment count!"

];

export default function BirthdayWishingCard() {
  const [phase, setPhase] = useState("intro"); // intro | reveal | party
  const [msgIdx, setMsgIdx] = useState(0);
  const [fireworks, setFireworks] = useState([]);
  const [fwKey, setFwKey] = useState(0);
  const confettiParticles = useConfetti(phase === "party");
  const sounds = useSounds();
  const balloons = Array.from({ length: 12 }, (_, i) => ({
    x: (i / 12) * 95 + 2,
    color: BALLOON_COLORS[i % BALLOON_COLORS.length],
    delay: i * 0.4,
  }));

  const launch = () => {
  sounds.playMusic(); // 🎵 start real music
  setPhase("reveal");
  setTimeout(() => setPhase("party"), 1200);
};

  const spawnFirework = useCallback(() => {
    const fw = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: randomBetween(15, 85),
      y: randomBetween(15, 60),
      color: FIREWORK_COLORS[randomInt(0, FIREWORK_COLORS.length)],
    }));
    setFireworks(fw);
    setFwKey(k => k + 1);
    // sounds.playFirework();
    setTimeout(() => setFireworks([]), 900);
  }, [sounds]);

  useEffect(() => {
    if (phase !== "party") return;
    const t = setInterval(spawnFirework, 2200);
    spawnFirework();
    return () => clearInterval(t);
  }, [phase, spawnFirework]);

  useEffect(() => {
    if (phase !== "party") return;
    const t = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Nunito:wght@400;700;900&display=swap');

        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(20deg); opacity: 0; }
        }
        @keyframes twinkle {
          from { opacity: 0.2; } to { opacity: 1; }
        }
        @keyframes sparkOut {
          0%   { opacity: 1; stroke-width: 2.5; }
          100% { opacity: 0; stroke-width: 0; }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); } 50% { transform: scale(1.08); }
        }
        @keyframes bounce {
          0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); } to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.3) rotate(-10deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes glowPulse {
          0%,100% { text-shadow: 0 0 20px #FFD93D, 0 0 40px #FF6B6B, 0 0 60px #4D96FF; }
          50%     { text-shadow: 0 0 40px #FF6BFF, 0 0 80px #FFD93D, 0 0 120px #6BCB77; }
        }
        @keyframes ribbonWave {
          0%,100% { transform: skewX(0deg); }
          25%     { transform: skewX(3deg); }
          75%     { transform: skewX(-3deg); }
        }
        @keyframes numberPop {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.3) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes floatGently {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes cakeShake {
          0%,100% { transform: rotate(0deg); }
          20%     { transform: rotate(-5deg); }
          40%     { transform: rotate(5deg); }
          60%     { transform: rotate(-3deg); }
          80%     { transform: rotate(3deg); }
        }
        @keyframes candleFlicker {
          0%,100% { transform: scaleY(1) translateX(0); opacity: 1; }
          30%     { transform: scaleY(0.85) translateX(1px); opacity: 0.8; }
          60%     { transform: scaleY(1.1) translateX(-1px); opacity: 1; }
        }

        .intro-btn {
          background: linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF);
          background-size: 300% 300%;
          animation: shimmer 2s linear infinite;
          border: none; cursor: pointer; border-radius: 50px;
          padding: 18px 48px; font-size: 22px; font-weight: 900;
          color: white; text-shadow: 0 2px 8px rgba(0,0,0,0.4);
          box-shadow: 0 8px 32px rgba(255,107,107,0.5);
          font-family: 'Nunito', sans-serif;
          transition: transform 0.15s;
          letter-spacing: 1px;
        }
        .intro-btn:hover { transform: scale(1.06); }
        .intro-btn:active { transform: scale(0.96); }

        .msg-card {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: 24px;
          padding: 16px 28px;
          font-family: 'Nunito', sans-serif;
          font-size: 18px; font-weight: 700;
          color: white;
          text-align: center;
          animation: fadeInUp 0.5s ease;
          text-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0035 0%, #1a0050 20%, #0d1b5e 45%, #0a2d1f 70%, #1a0050 100%)",
        fontFamily: "'Nunito', sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>

        <StarField />

        {/* Balloons */}
        {phase === "party" && (
          <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:2,overflow:"hidden" }}>
            {balloons.map((b, i) => (
              <Balloon key={i} x={b.x} color={b.color} delay={b.delay} size={48 + randomInt(0, 20)} />
            ))}
          </div>
        )}

        {/* Fireworks SVG layer */}
        <svg key={fwKey} style={{ position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:5 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          {fireworks.map(fw => <Firework key={fw.id} x={fw.x} y={fw.y} color={fw.color} />)}
        </svg>

        {/* Confetti */}
        <Confetti particles={confettiParticles} />

        {/* ── INTRO PHASE ── */}
        {phase === "intro" && (
          <div style={{ textAlign:"center", zIndex:10, padding:"2rem", animation:"fadeInUp 0.8s ease" }}>
            <div style={{ fontSize:"80px", marginBottom:"16px", animation:"bounce 1.5s ease infinite" }}>🎂</div>
            <h1 style={{
              fontFamily:"'Pacifico', cursive",
              fontSize: "clamp(32px, 8vw, 68px)",
              color: "white",
              margin: "0 0 8px",
              textShadow: "0 4px 24px rgba(255,107,107,0.8)",
              lineHeight: 1.15,
            }}>
              Someone's Birthday
            </h1>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:"20px", marginBottom:"36px" }}>
              Click to begin the celebration ✨
            </p>
            <button className="intro-btn" onClick={launch}>
              🎉 Let's Party!
            </button>
          </div>
        )}

        {/* ── REVEAL PHASE ── */}
        {phase === "reveal" && (
          <div style={{ textAlign:"center", zIndex:10, animation:"zoomIn 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
            <div style={{ fontSize:"100px" }}>🎊</div>
          </div>
        )}

        {/* ── PARTY PHASE ── */}
        {phase === "party" && (
          <div style={{
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "28px",
            padding: "2rem 1.5rem",
            maxWidth: "600px",
            width: "100%",
          }}>

            {/* Name banner */}
            <div style={{
              background: "linear-gradient(90deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #FF6BFF)",
              backgroundSize: "300% 100%",
              animation: "shimmer 2s linear infinite, ribbonWave 3s ease infinite",
              borderRadius: "16px",
              padding: "10px 40px",
              fontFamily: "'Pacifico', cursive",
              fontSize: "clamp(15px, 4vw, 22px)",
              color: "white",
              letterSpacing: "3px",
              textTransform: "uppercase",
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}>
              🥳 Happy Birthday 🥳
            </div>

            {/* Main name */}
            <h1
  style={{
    fontFamily: "'Pacifico', cursive",
    fontSize: "clamp(60px, 16vw, 120px)",
    margin: 0,
    color: "#2ADBE8",
    lineHeight: 1.1,
    textAlign: "center",
    letterSpacing: "3px",
    animation: "floatGently 3s ease-in-out infinite",
    textShadow: `
      0 0 8px rgba(255,224,102,0.8),
      0 0 20px rgba(255,193,7,0.7),
      0 0 40px rgba(255,107,107,0.4),
      4px 4px 12px rgba(0,0,0,0.45)
    `,
  }}
>
  Joyee
</h1>
            {/* Age */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}>
              <span style={{ fontSize: "40px" }}>🎂</span>
              <div style={{
                fontFamily: "'Pacifico', cursive",
                fontSize: "clamp(64px, 20vw, 130px)",
                color: "#FFD93D",
                textShadow: "0 0 40px rgba(255,217,61,0.8), 0 0 80px rgba(255,107,107,0.5)",
                animation: "numberPop 0.8s cubic-bezier(0.34,1.56,0.64,1) both, pulse 2s ease infinite",
                lineHeight: 1,
              }}>
                22
              </div>
              <span style={{ fontSize: "40px" }}>🎂</span>
            </div>

            {/* Cake illustration */}
            <div style={{ animation: "cakeShake 4s ease infinite", fontSize: "72px" }}>🎉</div>

            {/* Rotating message */}
            <div className="msg-card" key={msgIdx} style={{ maxWidth: "460px", width: "100%" }}>
              {MESSAGES[msgIdx]}
            </div>

            {/* Candles row */}
            <div style={{ display:"flex", gap:"10px", alignItems:"center", flexWrap:"wrap", justifyContent:"center" }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "1px",
                  animation: `floatGently ${(1.5 + i * 0.12).toFixed(2)}s ease infinite`,
                }}>
                  <div style={{
                    width: "6px", height: "12px",
                    background: "linear-gradient(to top, #FFD93D, white)",
                    borderRadius: "50% 50% 0 0",
                    animation: `candleFlicker ${(0.4 + Math.random() * 0.4).toFixed(2)}s ease infinite`,
                  }} />
                  <div style={{
                    width: "8px", height: "22px",
                    background: COLORS[i % COLORS.length],
                    borderRadius: "2px 2px 4px 4px",
                  }} />
                </div>
              ))}
            </div>

            {/* Subtitle */}
            <p style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "17px",
              textAlign: "center",
              margin: 0,
              lineHeight: 1.6,
              maxWidth: "380px",
              animation: "fadeInUp 1s 0.5s ease both",
            }}>
              {/* Wishing you the most amazing, joyful, and unforgettable birthday! The best is yet to come 🌟 */}
            </p>

            

            {/* Emoji row */}
            <div style={{ display:"flex", gap:"18px", fontSize:"36px", flexWrap:"wrap", justifyContent:"center", animation:"fadeInUp 1s 0.8s ease both" }}>
              {["🎁","🍰","🥂","🌟","💃","🕺","🎈","🏆"].map((e,i) => (
                <span key={i} style={{ animation:`bounce ${(1.2 + i * 0.15).toFixed(2)}s ease infinite`, display:"inline-block" }}>{e}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}