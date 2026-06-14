import { useRef, useContext } from "react";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";
import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from "../context/userDataContext";

import image1 from "../assets/image1.png";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.png";
import image7 from "../assets/image7.png";
import image8 from "../assets/image8.png";
import image9 from "../assets/image9.png";
import image10 from "../assets/image10.png";
import image11 from "../assets/image11.png";
import image12 from "../assets/image12.png";
import image13 from "../assets/image13.png";
import image14 from "../assets/image14.png";
import image15 from "../assets/image15.png";

const Customize = () => {
  const navigate = useNavigate();
  const {
    frontendImage,
    setFrontendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(userDataContext);

  const inputImage = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setBackendImage(file);

      setFrontendImage(URL.createObjectURL(file));

      setSelectedImage("input");
    }
  };

  const images = [
    image1,
    image2,
    image3,
    image4,
    image5,
    image6,
    image7,
    image8,
    image9,
    image10,
    image11,
    image12,
    image13,
    image14,
    image15,
  ];

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
        onClick={() => navigate("/")}
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
            Assistant
          </span>
        </h1>

        <p className="text-gray-300 text-lg mt-4 tracking-wide">
          Choose a futuristic AI avatar for your virtual assistant
        </p>

        {/*  GRADIE LINE */}
        <div className="w-72 h-1 mt-5 mx-auto rounded-full bg-linear-to-r from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_25px_rgba(168,85,247,0.9)] animate-pulse"></div>
      </div>

      {/* CARD CONTAINER */}

      <div
        className="
        relative
        z-10
        w-full
        max-w-375
        flex
        flex-wrap
        items-center
        justify-center
        gap-8
        px-4
      "
      >
        {/* IMAGE CARDS */}

        {images.map((img, index) => (
          <div
            key={index}
            className="
            group
            relative
            rounded-[30px]
            p-0.5

            bg-linear-to-br
            from-pink-500/70
            via-purple-500/50
            to-cyan-400/70

            hover:scale-105
            transition-all
            duration-500

            hover:shadow-[0_0_50px_rgba(168,85,247,0.6)]
          "
          >
            <div
              className="
              bg-black/40
              backdrop-blur-xl
              rounded-[28px]
              overflow-hidden
            "
            >
              <Card image={img} />
            </div>
          </div>
        ))}

        {/* CUSTOM IMAGE CARD */}

        <label
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
          className={`
          group
          relative

          w-48
          h-70

          rounded-[28px]

          lg:w-37.5
          lg:h-62.5
          
          border-2
          border-dashed

          ${
            selectedImage === "input"
              ? "border-4 border-white shadow-2xl"
              : "border-[#ffffff66]"
          }

          bg-white/5
          backdrop-blur-xl

          cursor-pointer
          overflow-hidden

          hover:scale-105
          hover:border-pink-500

          transition-all
          duration-500

          hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]
        `}
        >
          {/* GLOW */}

          <div
            className="
            absolute
            inset-0

            bg-linear-to-br
            from-pink-500/10
            via-purple-500/10
            to-cyan-400/10

            opacity-0
            group-hover:opacity-100

            transition-all
            duration-500
          "
          ></div>

          <div
            className="
            w-full
            h-full
            flex
            items-center
            justify-center
            overflow-hidden
          "
          >
            {!frontendImage && (
              <div className="flex flex-col items-center justify-center gap-4">
                <RiImageAddLine
                  className="
                  text-cyan-300
                  w-14
                  h-14

                  group-hover:scale-125
                  group-hover:text-pink-400

                  transition-all
                  duration-500
                "
                />

                <p className="text-white text-lg font-semibold tracking-wide">
                  Upload Your AI
                </p>

                <span className="text-gray-400 text-sm">JPG, PNG</span>
              </div>
            )}

            {frontendImage && (
              <img
                src={frontendImage}
                alt="assistant"
                className="
                w-full
                h-full
                object-cover
                rounded-[28px]

                group-hover:scale-110

                transition-all
                duration-700
              "
              />
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={inputImage}
            hidden
            onChange={handleImage}
          />
        </label>
      </div>

      {/* NEXT BUTTON */}

      {selectedImage && (
        <button
          onClick={() => navigate("/customize2")}
          className="
          relative
          z-10

          cursor-pointer

          mt-14

          px-14
          py-4

          rounded-full

          text-white
          text-2xl
          font-bold
          tracking-wide

          bg-linear-to-r
          from-pink-500
          via-purple-500
          to-cyan-400

          shadow-[0_0_35px_rgba(168,85,247,0.7)]

          hover:scale-105
          hover:shadow-[0_0_60px_rgba(34,211,238,0.8)]

          transition-all
          duration-500

          overflow-hidden
      "
        >
          <span className="relative z-10">Next →</span>

          {/* SHINE EFFECT */}

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
      )}
    </div>
  );
};

export default Customize;
