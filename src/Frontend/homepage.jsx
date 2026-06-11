import React, { useEffect, useRef, useState } from "react";
import "./style/Homepage.css";

const Homepage = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (
      window.VANTA &&
      window.VANTA.BIRDS &&
      vantaRef.current &&
      !vantaEffect
    ) {
      const effect = window.VANTA.BIRDS({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        backgroundColor: 0x0f0c29,
        color1: 0x667eea,
        color2: 0x764ba2,
        birdSize: 1.2,
        speedLimit: 5,
        separation: 20,
        alignment: 20,
        cohesion: 20,
      });
      setVantaEffect(effect);
    }

    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect]);

  return (
    <>
      <div ref={vantaRef} className="homepage-container">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="catchy-title">
              STOP GUESSING WHERE
              <br />
              YOUR MONEY GOES
            </h1>

            {/* Dynamic Text based on device */}
            <p className="supportive-text">
              {isMobile
                ? "👉 Open menu bar to access Goals, Notes & AI Assistant. Sign in to start your financial journey!"
                : "An AI-powered workspace for tracking expenses, planning goals, managing notes, and turning financial chaos into confidence."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Homepage;
