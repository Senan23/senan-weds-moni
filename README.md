# Senan & Monisha's Cinematic Wedding Invitation

A highly interactive, beautifully animated digital wedding invitation crafted as a modern, scroll-driven storytelling experience. This application uses cutting-edge frontend graphics tooling to seamlessly blend custom 3D image sequences, elegant typography, and programmatic micro-animations into a seamless journey for its guests.

## 🛠 Tech Stack

- **React (Vite ⚡)**: The core UI library handling state management, component lifecycles, and rapid local compilation.
- **GSAP (GreenSock Animation Platform)**: The powerhouse engine behind the smooth, zero-latency canvas text syncs and scroll-scrubbing. Includes the **ScrollTrigger** plug-in to tie specific animations dynamically to the user's scrollbar.
- **Canvas API (HTML5)**: Used to hyper-optimize the rendering of a 130-frame sequence seamlessly. 
- **Vanilla CSS3**: Responsible for all the styling magic—from CSS `mix-blend-mode` effects overlaying the white canvas graphics perfectly onto the background, to the pulsating golden portrait frame boundaries (`@keyframes`) and layout architecture.
- **Intersection Observer API**: Robust viewport detection that triggers CSS transforms when specific UI texts scroll into view, completely independent of the GSAP pipeline to prevent layout conflicts.

---

## ⚙️ How It Works (The Process)

This immersive application is structured as a single massive scroll journey composed of dynamically loading layers:

### 1. Initialization Core (`App.jsx`)
Before any heavy assets are shown, `App.jsx` handles preload staging. It mounts the `Loader` component which gracefully hides the application until crucial elements are ready to prevent stuttering. Once the app enters the `isLoaded` state, the core layout fades in.

### 2. The Grand Entrance (`CountdownTimer.jsx`)
The entry point of the site immediately locks the user into an elegant countdown ticking towards the exact date of the marriage (*May 29th, 2026*). This module relies on the system Date object and cleanly resets the UI state every second to produce a live clock effect. 

### 3. The Scrubbing "Parallax" Storyboard (`HeroCanvas.jsx`)
This is the heavy hitter of the application.
- **Image Preloading**: 131 individual high-fidelity PNG frames are preloaded into memory array buffers. 
- **Pinning**: GSAP `ScrollTrigger` "pins" the 100vh canvas block in place for `400vh` worth of scrolling. As the user physically scrolls down, instead of moving down the page, they are scrubbing through a timeline of the PNG animation. 
- **Frame Syncing & Drawing**: Depending on the exact percentage of the scroll offset, a matching math calculation points to a specific index of the array (0 through 130) and violently pushes that frame directly natively onto the `HTML5 <canvas>`. Since it circumvents the React DOM to paint into `<canvas>`, it performs at a stable 60 FPS.
- **Frame Illusion**: The canvas element is bound to a tightly proportioned CSS `aspect-ratio: 2/3` container with a gold `@keyframes` pulsating `border`. The background color differences of the raw PNG assets are perfectly subdued using a CSS `mix-blend-mode: multiply` overlay, fully blending the caricature into the gallery background.
- **Cinematic Text**: As the frames advance, internal listeners update the prominent gold layout texts in a three-act structure ("From College corridors" -> "To wedding vows" -> "Our Forever Begins").

### 4. Ambient Environments (`PetalsEffect.jsx`)
Appearing behind canvas bounds, an autonomous effect randomly calculates and spans individual DOM elements styled as floral petals across the screen. Varying parameters for `animationDuration`, initial `top`/`left` positions, and `transform scale` sizes provide distinct depth—with an algorithm that naturally transitions color themes as the main storyboard completes its chapters.

### 5. Final Invitations (`CinematicInvitation.jsx`)
Once the GSAP pinning concludes its `400vh` requirement, the site seamlessly restores to native scroll flow.
The user is met with massive `100vh` spacer breaks transitioning into the elegant typography strings detailing the actual events. 
- **Viewport Triggers**: An `IntersectionObserver` handles monitoring layout bounds. The moment an event detail hits `15%` visualization into the browser viewport, it forces the CSS to release a `translateY` offset, causing the text to magnificently glide up into view effortlessly without GSAP dependency loops.

---

## 💻 Running it Locally

1. Clone or download your repository locally. Ensure the preloaded PNG assets are positioned in the proper `/public` domain folder.
2. In your root `Senan-Moni-marriage` directory, run:
```bash
npm install
npm run dev
```
3. Open `http://localhost:5173/` in your browser. Wait for the preloader to successfully map out all 131 assets into system cache. Scroll to play!

## 🚀 Deployment Instructions

The codebase is highly optimized for generic serverless deployments (such as Vercel, Netlify, or Surge).
For Vercel Drop: Next-Gen Zero Config!
- Simply run `npm run build` in your terminal.
- Compress or simply select the newly generated inner `/dist` folder.
- Drag and drop it immediately onto [vercel.com/new/drop](https://vercel.com/new/drop). No configurations required.
