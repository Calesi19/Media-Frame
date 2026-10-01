import { useState } from 'react'

const TV_SIZES = [32, 43, 50, 55, 65, 75, 85]

function tvDimensions(diagonal) {
  const w = (diagonal * 16) / Math.sqrt(16 ** 2 + 9 ** 2)
  const h = (diagonal * 9) / Math.sqrt(16 ** 2 + 9 ** 2)
  return { w, h }
}

function formatFeetInches(inches) {
  const ft = Math.floor(inches / 12)
  const rem = inches % 12
  return rem === 0 ? `${inches}" (${ft}')` : `${inches}" (${ft}' ${rem}")`
}

const COLORS = [
  '#4f8ef7', '#f76f4f', '#4fcf8e', '#f7c84f',
  '#b44ff7', '#4fe8f7', '#f74fa0',
]

// Internal SVG units — treated as inches, scaled via viewBox
const PPU = 5.5

function Visualization({ consoleWidthIn, consoleHeightIn, gapIn, ceilingHeightIn, selectedTVs }) {
  const maxTVWidthIn = selectedTVs.reduce((max, size) => {
    return Math.max(max, tvDimensions(size).w)
  }, consoleWidthIn)

  const maxTVHeightIn = selectedTVs.reduce((max, size) => {
    return Math.max(max, tvDimensions(size).h)
  }, 0)

  const tableW = consoleWidthIn * PPU
  const tableH = consoleHeightIn * PPU
  const gap = gapIn * PPU
  const ceilingH = ceilingHeightIn * PPU

  // Total height of content (console + gap + tallest TV)
  const totalContentHIn = consoleHeightIn + gapIn + maxTVHeightIn
  const roomHIn = Math.max(ceilingHeightIn, totalContentHIn + 4)
  const roomH = roomHIn * PPU

  const topPad = 32
  const bottomPad = 24
  const svgH = roomH + topPad + bottomPad
  const floorY = svgH - bottomPad
  const ceilingY = floorY - ceilingH

  const maxContentW = Math.max(maxTVWidthIn * PPU, tableW)
  const svgW = Math.max(maxContentW + 160, 500)
  const tableX = (svgW - tableW) / 2
  const tableY = floorY - tableH

  const rightContentEdge = (svgW + maxContentW) / 2
  const dimX = rightContentEdge + 14

  const tallestTVTopY = selectedTVs.length > 0 ? tableY - gap - maxTVHeightIn * PPU : tableY
  const ceilingGapIn = (tallestTVTopY - ceilingY) / PPU

  return (
    <svg
      className="viz-svg"
      viewBox={`0 0 ${svgW} ${svgH}`}
      preserveAspectRatio="xMidYMid meet"
      aria-label="TV and console size comparison diagram with ceiling"
    >
      {/* Ceiling line */}
      <line
        x1={16}
        y1={ceilingY}
        x2={svgW - 16}
        y2={ceilingY}
        stroke="#4f5b66"
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />
      <text
        x={20}
        y={ceilingY - 8}
        fill="#888"
        fontSize={10}
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.05em"
      >
        CEILING — {formatFeetInches(ceilingHeightIn)}
      </text>

      {/* Floor line */}
      <line
        x1={16}
        y1={floorY}
        x2={svgW - 16}
        y2={floorY}
        stroke="#333"
        strokeWidth={2}
      />
      <text
        x={20}
        y={floorY + 16}
        fill="#555"
        fontSize={10}
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.05em"
      >
        FLOOR
      </text>

      {/* Console table */}
      <rect x={tableX} y={tableY} width={tableW} height={tableH} rx={4} fill="#8B6914" stroke="#5c4209" strokeWidth={2} />
      <rect x={tableX} y={tableY} width={tableW} height={6} rx={3} fill="#a07820" opacity={0.6} />
      <text x={tableX + tableW / 2} y={tableY + tableH / 2 + 5} textAnchor="middle" fill="white" fontSize={11} fontFamily="system-ui, sans-serif" opacity={0.85}>
        {consoleWidthIn}" W × {consoleHeightIn}" H
      </text>

      {/* Gap above table indicator */}
      {gapIn > 0 && selectedTVs.length > 0 && (
        <g>
          <line x1={dimX} y1={tableY} x2={dimX} y2={tableY - gap} stroke="#777" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={dimX - 4} y1={tableY} x2={dimX + 4} y2={tableY} stroke="#777" strokeWidth={1} />
          <line x1={dimX - 4} y1={tableY - gap} x2={dimX + 4} y2={tableY - gap} stroke="#777" strokeWidth={1} />
          <text x={dimX + 8} y={tableY - gap / 2 + 4} fill="#888" fontSize={10} fontFamily="system-ui, sans-serif">
            {gapIn}"
          </text>
        </g>
      )}

      {/* Gap to ceiling indicator */}
      {selectedTVs.length > 0 && ceilingGapIn > 0 && (
        <g>
          <line x1={dimX} y1={ceilingY} x2={dimX} y2={tallestTVTopY} stroke="#777" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={dimX - 4} y1={ceilingY} x2={dimX + 4} y2={ceilingY} stroke="#777" strokeWidth={1} />
          <line x1={dimX - 4} y1={tallestTVTopY} x2={dimX + 4} y2={tallestTVTopY} stroke="#777" strokeWidth={1} />
          <text x={dimX + 8} y={(ceilingY + tallestTVTopY) / 2 + 4} fill="#888" fontSize={10} fontFamily="system-ui, sans-serif">
            {ceilingGapIn.toFixed(1)}" to ceiling
          </text>
        </g>
      )}

      {/* TVs */}
      {selectedTVs.map((size) => {
        const { w, h } = tvDimensions(size)
        const tvW = w * PPU
        const tvH = h * PPU
        const bezel = 8
        const tvX = (svgW - tvW) / 2
        const tvY = tableY - gap - tvH
        const color = COLORS[TV_SIZES.indexOf(size) % COLORS.length]
        return (
          <g key={size}>
            <rect x={tvX} y={tvY} width={tvW} height={tvH} rx={6} fill={color} opacity={0.15} stroke={color} strokeWidth={2} />
            <rect x={tvX + bezel} y={tvY + bezel} width={tvW - bezel * 2} height={tvH - bezel * 2} rx={2} fill={color} opacity={0.1} />
            <text x={tvX + tvW / 2} y={tvY + tvH / 2 - 6} textAnchor="middle" fill={color} fontSize={14} fontWeight="bold" fontFamily="system-ui, sans-serif">
              {size}"
            </text>
            <text x={tvX + tvW / 2} y={tvY + tvH / 2 + 10} textAnchor="middle" fill={color} fontSize={10} fontFamily="system-ui, sans-serif" opacity={0.75}>
              {w.toFixed(1)}" × {h.toFixed(1)}"
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Slider({ label, value, min, max, step = 1, unit, onChange, formatValue }) {
  return (
    <div className="slider-row">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{formatValue ? formatValue(value) : `${value}${unit}`}</span>
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
        <span>{formatValue ? formatValue(min) : `${min}${unit}`}</span>
        <span>{formatValue ? formatValue(max) : `${max}${unit}`}</span>
      </div>
    </div>
  )
}

export default function App() {
  const [consoleWidth, setConsoleWidth] = useState(60)
  const [consoleHeight, setConsoleHeight] = useState(18)
  const [gap, setGap] = useState(4)
  const [ceilingHeight, setCeilingHeight] = useState(96)
  const [selectedTVs, setSelectedTVs] = useState([55, 65])

  function toggleTV(size) {
    setSelectedTVs(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size].sort((a, b) => a - b)
    )
  }

  return (
    <div className="app">
      <div className="app-body">
        {/* Visualization — shown first on mobile */}
        <main className="viz-area">
          {selectedTVs.length === 0 ? (
            <div className="viz-empty">
              <span className="viz-empty-icon">📺</span>
              Select a TV size below to compare
            </div>
          ) : (
            <Visualization
              consoleWidthIn={consoleWidth}
              consoleHeightIn={consoleHeight}
              gapIn={gap}
              ceilingHeightIn={ceilingHeight}
              selectedTVs={selectedTVs}
            />
          )}
        </main>

        {/* Controls — below visualization on mobile, sidebar on desktop */}
        <aside className="controls">
          <section className="controls-section">
            <h2>TV Sizes</h2>
            <div className="tv-buttons">
              {TV_SIZES.map(size => {
                const active = selectedTVs.includes(size)
                const color = COLORS[TV_SIZES.indexOf(size) % COLORS.length]
                return (
                  <button
                    key={size}
                    className="tv-btn"
                    onClick={() => toggleTV(size)}
                    style={{
                      borderColor: active ? color : undefined,
                      background: active ? `${color}22` : undefined,
                      color: active ? color : undefined,
                      fontWeight: active ? 700 : undefined,
                    }}
                  >
                    {size}"
                  </button>
                )
              })}
            </div>
          </section>

          <div className="controls-sliders-group">
            <section className="controls-section">
              <h2>Console Table</h2>
              <div className="sliders-inline">
                <Slider label="Width" value={consoleWidth} min={24} max={96} unit='"' onChange={setConsoleWidth} />
                <Slider label="Height" value={consoleHeight} min={12} max={36} unit='"' onChange={setConsoleHeight} />
              </div>
            </section>

            <div className="sliders-inline sliders-inline-sections">
              <section className="controls-section">
                <h2>Gap Above Table</h2>
                <Slider label="Height gap" value={gap} min={0} max={24} unit='"' onChange={setGap} />
              </section>

              <section className="controls-section">
                <h2>Ceiling Height</h2>
                <Slider
                  label="Height"
                  value={ceilingHeight}
                  min={84}
                  max={144}
                  unit='"'
                  onChange={setCeilingHeight}
                  formatValue={formatFeetInches}
                />
              </section>
            </div>
          </div>

          {selectedTVs.length > 0 && (
            <section className="controls-section">
              <h2>Selected TVs</h2>
              <div className="legend">
                {selectedTVs.map(size => {
                  const { w, h } = tvDimensions(size)
                  const color = COLORS[TV_SIZES.indexOf(size) % COLORS.length]
                  return (
                    <div key={size} className="legend-item">
                      <div className="legend-dot" style={{ background: color }} />
                      <span><strong style={{ color }}>{size}"</strong> — {w.toFixed(1)}" × {h.toFixed(1)}"</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
