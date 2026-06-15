import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/userDataContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif";

const Home = () => {
  // ---------------------------
  // 1) COMPONENT STATE
  // ---------------------------
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [assistantStatus, setAssistantStatus] = useState("Idle");
  const [ham, setHam] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [assistantEnabled, setAssistantEnabled] = useState(false);

  // ---------------------------
  // 2) REFS FOR VOICE / SPEECH FLOW
  // ---------------------------
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const restartTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const assistantEnabledRef = useRef(false); // tracks latest value inside closures
  // const externalWindowRef = useRef(null);

  // ---------------------------
  // 3) CONTEXT + NAVIGATION
  // ---------------------------
  const { userData, setUserData, serverUrl, getGeminiResponse } =
    useContext(userDataContext);

  const navigate = useNavigate();

  // ---------------------------
  // 4) AUTH / NAVIGATION HANDLERS
  // ---------------------------
  const clearHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${serverUrl}/api/user/clearHistory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData((prev) => (prev ? { ...prev, history: [] } : prev));
    } catch (error) {
      console.log("Clear history failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      console.log(error);
      setUserData(null);
      navigate("/signin");
    }
  };

  // Open external websites in a dedicated popup window.
  // The window is created on the Start Assistant click, which avoids browser popup blocking.

  // const ensureExternalWindow = useCallback(() => {
  //   console.log("Creating popup...");

  //   if (!externalWindowRef.current || externalWindowRef.current.closed) {
  //     externalWindowRef.current = window.open(
  //       "about:blank",
  //       "_blank",
  //       "noopener,noreferrer",
  //     );

  //     if (externalWindowRef.current) {
  //       externalWindowRef.current.opener = null;
  //     }
  //   }

  //   return externalWindowRef.current;
  // }, []);

  // const openExternalLink = useCallback(
  //   (url) => {
  //     const popup = ensureExternalWindow();

  //     if (popup) {
  //       popup.location.href = url;
  //       popup.focus();
  //       return;
  //     }

  //     try {
  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.target = "_blank";
  //       link.rel = "noopener noreferrer";
  //       link.click();
  //     } catch (error) {
  //       console.warn("Could not open external link:", error);
  //     }
  //   },
  //   [ensureExternalWindow],
  // );

  // ---------------------------
  // 5) VOICE RECOGNITION HELPERS
  // ---------------------------

  const getCleanCommandText = useCallback(
    (transcript = "") => {
      const assistantName = userData?.assistantName || "assistant";
      const withoutName = transcript
        .replace(new RegExp(`\\b${assistantName}\\b`, "gi"), "")
        .replace(/\b(hey|hello|assistant)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      return withoutName;
    },
    [userData?.assistantName],
  );

  const startRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      console.warn("Speech recognition is not ready yet.");
      return;
    }

    if (isSpeakingRef.current || isRecognizingRef.current) {
      return;
    }

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    try {
      recognitionRef.current.start();
      console.log("Recognition requested to start");
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Start error:", error);
      }
    }
  }, []);

  const stopAssistant = () => {
    assistantEnabledRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();

    // if (externalWindowRef.current && !externalWindowRef.current.closed) {
    //   externalWindowRef.current.close();
    // }
    // externalWindowRef.current = null;

    isSpeakingRef.current = false;
    isRecognizingRef.current = false;

    setListening(false);
    setAssistantStatus("Stopped");
    setAssistantEnabled(false);
    setChatStarted(false);
  };

  // ---------------------------
  // 6) SPEECH HANDLER
  // ---------------------------
  const speak = useCallback(
    (text) => {
      const safeText = String(text || "").trim();

      if (!safeText || !window.speechSynthesis) {
        return;
      }

      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }

      window.speechSynthesis.cancel();

      const utterence = new SpeechSynthesisUtterance(safeText);
      utterence.lang = "en-IN";
      utterence.rate = 1.25;
      utterence.pitch = 1.05;
      utterence.volume = 1;

      // voices are already pre-warmed on mount — pick immediately
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.name.includes("Google US English")) ||
        voices.find((v) => v.name.includes("Microsoft")) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];

      if (preferredVoice) utterence.voice = preferredVoice;

      isSpeakingRef.current = true;
      setAssistantStatus("Speaking");

      utterence.onstart = () => {
        setAssistantStatus("Speaking");
      };

      utterence.onend = () => {
        if (!isMountedRef.current) return;

        isSpeakingRef.current = false;
        setAiText("");

        if (!assistantEnabledRef.current) {
          setAssistantStatus("Stopped");
          return;
        }

        setAssistantStatus("Listening");

        restartTimerRef.current = setTimeout(() => {
          if (isMountedRef.current && assistantEnabledRef.current) {
            startRecognition();
          }
        }, 350);
      };

      utterence.onerror = () => {
        isSpeakingRef.current = false;
        setAssistantStatus("Listening");
      };

      window.speechSynthesis.speak(utterence);
    },
    [startRecognition],
  );

  // ---------------------------
  // 7) GREETING LOGIC
  // ---------------------------
  const greetUserOncePerDay = useCallback(() => {
    const greetText = `Assistant activated. How can I help you?`;

    // wait for voices to be ready then speak immediately
    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          speak(greetText);
        };
      } else {
        speak(greetText);
      }
    };

    doSpeak();
  }, [speak]);

  // ---------------------------
  // 8) COMMAND ROUTER
  // ---------------------------
  const handleCommand = useCallback(
    (data, preOpenedWindow) => {
      console.log("DATA RECEIVED =", data);
      console.log("TYPE =", data?.type);
      console.log("USER INPUT =", data?.userInput);

      if (!data) {
        preOpenedWindow?.close();
        return;
      }

      const { type, userInput, response } = data;

      speak(response);

      const urlMap = {
        "google-search": `https://www.google.com/search?q=${encodeURIComponent(userInput || "")}`,
        "calculator-open": "https://www.google.com/search?q=calculator",
        "instagram-open": "https://www.instagram.com/",
        "facebook-open": "https://www.facebook.com/",
        "whatsapp-open": "https://web.whatsapp.com/",
        "gmail-open": "https://mail.google.com/",
        "github-open": "https://github.com/",
        "linkedin-open": "https://www.linkedin.com/",
        "chatgpt-open": "https://chatgpt.com/",
        "maps-open": "https://maps.google.com/",
        "weather-show": "https://www.google.com/search?q=weather",
        "youtube-search": `https://www.youtube.com/results?search_query=${encodeURIComponent(userInput || "")}`,
        "youtube-play": `https://www.youtube.com/results?search_query=${encodeURIComponent(userInput || "")}`,
      };

      const url = urlMap[type];

      if (url && preOpenedWindow && !preOpenedWindow.closed) {
        preOpenedWindow.location.href = url;
      } else if (url) {
        window.open(url, "_blank");
      } else {
        preOpenedWindow?.close();
      }
    },
    [speak],
  );

  // ---------------------------
  // 9) SPEECH RECOGNITION EFFECT
  // ---------------------------
  // useEffect(() => {
  //   if (!assistantEnabled) return;

  //   if (!recognitionRef.current || isRecognizingRef.current) return;

  //   const timer = setTimeout(() => {
  //     try {
  //       recognitionRef.current?.start();
  //       console.log("Recognition started from enabled effect");
  //     } catch (error) {
  //       if (error.name !== "InvalidStateError") {
  //         console.error("Start error:", error);
  //       }
  //     }
  //   }, 150);

  //   return () => clearTimeout(timer);
  // }, [assistantEnabled]);

  useEffect(() => {
    isMountedRef.current = true;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
      setAssistantStatus("Listening");
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);

      if (assistantEnabledRef.current && !isSpeakingRef.current && isMountedRef.current) {
        restartTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          try {
            startRecognition();
          } catch (error) {
            console.warn("Speech recognition restart failed:", error);
          }
        }, 400);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);

      isRecognizingRef.current = false;
      setListening(false);

      if (event.error === "no-speech") {
        if (assistantEnabledRef.current && isMountedRef.current && !isSpeakingRef.current) {
          restartTimerRef.current = setTimeout(() => startRecognition(), 400);
        }
        return;
      }

      setAssistantStatus("Error");

      if (
        assistantEnabledRef.current &&
        event.error !== "aborted" &&
        isMountedRef.current &&
        !isSpeakingRef.current
      ) {
        restartTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;

          try {
            recognitionRef.current?.start();
            console.log("Recognition restarted after error");
          } catch (error) {
            if (error.name !== "InvalidStateError") {
              console.error("Restart error:", error);
            }
          }
        }, 500);
      }
    };

recognition.onresult = async (e) => {
  const transcript =
    e.results[e.results.length - 1][0].transcript.trim();

  console.log("Heard:", transcript);

  if (!assistantEnabledRef.current) return;

  const cleanCommand = getCleanCommandText(transcript);

  if (!cleanCommand || cleanCommand.length < 3) {
    console.log("Ignored: command is too short");
    return;
  }

  setAiText("");
  setUserText(cleanCommand);
  setAssistantStatus("Processing");

  recognition.stop();

  // Open a blank window immediately (within the sync event handler)
  // so the browser allows it, then navigate to the URL after async response
  const preOpenedWindow = window.open("", "_blank");

  try {
    console.log("Sending to Gemini:", cleanCommand);

    let data = await getGeminiResponse(cleanCommand);

    console.log("Gemini Returned:", data);

    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (error) {
        console.error("JSON Parse Error:", error);
        preOpenedWindow?.close();
        return;
      }
    }

    console.log("RAW GEMINI DATA:", data);

    if (data) {
      console.log("FINAL COMMAND:", data);
      setAiText(data.response);
      handleCommand(data, preOpenedWindow);
      setUserData((prev) => prev ? { ...prev, history: [...(prev.history || []), cleanCommand] } : prev);
    }
  } catch (error) {
    console.error(error);
    preOpenedWindow?.close();
    setAiText("Sorry, something went wrong.");
    speak("Sorry, something went wrong.");
  }
};

    // if (userData?.name && !greetedRef.current) {
    //   greetedRef.current = true;

    //   const greeting = new SpeechSynthesisUtterance(
    //     `Hello ${userData.name}, how can I help you today?`,
    //   );

    //   window.speechSynthesis.speak(greeting);
    // }

    return () => {
      isMountedRef.current = false;

      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }

      recognition.stop();
      window.speechSynthesis.cancel();
    };
}, [
  assistantEnabled,
  getGeminiResponse,
  handleCommand,
  getCleanCommandText,
  speak,
  startRecognition,
  setUserData,
  userData?.assistantName,
  userData?.name,
]);

  return (
    <div
      className="relative w-full min-h-screen overflow-x-hidden flex flex-col items-center justify-center px-4 py-8 bg-linear-to-br from-black via-[#12061f] to-black"
    >
      {/* MOBILE MENU BUTTON */}
      {!assistantEnabled && (
        <CgMenuRight
          className="lg:hidden text-white absolute top-6 right-6 w-7 h-7 z-50 cursor-pointer"
          onClick={() => setHam(true)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed lg:hidden top-0 right-0 w-full h-full bg-black/70 backdrop-blur-xl p-5 z-50 transition-transform duration-300 ${
          ham ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <RxCross1
          className="text-white absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={() => setHam(false)}
        />
        <button
          className="w-full h-14 bg-white text-black rounded-full font-semibold mt-10"
          onClick={handleLogout}
        >
          Sign Out
        </button>
        <button
          className="w-full h-14 bg-white text-black rounded-full font-semibold mt-4"
          onClick={() => navigate("/customize")}
        >
          Customize Assistant
        </button>
        <div className="w-full h-px bg-gray-500 my-6" />
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-white text-xl font-semibold">History</h2>
          <button
            type="button"
            onClick={clearHistory}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-white/10 hover:text-white transition"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh]">
          {[...(userData?.history || [])].slice().reverse().map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-gray-300"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-pink-500 via-purple-500 to-cyan-400 text-xs font-bold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-5 text-white/90">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 6px), linear-gradient(to bottom, white 1px, transparent 8px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* GLOW */}
      <div className="absolute w-125 h-125 bg-purple-600/15 rounded-full blur-[200px]" />

      {/* ---- MAIN LAYOUT: sidebar + card side by side on lg ---- */}
      <div className="relative z-10 w-full max-w-6xl flex items-center justify-center gap-8">

        {/* DESKTOP HISTORY SIDEBAR — hidden below lg, never overlaps */}
        {!assistantEnabled && (
          <div className="hidden lg:flex flex-col w-72 shrink-0 h-[75vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-white text-xl font-bold">History</h2>
              <button
                type="button"
                onClick={clearHistory}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-white/10 hover:text-white transition"
              >
                Clear History
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {(userData?.history || []).length === 0 ? (
                <p className="text-gray-500 text-sm text-center mt-6">No history yet. Start talking to your assistant!</p>
              ) : (
                [...(userData?.history || [])].slice().reverse().map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-gray-300"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-pink-500 via-purple-500 to-cyan-400 text-xs font-bold text-white shadow-lg shadow-purple-500/30">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-5 text-white/90">{item}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MAIN CARD — always centered, takes full width when sidebar is hidden */}
        <div className="relative w-full max-w-lg p-6 rounded-[40px] bg-white/10 backdrop-blur-xl border border-white/20 transition-all duration-700 text-center mx-auto">
        {/* AVATAR */}

        <div className="flex justify-center">
          <img
            src={userData?.assistantImage}
            alt="assistant"
            className="
              w-28
              h-28
              rounded-full
              object-cover
              border-4
              border-white
              shadow-[0_0_40px_rgba(236,72,153,0.5)]
            "
          />
        </div>

        {/* ONLINE */}

        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />

            <span className="text-green-300 font-medium">Online</span>
          </div>
        </div>

        {/* NAME */}

        <h1
          className="
            mt-4
            text-2xl
            md:text-3xl
            font-black
            leading-normal
            pb-2
            bg-linear-to-r
            from-pink-500
            via-purple-400
            to-cyan-400
            bg-clip-text
            text-transparent
          "
        >
          Hello, I'm {userData?.assistantName}
        </h1>

        <p className="text-gray-300 text-md mt-2">
          Your Personalized AI Virtual Assistant
        </p>

        {chatStarted && (
          <div className="relative flex justify-center mt-6">
            <div className="absolute inset-0 rounded-full bg-cyan-900/20 blur-2xl animate-pulse" />

            {/* <div className="absolute w-44 h-42 rounded-full border border-pink-500 animate-spin duration-7000" /> */}

            <img
              src={assistantStatus === "Speaking" ? aiImg : userImg}
              alt=""
              className={`
relative
w-28
h-28
rounded-full
object-cover
border-4
border-white
shadow-[0_0_30px_rgba(168,85,247,0.8)]
z-10
${assistantStatus === "Speaking" ? "scale-110" : "scale-100"}
transition-all duration-500
`}
            />
          </div>
        )}

        {/* GIF SECTION

        {!aiText && (
          <img src={userImg} alt="user" className="
w-44
h-44
rounded-full
object-cover
mx-auto
mt-6
border-4
border-cyan-400
" />
        )}

        {aiText && <img src={aiImg} alt="ai" className="
w-44
h-44
rounded-full
object-cover
mx-auto
mt-6
border-4
border-cyan-400
"/>} */}

        {/* STATUS */}

        <div className="mt-4 min-h-22.5">
          <p
            className={`
    text-sm
    font-semibold
    ${
      assistantStatus === "Listening"
        ? "text-green-400"
        : assistantStatus === "Speaking"
          ? "text-cyan-400"
          : assistantStatus === "Processing"
            ? "text-yellow-400"
            : "text-purple-300"
    }
  `}
          >
            Status: {assistantStatus}
          </p>

          {listening && (
            <>
              <p className="text-green-400 animate-pulse font-semibold">
                🎤 Listening...
              </p>

              <div className="flex justify-center items-end gap-1 mt-3 h-12">
                <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" />
                <div className="w-1 h-8 bg-green-400 rounded-full animate-pulse delay-75" />
                <div className="w-1 h-12 bg-green-400 rounded-full animate-pulse delay-150" />
                <div className="w-1 h-8 bg-green-400 rounded-full animate-pulse delay-200" />
                <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse delay-300" />
              </div>
            </>
          )}

          {userText?.trim() && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 p-3 text-left shadow-lg shadow-black/20">
              <p className="text-xs uppercase tracking-[0.25em] text-pink-200/80">
                You
              </p>
              <p className="mt-1 text-sm text-white/90">{userText}</p>
            </div>
          )}

          {aiText?.trim() && (
            <div className="mt-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/8 p-3 text-left shadow-lg shadow-cyan-500/10">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
                Assistant
              </p>
              <p className="mt-1 text-sm text-cyan-50">{aiText}</p>
            </div>
          )}

          {/* {chatStarted && (
  <>
    {!aiText ? (
      <img
        src={userImg}
        alt="user"
        className="w-44 h-44 object-cover rounded-full mx-auto mt-6 border-4 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.7)]"
      />
    ) : (
      <img
        src={aiImg}
        alt="ai"
        className="w-44 h-44 object-cover rounded-full mx-auto mt-6 border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.7)]"
      />
    )}
  </>
)} */}
        </div>

        {/* <div className="w-60 h-1 mt-8 mx-auto rounded-full bg-linear-to-r from-pink-500 via-purple-500 to-cyan-400 animate-pulse" /> */}

        <div className="w-40 h-0.5 mt-5 mx-auto rounded-full bg-linear-to-r from-pink-500 via-purple-500 to-cyan-400" />

        {/* ---------------------------
            ACTION BUTTONS
            - Start/Stop assistant
            - Customize assistant
            - Logout
        --------------------------- */}
        <div className="flex justify-center gap-5 mt-10 flex-wrap">
          {assistantEnabled ? (
            <button
              onClick={stopAssistant}
              className="
                px-10
                py-3
                rounded-full
                font-bold
                text-white
                bg-linear-to-r
                from-red-600
                via-red-500
                to-pink-600
                shadow-[0_0_25px_rgba(239,68,68,0.4)]
                hover:scale-110
                hover:shadow-[0_0_45px_rgba(239,68,68,0.4)]
                active:scale-95
                transition-all
                duration-300
              "
            >
              Stop Assistant
            </button>
          ) : (
            <button
              onClick={() => {
  isMountedRef.current = true;
  assistantEnabledRef.current = true;

  setAssistantEnabled(true);
  setChatStarted(true);

  greetUserOncePerDay();

  setTimeout(() => {
    startRecognition();
  }, 1000);
}}
              className="
                px-10
                py-3
                rounded-full
                font-bold
                text-white
                bg-linear-to-r
                from-pink-500
                via-purple-500
                to-cyan-400
                shadow-[0_0_30px_rgba(168,85,247,0.6)]
                hover:scale-110
                hover:shadow-[0_0_60px_rgba(34,211,238,0.4)]
                active:scale-95
                transition-all
                duration-300
              "
            >
              Start Assistant
            </button>
          )}

          {!assistantEnabled && (
  <button
    onClick={() => navigate("/customize")}
    className="
      hidden
      md:block
      px-8
      py-3
      rounded-full
      text-white
      border
      border-white/20
      bg-green-500/10
      hover:scale-105
      transition
    "
  >
    Customize
  </button>
)}

          <button
  onClick={handleLogout}
  className="
    hidden
    md:block
    px-8
    py-3
    rounded-full
    text-red-300
    border
    border-red-400/30
    bg-red-500/10
    hover:scale-105
    transition
  "
>
  Sign Out
</button>
        </div>
        </div>
        {/* END MAIN CARD */}

      </div>
      {/* END MAIN LAYOUT */}

    </div>
  );
};

export default Home;
