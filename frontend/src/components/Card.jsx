// import React from 'react'
import { useContext } from "react";
import { userDataContext } from "../context/userDataContext";

function Card({ image }) {
  const {
  selectedImage,
  setSelectedImage,
  setBackendImage,
  setFrontendImage,
} = useContext(userDataContext);

  return (
    <div
      onClick={() => {
        setSelectedImage(image)
        setBackendImage(null)
        setFrontendImage(null)  
        // this is to remove the border from input image when user selects any of the default images
      }}
      className={`
      group
      relative

      w-48
      h-70
      
      lg:w-37.5
      lg:h-62.5
      
      rounded-[28px]
      overflow-visible

      bg-[#020220]

      cursor-pointer
      
      border-2
      border-[#0000ff66]
      
      hover:border-4
      hover:border-white
      
      transition-all
      duration-500
      
      hover:scale-105
      hover:-translate-y-2

      ${
        selectedImage === image
          ? `
          border-4
         border-white
        `
          : ""
      }
    `}
    >
      {/* OUTER GLOW */}

      <div
        className="
        absolute
        inset-0
        bg-linear-to-br
        from-pink-500
        via-purple-500
        to-cyan-400
        opacity-70
        blur-xl
        group-hover:opacity-100
        transition-all
        duration-500
      "
      ></div>

      {/* CARD */}

      <div
        className="
        relative
        z-10
        w-full
        h-full
        bg-white/10
        backdrop-blur-xl
        border
        border-white/20
        rounded-[28px]
        overflow-hidden
        shadow-[0_0_30px_rgba(255,255,255,0.08)]
      "
      >
        {/* TOP LIGHT EFFECT */}

        <div
          className="
          absolute
          top-0
          left-[-40%]
          w-[80%]
          h-full
          bg-white/20
          rotate-25
          blur-2xl
          group-hover:left-[120%]
          transition-all
          duration-1000
        "
        ></div>

        {/* IMAGE */}

        <img
          src={image}
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
      {/* this gives color effects to selected image */}
        {/* {selectedImage === image && (
          <div
            className="
              absolute
              inset-0
              bg-cyan-400/10
              animate-pulse
              rounded-[28px]
            "
          ></div>
        )} */}

        {/* DARK OVERLAY */}

        <div
          className="
          absolute
          inset-0
          bg-linear-to-t
          from-black/70
          via-transparent
          to-transparent
        "
        ></div>

        {/* AI TEXT */}

        <div
          className="
          absolute
          bottom-4
          left-1/2
          -translate-x-1/2
          text-white
          text-lg
          font-bold
          tracking-widest
          opacity-0
          group-hover:opacity-100
          transition-all
          duration-500
        "
        >
          AI AVATAR
        </div>
      </div>
    </div>
  );
}

export default Card;
