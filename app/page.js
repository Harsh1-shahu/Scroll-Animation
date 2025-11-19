"use client";
import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const Page = () => {
  const canvasRef = useRef(null);
  const images = useRef([]);
  const textRefs = useRef([]);
  const [currentFrame, setCurrentFrame] = useState(0);

  const frames = {
    currentIndex: 0,
    maxIndex: 1345,
  };

  const animateTexts = [
    { start: 0, end: 180, year: 2000, text: "INNOVATING VISUAL EXPERIENCES" },
    { start: 200, end: 380, year: 2001, text: "TRANSFORMING IDEAS INTO MOTION" },
    { start: 400, end: 580, year: 2002, text: "CRAFTING STORIES THROUGH DESIGN" },
    { start: 600, end: 780, year: 2003, text: "BRINGING BRANDS TO LIFE" },
    { start: 800, end: 980, year: 2004, text: "INSPIRING MOTION DESIGN" },
    { start: 1000, end: 1345, year: 2005, text: "TURNING CONCEPTS INTO MOTION" },
  ];

  // Draw frame on canvas
  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const img = images.current[index];
    if (!context || !img) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const newWidth = img.width * scale;
    const newHeight = img.height * scale;
    const offsetX = (canvas.width - newWidth) / 2;
    const offsetY = (canvas.height - newHeight) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(img, offsetX, offsetY, newWidth, newHeight);
  };

  useEffect(() => {
    if (typeof window === "undefined") return; // ✅ ensure client-side only

    // ✅ Initialize Lenis only on client
    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ✅ Preload images
    const loadedImages = [];
    for (let i = 1; i <= frames.maxIndex; i++) {
      const img = new Image();
      img.src = `/compressed_images/frame_${i.toString().padStart(4, "0")}.jpg`;

      img.onload = () => {
        if (i === 1 && canvasRef.current) drawFrame(0);
      };

      loadedImages.push(img);
    }
    images.current = loadedImages;

    if (!canvasRef.current) return;

    // ✅ Animate frames with scroll
    gsap.to(frames, {
      currentIndex: frames.maxIndex - 1,
      ease: "linear",
      scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
      onUpdate: () => {
        const index = Math.floor(frames.currentIndex);
        drawFrame(index);
        setCurrentFrame(index);
      },
    });

    // ✅ Animate texts sliding in/out
    animateTexts.forEach((item, idx) => {
      const el = textRefs.current[idx];
      if (!el) return;

      gsap.set(el, { x: "100%", opacity: 0 }); // start off-screen right

      gsap.to(el, {
        x: "0%",
        opacity: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".scroll-container",
          start: () => `${(item.start / frames.maxIndex) * 100}% top`,
          end: () => `${(item.start / frames.maxIndex) * 100 + 5}% top`,
          scrub: true,
        },
      });

      gsap.to(el, {
        x: "100%",
        opacity: 0,
        ease: "power3.in",
        scrollTrigger: {
          trigger: ".scroll-container",
          start: () => `${(item.end / frames.maxIndex) * 100 - 5}% top`,
          end: () => `${(item.end / frames.maxIndex) * 100}% top`,
          scrub: true,
        },
      });
    });
  }, []);

  return (
    <div className="w-full bg-zinc-900">
      <div className="relative w-full h-[1400vh] scroll-container">
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-screen"></canvas>

          {/* Animate texts */}
          {animateTexts.map((item, idx) => (
            <div
              key={idx}
              ref={(el) => (textRefs.current[idx] = el)}
              className="absolute z-[2] text-white bottom-10 w-1/2 left-18 opacity-0"
            >
              <h1 className="leading-20 font-[100] text-3xl">
                &copy; {item.year} DOZE STD
              </h1>
              <h1 className="text-3xl">{item.text}</h1>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
