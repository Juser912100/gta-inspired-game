* {
  box-sizing: border-box;
}

:root {
  --bg: #0b0f14;
  --panel: rgba(19, 24, 32, 0.9);
  --panel-border: rgba(255, 255, 255, 0.1);
  --elevated: #141b23;
  --primary: #8cebff;
  --secondary: #d8a7ff;
  --text: #edf5ff;
  --muted: #a7b2c1;
  --shadow: rgba(0, 0, 0, 0.35);
}

html, body {
  margin: 0;
  width: 100%;
  height: 100%;
  font-family: Inter, Arial, sans-serif;
  background: radial-gradient(circle at top, #17212d 0%, #0b0f14 38%, #070a0f 100%);
  color: var(--text);
}

body {
  min-height: 100vh;
}

button, input {
  font: inherit;
}

.app-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 340px;
  padding: 20px 16px;
  background: rgba(14, 18, 24, 0.9);
  border-right: 1px solid var(--panel-border);
  box-shadow: 12px 0 26px var(--shadow);
}

.logo {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  margin-bottom: 18px;
  color: var(--primary);
}

.upload-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 62px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  color: var(--text);
  cursor: pointer;
  transition: 0.2s ease;
  margin-bottom: 18px;
}

.upload-box:hover {
  border-color: var(--primary);
  background: rgba(140, 235, 255, 0.04);
}

.upload-box input {
  display: none;
}

.preset-group, .controls {
  margin-top: 18px;
}

.preset-group h3 {
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preset-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.preset {
  border: 1px solid var(--panel-border);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  cursor: pointer;
  transition: 0.2s ease;
}

.preset:hover,
.preset.active {
  background: linear-gradient(135deg, rgba(140, 235, 255, 0.15), rgba(216, 167, 255, 0.15));
  border-color: rgba(140, 235, 255, 0.55);
}

.controls {
  display: grid;
  gap: 12px;
}

.slider-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--muted);
  margin-bottom: 6px;
}

input[type="range"] {
  width: 100%;
  accent-color: var(--primary);
}

.action-row {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

button.primary,
button.secondary {
  flex: 1;
  border: none;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.15s ease;
}

button.primary {
  background: linear-gradient(135deg, var(--primary), #9ad0ff);
  color: #091018;
}

button.secondary {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  border: 1px solid var(--panel-border);
}

button:hover {
  transform: translateY(-1px);
}

.workspace {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.canvas-frame {
  position: relative;
  width: min(1200px, 100%);
  height: min(82vh, 900px);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--panel-border);
  box-shadow: 0 26px 40px var(--shadow);
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #b7b5b2 0%, #86807d 100%);
}

.empty-state {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
  pointer-events: none;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(8, 12, 18, 0.18);
}

.empty-state.hidden {
  display: none;
}

.empty-state h2 {
  margin: 0 0 8px;
  font-size: clamp(1.6rem, 2vw, 2.3rem);
}

.empty-state p {
  margin: 0;
  color: var(--muted);
}

@media (max-width: 900px) {
  .app-shell {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--panel-border);
  }

  .workspace {
    padding: 12px;
  }
}
