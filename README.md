# mohit tahiliani — v2 holographic cyberpunk prototype (GitHub-ready)

This upgraded build includes:
- Interactive 3D cyberpunk city (Three.js) with mouse drag rotate and scroll zoom
- Floating Etna-powered holographic "WELCOME" that fades out after a few seconds
- Ambient cyberpunk music and subtle hover/click SFX (place audio files in assets/audio/)
- Premium visual polish: neon gradients, glassmorphism, parallax, custom cursor
- Unity WebGL placeholders ready for your builds

## Important: Add your font & audio files
1. Place the web font `etna.woff2` in `assets/fonts/etna.woff2` for best performance.
2. Place a fallback `etna.otf` in `assets/fonts/etna.otf` (Unity can use this one).
3. Audio:
   - `assets/audio/ambient.mp3` (ambient looping track)
   - `assets/audio/hover-buzz.mp3` (short hover SFX)
   - `assets/audio/glitch.mp3` (click/glitch SFX)
4. (Optional) Replace placeholder images in `assets/images/`.

## Deploy
- Push folder contents to your GitHub repo and enable GitHub Pages (branch: `main`).
- The site references Three.js and GSAP via CDN. If you prefer local libs, place them in `libs/` and update `index.html`.

## Unity integration notes
- Unity builds are large; host them in subfolders like `games/game1/` and link from the Play buttons.
- To match fonts in Unity, import `etna.otf` into `Assets/Fonts` and create a TextMeshPro asset from it.

## Performance tips
- Use optimized audio (128-192kbps mp3) for ambient loops.
- For mobile fallback, the script disables some pointer events. You can also swap a pre-rendered hero video for very low-end devices.

---
Enjoy — when you've added the font and audio files, upload to GitHub and tell me the URL. I'll run a light audit and suggest optimizations.
