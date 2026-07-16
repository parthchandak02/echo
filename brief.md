# echo — Creative Brief

## Concept
Your voice and ambient sound become a living 3D sculpture. Frequency bands drive glowing neon bars, particle rings pulse to the beat, and the entire scene breathes with your audio. A retro-neon Synthwave sound visualizer.

**Narrative Pattern:** Feature-action (live audio feed drives animated 3D highlights in real time)

**Tier 2 Patterns (pick 2):** Hero Number (peak frequency value + BPM estimate at 48px) + Quiet Zone (tap a frequency bar reveals its exact Hz value + amplitude)

## Data Source
- Primary: Microphone input via Web Audio API (getUserMedia + AnalyserNode, FFT size 256, 128 frequency bins)
- Fallback: If mic permission denied or unavailable, use OscillatorNode (440Hz sine + LFO modulation) to generate synthetic tones so the visualization is never blank
- Fallback 2: Oscillator generates random frequency sweeps (200-2000Hz) so it looks like a music visualization even without mic

## Visual Style
- **Preset:** Bold — Synthwave (retro neon)
- Palette locked at top of audioEngine.ts:
  - bg: '#120030' (deep purple near-black)
  - accent1: '#ff00ff' (magenta — primary)
  - accent2: '#00ffff' (cyan — secondary)
  - accent3: '#ff6b35' (warm orange — accent)
  - glow: '#ff00ff' (for shadowBlur)
  - text: 'rgba(255,255,255,0.6)'
- **Stroke weight vocabulary:** {thin:0.5, fine:1, medium:2, thick:3}
- **Alpha tiers:** {bg:0.08, field:0.25, active:0.7, label:0.45}
- **Motion grammar:** {settle: expo-out, alert: spring, ambient: linear}
- **Shape language:** geometric (bars, rings, arcs)
- **Glow budget:** 1 glow color (#ff00ff), max blur 40px, max 20 entities/frame
- **Accent color:** magenta (#ff00ff) primary + cyan (#00ffff) secondary + orange (#ff6b35) accent

## Encoding Contract
| Data Field | Visual Channel | Range | Inverse Function | "Bigger means..." | Legend? |
|---|---|---|---|---|---|
| frequencyBin amplitude (0-255) | bar height (R3F scale.y) | 0.1-6.0 | invertScale(scaleY, 0.1,6.0, 0,255) | louder at that frequency | yes |
| frequencyBin index (0-127) | bar position (x) | -8 to +8 (128 bars) | invertScale(posX, -8,8, 0,127) | higher frequency | yes |
| overall RMS amplitude | particle ring radius | 1-8 | invertScale(ringR, 1,8, 0,255) | louder overall sound | no (physical) |
| bass avg (bins 0-15) | ring color hue (HSL) | 280-330 (purple-magenta) | invertHue(280,330) | more bass energy | no (decorative) |

## Interaction
- Tap a frequency bar: reveals QuietZone with exact Hz value (frequency = binIndex * 44100/512) and amplitude (0-255)
- OrbitControls: rotate around the 3D sound sculpture (desktop drag + mobile touch)
- On first load: show "Tap to start listening" button (user gesture required for getUserMedia)
- After mic activation: 3s onboarding glow pulse at center

## Required Component Structure (exactly these files)

### src/App.tsx
Canvas → Suspense → Background → AudioReactiveField → OrbitControls
Chrome overlay: HeroStats, DataStamp, Description, Legend, QuietZone
Includes "Tap to activate mic" button overlay (positioned above canvas)
State: isListening (bool), passed to AudioReactiveField

### src/main.tsx
Standard React DOM entry. Import styles.css.

### src/styles.css
Full viewport styles. Chrome positions: stamp (bottom:20 left:16), legend (bottom:44 center), desc (bottom:68 center), hero (top:24 left:24), quiet-zone (center overlay fixed).
Synthwave background scanlines: repeating-linear-gradient overlay at 3% opacity.
Mic button: centered, 60px, magenta glow, pulse animation, cursor pointer, z-index 50.
font-family: system-ui, sans-serif on all chrome elements.

### src/components/Background.tsx
Dark purple gradient (#120030 to #1a0045). Subtle horizontal scanlines (1px lines at 4px spacing, 5% opacity white). Optional perspective grid on lower third. Use drei's Html or pure CSS via styles.css. No R3F mesh background needed — use CSS.

### src/components/AudioReactiveField.tsx
Main visualization component. Reads audioData from zustand store (128 frequency bins + RMS). Renders 128 FrequencyBar components in a curved or straight array. Spawns ParticleRing system that pulses with RMS. Uses useFrame to read store data each frame.

### src/components/FrequencyBar.tsx
Single 3D bar (BoxGeometry or CylinderGeometry). Props: position, height (from audioData[index]), color (from frequency-based gradient: bass=magenta, mid=cyan, high=orange). MeshBasicMaterial with AdditiveBlending. Animates height with spring easing on change.

### src/components/ParticleRing.tsx
Ring of 32 small spheres (SphereGeometry 0.03 radius). Radius expands with RMS amplitude. MeshBasicMaterial, AdditiveBlending, color #ff00ff glow. UsePoints or InstancedMesh for performance.

### src/components/HeroStats.tsx
Top-left chrome. Shows peak frequency in Hz (largest amplitude bin mapped to Hz) at 48px bold, with "peak frequency" label below at 11px. Uses tabular-nums. Color #ff00ff (magenta). Below that: "RMS amplitude" at 14px in rgba(255,255,255,0.5).

### src/components/DataStamp.tsx
Bottom-left chrome. Shows "Microphone · live · 128 bands · updated 0s ago". Font 10px system-ui. Color rgba(255,255,255,0.45). Updates every frame via useFrame reading a frame counter ref.

### src/components/Description.tsx
Bottom center chrome. One line: "Your voice becomes a 3D sculpture — frequency bands drive height, bass drives ring pulses, louder = brighter". Max-width 65ch. Font 11px. Color rgba(255,255,255,0.45).

### src/components/Legend.tsx
Bottom center chrome (above desc). Shows three colored dots: magenta ("bass"), cyan ("mid"), orange ("high") with labels. Font 9px. Color rgba(255,255,255,0.6).

### src/components/QuietZone.tsx
Detail panel. Centered overlay. Shows on tap: frequency value (Hz), amplitude (0-255), bar index. Fades after 3s idle. Transition opacity 0.3s ease. Position fixed, z-index 100. Pointer-events none (auto only on close button).

### src/data/audioEngine.ts
Web Audio API setup:
- initAudio(): creates AudioContext, getUserMedia, AnalyserNode (fftSize 256), connects to destination
- readAudio(): reads frequencyByteData + calculates RMS = sqrt(sum(squaredValues)/128)
- getPeakFrequency(): finds bin with max amplitude, returns frequency = binIndex * sampleRate / fftSize
- If getUserMedia fails: creates OscillatorNode (440Hz) + GainNode + AnalyserNode, LFO modulating frequency between 200-2000Hz
- Exports: startListening(), stopListening(), getAudioData() (returns {freqData: Uint8Array(128), rms: number, peakHz: number})

### src/data/types.ts
AudioData type: { freqData: Uint8Array, rms: number, peakHz: number, isListening: boolean }

### src/store/useStore.ts
Zustand store with audioData state. Updated by useFrame in AudioReactiveField. Also holds isListening boolean, selectedBar (for QuietZone).

## Communication Requirements
**Tier 1 (mandatory):**
1. Persistent Data Stamp — "Microphone · live · 128 bands · updated Xs ago"
2. Data Process Honesty — "synthetic audio" fallback labeled
3. One-to-One Sensory Mapping — taller bar = louder frequency

**Tier 2 (pick 2):**
4. Quiet Zone — tap frequency bar → Hz, amplitude, bar index. Fades after 3s.
5. Hero Number — peak frequency (Hz) at 48px top-left

**Coherence:**
6. Generative-art axes: strokeWeight: {thin, fine, medium, thick}, alpha: {bg:0.08, field:0.25, active:0.7, label:0.45}, shape: geometric
7. Motion tokens: --motion-fast:160ms, --motion-base:240ms, --motion-slow:360ms
8. AI Slop Score < 30 — Synthwave palette, layered bg, scanlines, geometric bars

## Build Requirements
- Vite + React + TypeScript
- three, @react-three/fiber, @react-three/drei, zustand
- DELETE src/index.css and src/App.css after Vite scaffold
- No Inter, Roboto, or Open Sans fonts
- Ban em-dashes in all user-visible strings (use hyphens)
- npm run build must succeed
- Single page, no routing
