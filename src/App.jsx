import { useState } from 'react'

const TV_SIZES = [32, 43, 50, 55, 65, 75, 85]

function tvDimensions(diagonal) {
  const w = (diagonal * 16) / Math.sqrt(16 ** 2 + 9 ** 2)
  const h = (diagonal * 9) / Math.sqrt(16 ** 2 + 9 ** 2)
  return { w, h }
}

const COLOR = '#4f8ef7'
const PPU = 5.5

function Visualization({ consoleWidthIn, consoleHeightIn, gapIn, tvSize }) {
  const { w: tvW_in, h: tvH_in } = tvDimensions(tvSize)

  const contentW = Math.max(tvW_in, consoleWidthIn) * PPU
  const svgW = contentW + 80
  const tableW = consoleWidthIn * PPU
  const tableH = consoleHeightIn * PPU
  const gap = gapIn * PPU
  const tvW = tvW_in * PPU
  const tvH = tvH_in * PPU

  const svgH = tvH + gap + tableH + 56
  const tableX = (svgW - tableW) / 2
  const tableY = svgH - tableH - 20
  const tvX = (svgW - tvW) / 2
  const tvY = tableY - gap - tvH
  const bezel = 8

  return (
    <svg
      className="viz-svg"
      viewBox={`0 0 ${svgW} ${svgH}`}
      preserveAspectRatio="xMidYMid meet"
      aria-label="TV and console size comparison diagram"
    >
      {/* Console table */}
      <rect x={tableX} y={tableY} width={tableW} height={tableH} rx={4} fill="#8B6914" stroke="#5c4209" strokeWidth={2} />
      <rect x={tableX} y={tableY} width={tableW} height={6} rx={3} fill="#a07820" opacity={0.6} />
      <text x={tableX + tableW / 2} y={tableY + tableH / 2 + 5} textAnchor="middle" fill="white" fontSize={11} fontFamily="system-ui, sans-serif" opacity={0.85}>
        {consoleWidthIn}" W × {consoleHeightIn}" H
      </text>

      {/* Gap indicator */}
      {gapIn > 0 && (
        <g>
          <line x1={tableX + tableW + 12} y1={tableY} x2={tableX + tableW + 12} y2={tableY - gap} stroke="#777" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={tableX + tableW + 7} y1={tableY} x2={tableX + tableW + 17} y2={tableY} stroke="#777" strokeWidth={1} />
          <line x1={tableX + tableW + 7} y1={tableY - gap} x2={tableX + tableW + 17} y2={tableY - gap} stroke="#777" strokeWidth={1} />
          <text x={tableX + tableW + 24} y={tableY - gap / 2 + 4} fill="#777" fontSize={10} fontFamily="system-ui, sans-serif">{gapIn}"</text>
        </g>
      )}

      {/* TV */}
      <rect x={tvX} y={tvY} width={tvW} height={tvH} rx={6} fill={COLOR} opacity={0.15} stroke={COLOR} strokeWidth={2} />
      <rect x={tvX + bezel} y={tvY + bezel} width={tvW - bezel * 2} height={tvH - bezel * 2} rx={2} fill={COLOR} opacity={0.1} />
      <text x={tvX + tvW / 2} y={tvY + tvH / 2 - 7} textAnchor="middle" fill={COLOR} fontSize={16} fontWeight="bold" fontFamily="system-ui, sans-serif">
        {tvSize}"
      </text>
      <text x={tvX + tvW / 2} y={tvY + tvH / 2 + 11} textAnchor="middle" fill={COLOR} fontSize={11} fontFamily="system-ui, sans-serif" opacity={0.75}>
        {tvW_in.toFixed(1)}" × {tvH_in.toFixed(1)}"
      </text>
    </svg>
  )
}

function Slider({ label, value, min, max, step = 1, unit, onChange }) {
  return (
    <div className="slider-row">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{value}{unit}</span>
      </div>
      <input
        className="slider-input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <div className="slider-range">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

export default function App() {
  const [consoleWidth, setConsoleWidth] = useState(60)
  const [consoleHeight, setConsoleHeight] = useState(18)
  const [gap, setGap] = useState(4)
  const [selectedTV, setSelectedTV] = useState(55)

  return (
    <div className="app">
      <header className="app-header">
        <h1>TV &amp; Console Size Comparison</h1>
        <p>See how TV sizes look above your console table</p>
      </header>

      <div className="app-body">
        {/* Visualization — fixed, does not scroll */}
        <main className="viz-area">
          <Visualization
            consoleWidthIn={consoleWidth}
            consoleHeightIn={consoleHeight}
            gapIn={gap}
            tvSize={selectedTV}
          />
        </main>

        {/* Controls — only scrollable region */}
        <aside className="controls">
          <section className="controls-section">
            <h2>TV Size</h2>
            <div className="tv-buttons" role="radiogroup" aria-label="TV size">
              {TV_SIZES.map(size => {
                const active = selectedTV === size
                return (
                  <button
                    key={size}
                    className="tv-btn"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedTV(size)}
                    style={{
                      borderColor: active ? COLOR : undefined,
                      background: active ? `${COLOR}22` : undefined,
                      color: active ? COLOR : undefined,
                      fontWeight: active ? 700 : undefined,
                    }}
                  >
                    {size}"
                  </button>
                )
              })}
            </div>
          </section>

          <section className="controls-section">
            <h2>Console Table</h2>
            <Slider label="Width" value={consoleWidth} min={24} max={96} unit='"' onChange={setConsoleWidth} />
            <Slider label="Height" value={consoleHeight} min={12} max={36} unit='"' onChange={setConsoleHeight} />
          </section>

          <section className="controls-section">
            <h2>Gap Above Table</h2>
            <Slider label="Height gap" value={gap} min={0} max={24} unit='"' onChange={setGap} />
          </section>
        </aside>
      </div>
    </div>
  )
}
