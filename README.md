# echo

Your voice and ambient sound become a living 3D sculpture. Frequency bands drive glowing neon bars, particle rings pulse to the beat, and the entire scene breathes with your audio.

**Visual Style:** Bold — Synthwave (retro neon with deep purple background, magenta/cyan/orange glow, scanlines)

**Data Source:** Microphone input via Web Audio API (getUserMedia + AnalyserNode). Falls back to oscillator-generated synthetic tones if mic permission is denied.

**How it works:**
- Tap the mic button to start listening — audio data from your microphone drives 128 3D frequency bars in real time
- Frequency amplitude controls bar height — louder = taller
- Frequency range is color-coded: magenta (bass), cyan (mid), orange (high)
- A particle ring pulses with overall RMS amplitude
- OrbitControls let you rotate around the 3D sound sculpture
- Tap any frequency bar to see its exact Hz value and amplitude in the Quiet Zone panel
- Hero number shows peak frequency and RMS amplitude

**GitHub:** https://github.com/parthchandak02/echo

**Live:** https://echo.parthchandak.info

**Tech:** React Three Fiber + drei + Web Audio API. Hosted on Cloudflare Pages.
