import { useEffect, useRef, useState } from "react";
import bg from "../assets/authBg.png";
import { FaEnvelope, FaLock, FaRobot } from "react-icons/fa";
import { PiEyeClosedBold, PiEyeFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { userDataContext } from "../context/userDataContext";
import axios from "axios";

const TEXTS = [
  "Experience the Future of AI",
  "Your Smart AI Companion",
  "Powered by Intelligence",
];

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl , setUserData} = useContext(userDataContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading , setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");

  const canvasRef = useRef(null);
  const [textIndex, setTextIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  const handleSignIn = async (e) => {
    // Implement sign-in logic here (e.g., API call to backend)
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      let result = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email, password },
      );
      localStorage.setItem("token", result.data.token);
      setUserData(result.data.user);
      setLoading(false)
      navigate("/");
    } catch (e) {
      console.error("Error signing in:", e);
      setLoading(false);
      setUserData(null);
      setErr(e?.response?.data?.message || "An error occurred during sign-in.");
    }
  };

  // Particle network canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 80;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255,${1 - dist / 130})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grad.addColorStop(0, "rgba(255,255,255,0.9)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Typewriter effect
  useEffect(() => {
    const full = TEXTS[textIndex];
    let i = displayed.length;

    if (typing) {
      if (i < full.length) {
        const t = setTimeout(() => setDisplayed(full.slice(0, i + 1)), 60);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 1800);
        return () => clearTimeout(t);
      }
    } else {
      if (i > 0) {
        const t = setTimeout(() => setDisplayed(full.slice(0, i - 1)), 35);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setDisplayed("");
          setTextIndex((prev) => (prev + 1) % TEXTS.length);
          setTyping(true);
        }, 300);
        return () => clearTimeout(t);
      }
    }
  }, [displayed, typing, textIndex]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* PARTICLE CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* TOP LEFT GLOW */}
      <div className="absolute top-0 left-0 w-125 h-125 bg-pink-500/30 rounded-full blur-[160px] rotate-glow"></div>

      {/* TOP RIGHT GLOW */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-cyan-500/30 rounded-full blur-[160px] rotate-glow"></div>

      {/* BOTTOM LEFT GLOW */}
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-purple-500/30 rounded-full blur-[160px] rotate-glow"></div>

      {/* BOTTOM RIGHT GLOW */}
      <div className="absolute bottom-0 right-0 w-125 h-125 bg-pink-500/25 rounded-full blur-[160px] rotate-glow"></div>

      {/* MID LEFT GLOW */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-100 h-100 bg-cyan-500/20 rounded-full blur-[140px] rotate-glow"></div>

      {/* MID RIGHT GLOW */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-100 h-100 bg-purple-500/20 rounded-full blur-[140px] rotate-glow"></div>

      {/* CENTER LIGHT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 bg-purple-500/10 rounded-full blur-[180px]"></div>

      {/* MAIN CARD */}
      <form
        className="float-card relative z-10 w-[92%] max-w-xl p-7 rounded-[40px] overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.6)] hover:scale-[1.01] transition-all duration-500 cursor-pointer"
        onSubmit={handleSignIn}
      >
        {/* TOP GLOW LINE */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-pink-500 via-cyan-400 to-purple-500 glow-line"></div>

        {/* ROBOT ICON */}
        <div className="flex justify-center mb-5">
          <div className="relative w-22 h-22 rounded-full bg-linear-to-r from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.6)] icon-pulse">
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-pink-500 via-purple-500 to-cyan-500 blur-md opacity-70 animate-ping"></div>
            <FaRobot className="relative text-white text-5xl z-10" />
          </div>
        </div>

        {/* HEADING */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-extrabold tracking-wide text-white">
            {/* <span className='italic text-cyan-300 font-serif'>
    Sign In
  </span> */}{" "}
            Virtual
            <span className="bg-linear-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {" "}
              Assistant
            </span>
          </h1>
          <p className="text-gray-300 mt-2 text-xl tracking-wide min-h-8">
            {displayed}
            <span className="animate-pulse text-pink-400">|</span>
          </p>
        </div>

        {/* EMAIL */}
        <div className="input-field hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] mb-4">
          <FaEnvelope className="text-cyan-400 text-2xl shrink-0" />
          <input
            type="email"
            placeholder="Enter your email"
            className="input-base"
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        {/* PASSWORD */}
        <div className="input-field hover:border-purple-700 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-5 relative">
          <FaLock className="text-purple-400 text-2xl shrink-0" />

          <input
            type={showPassword ? "text" : "password"}
            minLength={6}
            placeholder="Enter your password"
            className="input-base"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />

          {!showPassword && (
            <PiEyeClosedBold
              className="absolute top-3.5 right-5 text-white w-7 h-7 cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )}
          {showPassword && (
            <PiEyeFill
              className="absolute top-3.5 right-5 text-white w-7 h-7 cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          )}
        </div>

        {err.length > 0 && (
          <p className="text-red-400 text-center font-semibold text-lg mb-3">
            * {err}
          </p>
        )}

        {/* BUTTON */}
        <button className="relative overflow-hidden w-full py-4 rounded-2xl text-xl font-bold tracking-wide text-white bg-linear-to-r from-pink-500 via-purple-500 to-cyan-500 hover:scale-105 transition-all duration-300 shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:shadow-[0_0_80px_rgba(168,85,247,0.8)]" disabled={loading}>
          <span className="relative z-10 text-2xl">{loading ? "Loading..." : "Sign In"}</span>
          <div className="absolute top-0 left-full w-full h-full bg-white/20 skew-x-12 animate-[shine_3s_linear_infinite]"></div>
        </button>

        {/* LOGIN */}
        <p
          className="text-center text-gray-300 mt-5 text-lg"
          onClick={() => navigate("/signup")}
        >
          Want to Create a new account?
          <span className="text-pink-400 hover:text-cyan-400 cursor-pointer ml-2 transition-all duration-300 hover:underline">
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignIn;
