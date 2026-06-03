import { useState } from 'react'

const TV_SIZES = [32, 43, 50, 55, 65, 75, 85]

// 16:9 aspect ratio — given diagonal in inches, compute width/height in inches
function tvDimensions(diagonal) {
  const w = (diagonal * 16) / Math.sqrt(16 ** 2 + 9 ** 2)
  const h = (diagonal * 9) / Math.sqrt(16 ** 2 + 9 ** 2)
  return { w, h }
}

const COLORS = [
  '#4f8ef7', '#f76f4f', '#4fcf8e', '#f7c84f',
  '#b44ff7', '#4fe8f7', '#f74fa0',
]

const PIXELS_PER_INCH = 5.5

function Visualization({ consoleWidthIn, consoleHeightIn, gapIn, selectedTVs }) {
  const ppi = PIXELS_PER_INCH

  // Find the widest TV to size the SVG
  const maxTVWidth = selectedTVs.reduce((max, size) => {
    const { w } = tvDimensions(size)
    return Math.max(max, w)
  }, consoleWidthIn)

  const svgW = Math.max(maxTVWidth * ppi + 80, consoleWidthIn * ppi + 80)
  const tableW = consoleWidthIn * ppi
  const tableH = consoleHeightIn * ppi
  const gap = gapIn * ppi

  // Compute total height needed
  const tallestTV = selectedTVs.reduce((max, size) => {
    const { h } = tvDimensions(size)
    return Math.max(max, h * ppi)
  }, 0)
  const totalH = tallestTV + gap + tableH + 60

  const tableX = (svgW - tableW) / 2
  const tableY = totalH - tableH - 20

  return (
    <svg
      width={svgW}
      height={totalH}
      viewBox={`0 0 ${svgW} ${totalH}`}
      style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
    >
      {/* Console table */}
      <rect
        x={tableX}
        y={tableY}
        width={tableW}
        height={tableH}
        rx={4}
        fill="#8B6914"
        stroke="#5c4209"
        strokeWidth={2}
      />
      {/* Table top surface highlight */}
      <rect
        x={tableX}
        y={tableY}
        width={tableW}
        height={6}
        rx={3}
        fill="#a07820"
        opacity={0.6}
      />
      {/* Console label */}
      <text
        x={tableX + tableW / 2}
        y={tableY + tableH / 2 + 5}
        textAnchor="middle"
        fill="white"
        fontSize={11}
        fontFamily="system-ui, sans-serif"
        opacity={0.85}
      >
        {consoleWidthIn}" W × {consoleHeightIn}" H
      </text>

      {/* Gap indicator */}
      {gapIn > 0 && selectedTVs.length > 0 && (
        <>
          <line
            x1={tableX + tableW + 12}
            y1={tableY}
            x2={tableX + tableW + 12}
            y2={tableY - gap}
            stroke="#999"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <line
            x1={tableX + tableW + 7}
            y1={tableY}
            x2={tableX + tableW + 17}
            y2={tableY}
            stroke="#999"
            strokeWidth={1}
          />
          <line
            x1={tableX + tableW + 7}
            y1={tableY - gap}
            x2={tableX + tableW + 17}
            y2={tableY - gap}
            stroke="#999"
            strokeWidth={1}
          />
          <text
            x={tableX + tableW + 24}
            y={tableY - gap / 2 + 4}
            fill="#888"
            fontSize={10}
            fontFamily="system-ui, sans-serif"
          >
            {gapIn}"
          </text>
        </>
      )}

      {/* TVs — stacked from the bottom of the gap upward */}
      {selectedTVs.map((size, i) => {
        const { w, h } = tvDimensions(size)
        const tvW = w * ppi
        const tvH = h * ppi
        const bezel = 8
        const tvX = (svgW - tvW) / 2
        const tvBottom = tableY - gap
        const tvY = tvBottom - tvH
        const color = COLORS[i % COLORS.length]

        return (
          <g key={size}>
            {/* TV outer bezel */}
            <rect
              x={tvX}
              y={tvY}
              width={tvW}
              height={tvH}
              rx={6}
              fill={color}
              opacity={0.18}
              stroke={color}
              strokeWidth={2}
            />
            {/* Screen area */}
            <rect
              x={tvX + bezel}
              y={tvY + bezel}
              width={tvW - bezel * 2}
              height={tvH - bezel * 2}
              rx={2}
              fill={color}
              opacity={0.12}
            />
            {/* Label: size */}
            <text
              x={tvX + tvW / 2}
              y={tvY + tvH / 2 - 6}
              textAnchor="middle"
              fill={color}
              fontSize={14}
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              {size}"
            </text>
            <text
              x={tvX + tvW / 2}
              y={tvY + tvH / 2 + 10}
              textAnchor="middle"
              fill={color}
              fontSize={10}
              fontFamily="system-ui, sans-serif"
              opacity={0.8}
            >
              {w.toFixed(1)}" × {h.toFixed(1)}"
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Slider({ label, value, min, max, step = 1, unit, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <label style={{ fontSize: 13, color: '#ccc', fontFamily: 'system-ui, sans-serif' }}>
          {label}
        </label>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fff', fontFamily: 'monospace' }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#4f8ef7' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666' }}>
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
  const [selectedTVs, setSelectedTVs] = useState([55, 65])

  function toggleTV(size) {
    setSelectedTVs(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size].sort((a, b) => a - b)
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <header style={{ padding: '20px 24px 0', borderBottom: '1px solid #333', paddingBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>
          TV &amp; Console Size Comparison
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>
          See how TV sizes look above your console table
        </p>
      </header>

      <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap' }}>
        {/* Controls panel */}
        <aside style={{
          width: 260,
          minWidth: 220,
          padding: 20,
          borderRight: '1px solid #2a2a2a',
          flexShrink: 0,
        }}>
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, marginTop: 0 }}>
              TV Sizes
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TV_SIZES.map((size, i) => {
                const active = selectedTVs.includes(size)
                const color = COLORS[TV_SIZES.indexOf(size) % COLORS.length]
                return (
                  <button
                    key={size}
                    onClick={() => toggleTV(size)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: `2px solid ${active ? color : '#444'}`,
                      background: active ? `${color}22` : 'transparent',
                      color: active ? color : '#888',
                      fontWeight: active ? 700 : 400,
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {size}"
                  </button>
                )
              })}
            </div>
          </section>

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, marginTop: 0 }}>
              Console Table
            </h2>
            <Slider
              label="Width"
              value={consoleWidth}
              min={24}
              max={96}
              unit='"'
              onChange={setConsoleWidth}
            />
            <Slider
              label="Height"
              value={consoleHeight}
              min={12}
              max={36}
              unit='"'
              onChange={setConsoleHeight}
            />
          </section>

          <section>
            <h2 style={{ fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, marginTop: 0 }}>
              Gap Above Table
            </h2>
            <Slider
              label="Height gap"
              value={gap}
              min={0}
              max={24}
              unit='"'
              onChange={setGap}
            />
          </section>

          {/* Legend */}
          {selectedTVs.length > 0 && (
            <section style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, marginTop: 0 }}>
                Selected TVs
              </h2>
              {selectedTVs.map((size, i) => {
                const { w, h } = tvDimensions(size)
                const color = COLORS[TV_SIZES.indexOf(size) % COLORS.length]
                return (
                  <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#ccc' }}>
                      <strong style={{ color }}>{size}"</strong> — {w.toFixed(1)}" × {h.toFixed(1)}"
                    </span>
                  </div>
                )
              })}
            </section>
          )}
        </aside>

        {/* Visualization area */}
        <main style={{ flex: 1, padding: 32, overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selectedTVs.length === 0 ? (
            <div style={{ color: '#555', fontSize: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📺</div>
              Select at least one TV size to compare
            </div>
          ) : (
            <Visualization
              consoleWidthIn={consoleWidth}
              consoleHeightIn={consoleHeight}
              gapIn={gap}
              selectedTVs={selectedTVs}
            />
          )}
        </main>
      </div>
    </div>
  )
}
