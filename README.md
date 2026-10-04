# ⚡ MindForge — Ultimate Brain & Cognitive Training Suite

**MindForge** is a high-performance, dark-themed brain training web application featuring 5 interactive mind games designed to test visual search speed, working memory, cognitive control, rapid arithmetic, and auditory sequence recall.

---

## 🎮 Mind Games Included

1. 🔢 **Number Rush** (Visual Search & Speed Grid)
   - Click numbers 1 → 25 (or 36) in fast ascending order.
   - Combo multiplier system (+10 pts base, +5 pts per combo level).
   - Easy (30s), Medium (20s), and Hard (12s) difficulties.
   - Built-in visual hint system highlighting target numbers.

2. 🧩 **Memory Matrix** (Spatial Working Memory)
   - Memorize illuminated grid tiles shown for 1.5 seconds.
   - Recall and tap hidden target tiles from memory.
   - Dynamic rounds expanding from 4x4 to 5x5 matrices.

3. 🎨 **Color Clash** (Stroop Effect / Cognitive Control)
   - Read color words printed in mismatched font ink colors.
   - Schnell test deciding if text matches actual font color.
   - Tests reaction speed and mental inhibition.

4. ⚡ **Speed Math Blitz** (Mental Agility & Arithmetic)
   - Rapid addition, subtraction, and multiplication calculations.
   - Multiple choice answer selection with streak bonuses.

5. 🎵 **Simon Recall** (Auditory & Sequential Memory)
   - Watch and listen to 4 glowing pads playing Web Audio tones.
   - Repeat expanding patterns step-by-step.

---

## 🚀 How to Host on Vercel

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Run vercel deploy in this folder
vercel
```

### Option 2: Deploy via GitHub / Vercel Web Dashboard
1. Push this project folder to your GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your GitHub repository.
4. Select **Other** as the Framework Preset (or leave default Static Site).
5. Click **Deploy**! Vercel will instantly host your site with automatic HTTPS.

---

## 🛠 Local Development

```bash
# Start local development server
npm start
```
Or open `index.html` directly in any web browser!

---

## 🔊 Audio Engine
MindForge uses the **Web Audio API** synthesizer for real-time sound effects (hits, errors, win fanfares, sequence chimes) without requiring external audio files. Includes a global mute toggle button in the navbar.
