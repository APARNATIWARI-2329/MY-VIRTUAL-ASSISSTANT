import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/userDataContext";
import { FaRobot } from "react-icons/fa";
import axios from "axios";

function Customize2() {
  const { selectedImage, backendImage, serverUrl, setUserData } =
    useContext(userDataContext);

  const navigate = useNavigate();
  const [assistantName, setAssistantName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateAssistant = async () => {
    if (!assistantName.trim()) {
      alert("Please enter assistant name");
      return;
    }

    try {
      if (!selectedImage && !backendImage) {
        alert("Please select an avatar first");
        return;
      }

      setLoading(true);

      let formData = new FormData();

      formData.append("assistantName", assistantName);

      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else {
        const absoluteUrl = selectedImage.startsWith("http")
          ? selectedImage
          : `${window.location.origin}${selectedImage}`;
        formData.append("imageUrl", absoluteUrl);
      }

      const token = localStorage.getItem("token");
      const result = await axios.put(
        `${serverUrl}/api/user/update`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(result.data);

      setUserData(result.data);
      console.log("Assistant updated:", result.data);

      navigate("/");
    } catch (error) {
  console.log("FULL ERROR:", error);

  console.log("STATUS:", error?.response?.status);

  console.log("DATA:", error?.response?.data);

  alert(
    JSON.stringify(error?.response?.data || error.message)
  );
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-y-auto overflow-x-hidden bg-black flex flex-col items-center px-4 py-10">
      {/* BACKGROUND GLOWS */}

      <div className="absolute top-20 left-20 w-96 h-96 bg-pink-500/30 rounded-full blur-[180px]"></div>

      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/30 rounded-full blur-[180px]"></div>

      <div className="absolute top-[35%] left-[45%] w-72 h-72 bg-purple-500/20 rounded-full blur-[140px]"></div>

      {/* GRID */}

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 6px), linear-gradient(to bottom, white 1px, transparent 6px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <button
        onClick={() => navigate("/customize")}
        className="
        cursor-pointer
        absolute
        top-6
        left-6

        z-20

        px-4
        py-2

        rounded-full

       text-white

        border
       border-white/20

       bg-white/10
        backdrop-blur-xl

       hover:bg-white/20

        transition-all
        duration-300
        "
      >
        ← Back
      </button>

      {/* HEADING */}

      <div className="relative z-10 text-center mb-14">
        <h1 className="text-white text-6xl md:text-7xl font-black tracking-wide">
          Customize Your
          <span className="bg-linear-to-r from-pink-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {" "}
            Assistant Name
          </span>
        </h1>

        <p className="text-gray-300 text-lg mt-4 tracking-wide">
          Choose a futuristic name for your AI avatar
        </p>

        <div className="w-72 h-1 mt-5 mx-auto rounded-full bg-linear-to-r from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_25px_rgba(168,85,247,0.9)] animate-pulse"></div>
      </div>

      {/* MAIN CARD */}

      <div
        className="
        relative
        z-10
        w-full
        max-w-2xl
        p-8

        rounded-[35px]

        bg-white/10
        backdrop-blur-xl

        border
        border-white/20

        shadow-[0_0_40px_rgba(168,85,247,0.25)]
      "
      >
        {/* INPUT */}

        <div className="input-field hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
          <FaRobot className="text-cyan-400 text-2xl shrink-0" />

          <input
            autoFocus
            maxLength={20}
            type="text"
            placeholder="Enter Assistant Name"
            className="input-base"
            value={assistantName}
            onChange={(e) => setAssistantName(e.target.value)}
          />
        </div>

        {/* NAME SUGGESTIONS */}

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={() => setAssistantName("Nova")}
            className="px-4 py-2 rounded-full bg-pink-500/20 border border-pink-500/40 text-white hover:bg-pink-500/30 transition-all"
          >
            Nova
          </button>

          <button
            type="button"
            onClick={() => setAssistantName("Astra")}
            className="px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-white hover:bg-cyan-500/30 transition-all"
          >
            Astra
          </button>

          <button
            type="button"
            onClick={() => setAssistantName("Orion")}
            className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40 text-white hover:bg-purple-500/30 transition-all"
          >
            Orion
          </button>

          <button
            type="button"
            onClick={() => setAssistantName("Zenith")}
            className="px-4 py-2 rounded-full bg-pink-500/20 border border-pink-500/40 text-white hover:bg-pink-500/30 transition-all"
          >
            Zenith
          </button>
        </div>

        {/* CONTINUE BUTTON */}

        {assistantName.trim() && (
          <div className="flex justify-center">
            <button
              onClick={handleUpdateAssistant}
              disabled={loading}
              className="
              relative
              overflow-hidden

              mt-10

              px-10
              py-3

              rounded-full

              text-white
              text-lg
              font-bold

              bg-linear-to-r
              from-pink-500
              via-purple-500
              to-cyan-400

              shadow-[0_0_18px_rgba(236,72,153,0.35)]

              hover:scale-105
              hover:shadow-[0_0_30px_rgba(236,72,153,0.55)]

              transition-all
              duration-500
            "
            >
              <span className="relative z-10">
                {!loading ? "Continue" : "Loading..."}
              </span>

              <div
                className="
                absolute
                top-0
                -left-full

                w-[120%]
                h-full

                bg-white/15
                skew-x-12

                animate-[shine_3s_linear_infinite]
              "
              ></div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Customize2;
