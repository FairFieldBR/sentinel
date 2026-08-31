import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const B = import.meta.env.BASE_URL

/* ─── Animated counter ─── */
function AnimCounter({ end, suffix = '', prefix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0; const dur = 2000; const t0 = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - t0) / dur, 1)
          setVal(Math.floor(p * end))
          if (p < 1) requestAnimationFrame(tick)
        }; tick()
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end])
  return <span ref={ref}>{prefix}{val.toLocaleString('pt-BR')}{suffix}</span>
}

/* ─── Processing text cycle ─── */
function useProcessingText() {
  const texts = [
    "Analisando o perfil da empresa...",
    "Consultando o mercado segurador...",
    "Comparando coberturas...",
    "Avaliando condições...",
    "Recomendando a melhor condição...",
  ]
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setIdx(p => (p + 1) % texts.length), 2000)
    return () => clearInterval(iv)
  }, [])
  return texts[idx]
}

/* ─── Animated Checklist ─── */
function AnimatedChecklist({ items }) {
  const [checked, setChecked] = useState([])
  useEffect(() => {
    const totalDuration = items.length * 800
    const timers = items.map((_, i) =>
      setTimeout(() => setChecked(prev => [...prev, i]), (i + 1) * 800)
    )
    // After all checked, reset and loop
    const reset = setTimeout(() => setChecked([]), totalDuration + 2000)
    const loop = setInterval(() => {
      setChecked([])
      items.forEach((_, i) =>
        setTimeout(() => setChecked(prev => [...prev, i]), (i + 1) * 800)
      )
    }, totalDuration + 2500)
    return () => { timers.forEach(clearTimeout); clearTimeout(reset); clearInterval(loop) }
  }, [items.length])

  return (
    <div className="space-y-1.5 text-left max-w-[220px] mx-auto">
      {items.map((f, i) => (
        <div key={f} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all duration-500 ${
          checked.includes(i)
            ? 'bg-accent-emerald/[0.06] border-accent-emerald/20'
            : 'bg-white/[0.04] border-white/[0.06]'
        }`}>
          <div className={`h-3 w-3 rounded-sm flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
            checked.includes(i)
              ? 'bg-accent-emerald/20 border border-accent-emerald/40'
              : 'border border-white/10'
          }`}>
            {checked.includes(i) && (
              <svg className="h-2 w-2 text-accent-emerald animate-fadeIn" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className={`text-[10px] transition-colors duration-500 ${checked.includes(i) ? 'text-white/60' : 'text-white/30'}`}>{f}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Mini Shield for Header ─── */
export function MiniShield({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Shield body */}
      <path d="M40 12 L62 24 L62 42 C62 56 52 66 40 70 C28 66 18 56 18 42 L18 24 Z"
        fill="rgba(125,211,252,0.08)" stroke="#7DD3FC" strokeWidth="1.5">
        <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
      </path>
      {/* Inner shield */}
      <path d="M40 20 L56 28 L56 42 C56 52 49 60 40 63 C31 60 24 52 24 42 L24 28 Z"
        fill="rgba(125,211,252,0.05)" stroke="#7DD3FC" strokeWidth="0.8" opacity="0.4" />
      {/* $ symbol */}
      <text x="40" y="48" textAnchor="middle" fill="#7DD3FC" fontSize="22" fontWeight="bold" fontFamily="Inter, sans-serif">
        $
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </text>
      {/* Scan line */}
      <line x1="22" y1="40" x2="58" y2="40" stroke="#7DD3FC" strokeWidth="0.5" opacity="0.3">
        <animate attributeName="y1" values="25;55;25" dur="3s" repeatCount="indefinite" />
        <animate attributeName="y2" values="25;55;25" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.4;0" dur="3s" repeatCount="indefinite" />
      </line>
      <defs>
        <linearGradient id="miniGrad" x1="0" y1="0" x2="80" y2="80">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ─── Tech Brazil Map (Crédito Interno) ─── */
function TechBrazilMap() {
  /* Outline computed from real geographic coordinates:
     x = (74 - lon) * 4.85 + 5,  y = (5.3 - lat) * 4.87 + 5
     Brazil extremes: 5.3°N to 33.75°S, 74°W to 34.8°W */
  const brazilPath = `M114,10 L112,16 L117,22 L118,28 L122,30 L126,31 L129,34 L129,38
    L136,40 L142,42 L149,43 L155,44 L161,45 L166,44 L170,44 L174,46
    L177,49 L182,50 L187,52 L190,54 L192,56 L193,59 L195,63 L195,65
    L195,68 L195,70 L193,74 L191,78 L188,81 L184,84 L181,88 L179,91
    L177,94 L176,99 L175,103 L174,108 L174,111 L173,117 L171,123
    L168,130 L164,136 L160,140 L157,142 L154,143 L148,146 L143,148
    L139,148 L134,151 L129,155 L129,160 L129,165 L126,170 L123,174
    L120,176 L116,177 L114,182 L112,187 L108,192 L105,195
    L100,193 L95,189 L90,184 L87,176 L90,170 L93,165 L96,160
    L99,155 L100,151 L101,148 L98,143 L94,140 L90,135 L87,130
    L84,123 L84,117 L84,109 L80,106 L73,104 L66,98 L58,92
    L52,87 L47,83 L40,84 L35,82 L31,84 L24,78 L18,72
    L11,68 L5,67 L8,62 L12,57 L17,53 L21,52 L25,51
    L30,44 L33,38 L36,33 L39,31 L40,28 L40,25 L44,20
    L50,17 L56,14 L62,11 L68,8 L70,6 L72,5
    L71,8 L71,12 L74,14 L78,17 L84,19 L92,21
    L98,20 L102,20 L108,14 Z`

  // State border paths (simplified) for visual detail like reference image
  const stateBorders = [
    // Amazonas/Pará (roughly along Tapajós longitude)
    "M106,31 L106,52 L114,72 L130,81",
    // Pará/Maranhão/Tocantins
    "M130,38 L130,55 L130,81",
    // Tocantins/Goiás/Bahia
    "M130,81 L145,82 L160,90 L177,94",
    // Mato Grosso (southern border)
    "M73,104 L84,109 L92,107 L108,107 L132,108",
    // Goiás/Minas border
    "M108,107 L132,108 L151,118 L168,130",
    // São Paulo/Paraná
    "M129,148 L139,148 L148,146",
    // Minas/SP/RJ
    "M132,108 L132,130 L139,148",
    // RS/SC
    "M105,165 L129,165",
    // Mato Grosso do Sul
    "M84,123 L99,130 L101,148",
    // Piauí/Ceará/RN
    "M161,45 L156,55 L168,70 L177,49",
    // BA/MG
    "M132,108 L151,118 L174,111",
  ]

  // Cities: [x, y, importance] from real coordinates
  const nodes = [
    [70,17, 2],   // Boa Vista
    [73,46, 3],   // Manaus
    [117,31, 2],  // Macapá
    [129,38, 3],  // Belém
    [149,43, 2],  // São Luís
    [156,55, 2],  // Teresina
    [177,49, 3],  // Fortaleza
    [193,59, 2],  // Natal
    [194,70, 3],  // Recife
    [191,78, 2],  // Maceió
    [184,84, 2],  // Aracaju
    [177,94, 3],  // Salvador
    [35,80, 2],   // Rio Branco
    [54,74, 2],   // Porto Velho
    [130,81, 2],  // Palmas
    [92,107, 2],  // Cuiabá
    [132,108, 3], // Brasília
    [125,112, 2], // Goiânia
    [151,128, 2], // Belo Horizonte
    [154,142, 3], // Rio de Janeiro
    [138,145, 3], // São Paulo
    [125,155, 2], // Curitiba
    [129,165, 2], // Florianópolis
    [116,177, 3], // Porto Alegre
    [99,130, 2],  // Campo Grande
  ]
  const connections = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],
    [1,13],[13,12],[13,14],[14,16],[16,17],[17,15],[15,14],[16,18],[18,19],
    [19,20],[20,21],[21,22],[22,23],[1,14],[3,6],[6,11],[11,18],[16,20],
    [17,20],[5,11],[4,14],[0,13],[12,1],[15,24],[24,20],[8,11],[14,17],
    [13,15],[1,3],[3,14],[20,18],[11,16],[5,8],[15,24],[24,21]
  ]

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
        <defs>
          <radialGradient id="brGlow" cx="55%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0" />
          </radialGradient>
          <filter id="nodeGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="borderGlow"><feGaussianBlur stdDeviation="1.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {/* Background glow */}
        <ellipse cx="110" cy="100" rx="90" ry="95" fill="url(#brGlow)" />
        {/* Brazil outline */}
        <path d={brazilPath} fill="rgba(125,211,252,0.04)" stroke="#7DD3FC" strokeWidth="1.4" strokeLinejoin="round" filter="url(#borderGlow)">
          <animate attributeName="stroke-opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite" />
        </path>
        {/* State borders */}
        {stateBorders.map((d,i) => (
          <path key={`sb${i}`} d={d} stroke="#7DD3FC" strokeWidth="0.4" fill="none" opacity="0.08" strokeLinejoin="round">
            <animate attributeName="opacity" values="0.04;0.12;0.04" dur={`${3+i*0.5}s`} repeatCount="indefinite" />
          </path>
        ))}
        {/* Network mesh */}
        {connections.map(([a,b],i) => (
          <line key={`c${i}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="#7DD3FC" strokeWidth="0.5" opacity="0.12">
            <animate attributeName="opacity" values="0.06;0.22;0.06" dur={`${2+(i%5)*0.4}s`} begin={`${(i%7)*0.3}s`} repeatCount="indefinite" />
          </line>
        ))}
        {/* City nodes with glow */}
        {nodes.map(([cx,cy,sz],i) => (
          <g key={`n${i}`}>
            <circle cx={cx} cy={cy} r={sz*3} fill="#7DD3FC" opacity="0.06" filter="url(#nodeGlow)" />
            <circle cx={cx} cy={cy} r={sz*0.9} fill="#7DD3FC">
              <animate attributeName="opacity" values="0.5;1;0.5" dur={`${1.5+i*0.12}s`} repeatCount="indefinite" />
              <animate attributeName="r" values={`${sz*0.6};${sz*1.1};${sz*0.6}`} dur={`${1.8+i*0.15}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        {/* Data pulses traveling along routes */}
        <circle r="2" fill="#7DD3FC" filter="url(#nodeGlow)">
          <animateMotion dur="4.5s" repeatCount="indefinite" path="M73,46 L129,38 L177,49 L193,59 L194,70 L177,94 L151,128 L154,142 L138,145 L125,155 L116,177" />
          <animate attributeName="opacity" values="0;1;1;1;0" dur="4.5s" repeatCount="indefinite" />
        </circle>
        <circle r="1.5" fill="#34D399">
          <animateMotion dur="3.5s" repeatCount="indefinite" begin="1.2s" path="M35,80 L54,74 L92,107 L132,108 L138,145 L129,165 L116,177" />
          <animate attributeName="opacity" values="0;0.9;0.9;0" dur="3.5s" begin="1.2s" repeatCount="indefinite" />
        </circle>
        <circle r="1.2" fill="#FCD34D">
          <animateMotion dur="3.8s" repeatCount="indefinite" begin="2.5s" path="M149,43 L130,81 L132,108 L151,128 L154,142" />
          <animate attributeName="opacity" values="0;0.8;0.8;0" dur="3.8s" begin="2.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}

/* ─── Tech Globe (Crédito Externo) ─── */
function TechGlobe() {
  // Network nodes positioned on continents
  const nodes = [
    // Americas
    [24,20],[20,28],[18,35],[22,42],[26,48],[30,54],[32,62],[30,70],[28,76],
    // Europe
    [52,18],[56,22],[60,20],[64,24],[58,28],
    // Africa
    [56,36],[60,42],[64,50],[62,58],[58,64],[54,56],
    // Asia / Middle East
    [68,20],[72,26],[76,32],[80,28],[84,24],[78,38],[74,44],
    // Oceania hint
    [82,54],[80,60],
    // Extra density
    [36,30],[42,24],
  ]
  const mesh = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8], // Americas chain
    [9,10],[10,11],[11,12],[12,13],[13,9], // Europe
    [14,15],[15,16],[16,17],[17,18],[18,19],[19,14], // Africa
    [20,21],[21,22],[22,23],[23,24],[24,20],[22,25],[25,26], // Asia
    [27,28], // Oceania
    // Cross-continental connections
    [0,29],[29,30],[30,9],[9,20],[13,14],[14,19],[19,15],[16,25],[25,27],
    [1,29],[2,30],[11,20],[12,21],[22,24],[23,27],[26,28],[17,27],
    [3,30],[10,13],[15,19],[21,25],[5,19],[6,18],[10,14],[24,22],
  ]

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <defs>
          <radialGradient id="gGlow" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0" />
          </radialGradient>
          <clipPath id="gClip"><circle cx="50" cy="50" r="42" /></clipPath>
          <filter id="gnGlow"><feGaussianBlur stdDeviation="1.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {/* Globe bg */}
        <circle cx="50" cy="50" r="42" fill="url(#gGlow)" />
        <circle cx="50" cy="50" r="42" stroke="#7DD3FC" strokeWidth="1" fill="none">
          <animate attributeName="stroke-opacity" values="0.25;0.55;0.25" dur="4s" repeatCount="indefinite" />
        </circle>
        {/* Continent silhouettes - faithful orthographic projection centered ~20°W, 10°N */}
        <g clipPath="url(#gClip)" opacity="0.15">
          {/* North America - with recognizable coastline, Great Lakes indent, Florida, Mexico */}
          <path d={`M12,18 L14,14 L18,12 L22,10 L26,11 L30,10 L34,12 L36,10 L38,12
            L37,15 L35,18 L33,16 L30,18 L28,16 L26,18 L28,20 L30,22
            L28,24 L26,22 L24,24 L22,26 L20,24 L18,26 L16,28
            L18,30 L20,32 L22,34 L20,36 L18,34 L16,32 L14,30
            L12,28 L10,24 L10,20 Z`} fill="#7DD3FC" />
          {/* Florida peninsula */}
          <path d="M22,34 L24,36 L26,38 L24,40 L22,38 L20,36 Z" fill="#7DD3FC" />
          {/* Mexico & Central America */}
          <path d="M14,30 L16,32 L14,34 L16,36 L18,38 L20,40 L22,42 L20,44 L18,42 L16,40 L14,38 L12,36 L10,34 L10,32 Z" fill="#7DD3FC" />

          {/* South America - with recognizable shape: bulge at NE, narrowing south, Patagonia */}
          <path d={`M22,46 L26,44 L30,44 L34,46 L36,44 L38,46 L36,48
            L38,50 L36,52 L38,54 L40,56 L42,60 L42,64
            L40,68 L38,72 L36,76 L34,78 L32,80 L30,82
            L28,80 L26,76 L24,72 L22,68 L20,62
            L18,56 L18,52 L20,48 Z`} fill="#7DD3FC" />

          {/* Europe - British Isles, Scandinavia, Iberia, Italy boot, Balkans */}
          <path d={`M48,14 L50,12 L52,14 L50,16 L48,16 Z`} fill="#7DD3FC" />
          <path d={`M52,10 L54,8 L56,10 L58,8 L60,10 L62,10 L64,12
            L66,14 L68,12 L70,14 L72,16 L74,14 L76,16
            L74,18 L72,20 L70,18 L68,20 L66,22 L64,20
            L62,22 L60,24 L58,22 L56,24 L54,22 L52,20
            L50,18 L52,16 L54,14 Z`} fill="#7DD3FC" />
          {/* Iberian peninsula */}
          <path d="M50,22 L52,20 L54,22 L56,24 L54,26 L52,28 L50,26 L48,24 Z" fill="#7DD3FC" />
          {/* Italian boot */}
          <path d="M58,24 L60,26 L62,28 L60,30 L58,28 L56,26 Z" fill="#7DD3FC" />

          {/* Africa - recognizable shape with horn, bulge, tapering south */}
          <path d={`M50,30 L52,28 L54,30 L58,30 L62,32 L66,34
            L70,36 L72,38 L74,40 L76,44 L74,48
            L72,52 L70,56 L68,60 L66,64 L64,68
            L62,70 L60,68 L58,64 L56,60
            L54,56 L52,52 L50,48 L48,44
            L48,40 L48,36 L50,34 Z`} fill="#7DD3FC" />
          {/* Madagascar */}
          <path d="M72,58 L74,56 L76,58 L74,62 L72,60 Z" fill="#7DD3FC" />

          {/* Middle East */}
          <path d="M70,28 L74,26 L76,28 L78,30 L80,32 L78,34 L76,36 L74,34 L72,32 L70,30 Z" fill="#7DD3FC" />

          {/* Asia - India subcontinent, SE Asia */}
          <path d={`M78,22 L80,20 L82,18 L84,20 L86,22 L88,26
            L90,30 L88,32 L86,30 L84,28 L82,26 L80,24 Z`} fill="#7DD3FC" />
          {/* India */}
          <path d="M80,34 L82,32 L84,34 L86,36 L84,40 L82,44 L80,42 L78,38 L78,36 Z" fill="#7DD3FC" />
          {/* Southeast Asia */}
          <path d="M86,34 L88,32 L90,34 L88,38 L86,40 L84,38 Z" fill="#7DD3FC" />

          {/* Australia */}
          <path d="M82,52 L86,50 L90,52 L92,56 L90,60 L86,62 L82,60 L80,56 Z" fill="#7DD3FC" />
        </g>
        {/* Grid lines - latitude/longitude */}
        <ellipse cx="50" cy="50" rx="42" ry="12" stroke="#7DD3FC" strokeWidth="0.3" opacity="0.08" />
        <ellipse cx="50" cy="50" rx="42" ry="24" stroke="#7DD3FC" strokeWidth="0.3" opacity="0.07" />
        <ellipse cx="50" cy="50" rx="42" ry="36" stroke="#7DD3FC" strokeWidth="0.3" opacity="0.06" />
        <ellipse cx="50" cy="50" rx="14" ry="42" stroke="#7DD3FC" strokeWidth="0.3" opacity="0.08" />
        <ellipse cx="50" cy="50" rx="28" ry="42" stroke="#7DD3FC" strokeWidth="0.3" opacity="0.07" />
        <line x1="8" y1="50" x2="92" y2="50" stroke="#7DD3FC" strokeWidth="0.3" opacity="0.08" />
        <line x1="50" y1="8" x2="50" y2="92" stroke="#7DD3FC" strokeWidth="0.3" opacity="0.06" />
        {/* Network mesh */}
        {mesh.map(([a,b],i) => (
          <line key={`gm${i}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="#7DD3FC" strokeWidth="0.35" opacity="0.1">
            <animate attributeName="opacity" values="0.05;0.18;0.05" dur={`${2+(i%6)*0.3}s`} begin={`${(i%8)*0.2}s`} repeatCount="indefinite" />
          </line>
        ))}
        {/* Nodes */}
        {nodes.map(([cx,cy],i) => (
          <g key={`gn${i}`}>
            <circle cx={cx} cy={cy} r="2" fill="#7DD3FC" opacity="0.04" filter="url(#gnGlow)" />
            <circle cx={cx} cy={cy} r={i%3===0?1.2:0.7} fill="#7DD3FC">
              <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${1.5+(i%5)*0.2}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        {/* Traveling pulses */}
        <circle r="1.2" fill="#7DD3FC" filter="url(#gnGlow)">
          <animateMotion dur="5s" repeatCount="indefinite" path="M24,20 L30,54 L32,62 L28,76 L50,88 L64,50 L76,32 L84,24 L82,54" />
          <animate attributeName="opacity" values="0;1;1;1;0" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle r="1" fill="#34D399">
          <animateMotion dur="4s" repeatCount="indefinite" begin="1.5s" path="M52,18 L60,20 L72,26 L80,28 L78,38 L62,58 L56,36 L30,54 L22,42" />
          <animate attributeName="opacity" values="0;0.9;0.9;0" dur="4s" begin="1.5s" repeatCount="indefinite" />
        </circle>
        {/* Orbit rings */}
        <circle cx="50" cy="50" r="46" stroke="#7DD3FC" strokeWidth="0.4" strokeDasharray="3 5" opacity="0.08">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="25s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}

/* ─── Tech Shield Component ─── */
function TechShield() {
  const packets = [
    { id: 1, angle: 0,   delay: '0s',    label: 'Chubb' },
    { id: 2, angle: 51,  delay: '0.7s',  label: 'Coface' },
    { id: 3, angle: 102, delay: '1.4s',  label: 'Atradius' },
    { id: 4, angle: 153, delay: '2.1s',  label: 'AVLA' },
    { id: 5, angle: 204, delay: '2.8s',  label: 'AIG' },
    { id: 6, angle: 255, delay: '3.5s',  label: 'Allianz' },
    { id: 7, angle: 306, delay: '4.2s',  label: 'CESCE' },
  ]

  return (
    <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] flex items-center justify-center select-none">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(125,211,252,0.06) 0%, transparent 70%)' }} />

      {/* Orbit rings */}
      <div className="absolute inset-4 rounded-full border border-sentinel/10 animate-spin" style={{ animationDuration: '18s' }} />
      <div className="absolute inset-8 rounded-full border border-dashed border-sentinel/8 animate-spin" style={{ animationDuration: '28s', animationDirection: 'reverse' }} />
      <div className="absolute inset-14 rounded-full border border-sentinel/12 animate-spin" style={{ animationDuration: '12s' }} />

      {/* Orbiting data packets */}
      {packets.map((p) => {
        const rad = (p.angle * Math.PI) / 180
        const r = 120
        const x = Math.cos(rad) * r
        const y = Math.sin(rad) * r
        return (
          <div key={p.id} className="absolute flex flex-col items-center gap-0.5"
            style={{ transform: `translate(${x}px, ${y}px)`, animation: `orbit-pulse 3s ease-in-out infinite`, animationDelay: p.delay }}>
            <div className="w-2 h-2 rounded-full bg-sentinel shadow-lg" style={{ boxShadow: '0 0 8px rgba(125,211,252,0.8)' }} />
            <span className="text-[7px] text-sentinel/60 font-mono font-bold whitespace-nowrap">{p.label}</span>
          </div>
        )
      })}

      {/* Scanning line */}
      <div className="absolute inset-14 rounded-full overflow-hidden">
        <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '3s',
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(125,211,252,0.15) 60deg, transparent 90deg)' }} />
      </div>

      {/* Shield SVG center */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="absolute w-32 h-32 rounded-full animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(125,211,252,0.12) 0%, transparent 70%)', animationDuration: '2.5s' }} />
        <svg viewBox="0 0 120 136" className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-xl" fill="none">
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E3A5F" />
              <stop offset="100%" stopColor="#0A1628" />
            </linearGradient>
            <linearGradient id="sb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <filter id="glow-s">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Shield body */}
          <path d="M60 4 L112 26 L112 72 Q112 112 60 132 Q8 112 8 72 L8 26 Z" fill="url(#sg)" />
          {/* Shield border */}
          <path d="M60 4 L112 26 L112 72 Q112 112 60 132 Q8 112 8 72 L8 26 Z"
            fill="none" stroke="url(#sb)" strokeWidth="1.5" opacity="0.6" filter="url(#glow-s)" />
          {/* Inner border */}
          <path d="M60 14 L102 32 L102 72 Q102 104 60 122 Q18 104 18 72 L18 32 Z"
            fill="none" stroke="rgba(125,211,252,0.15)" strokeWidth="1" />
          {/* $ — capital protegido */}
          <text x="60" y="84" fontFamily="Arial,Helvetica,sans-serif" fontWeight="900" fontSize="44"
            fill="url(#sb)" textAnchor="middle" filter="url(#glow-s)" opacity="0.7">$</text>
          {/* Corner tech details */}
          <g stroke="rgba(125,211,252,0.3)" strokeWidth="1" fill="none">
            <polyline points="20,35 14,35 14,28" /><polyline points="100,35 106,35 106,28" />
            <polyline points="20,100 14,100 14,107" /><polyline points="100,100 106,100 106,107" />
          </g>
          {/* Scan line animation */}
          <line x1="18" y1="75" x2="102" y2="75" stroke="rgba(125,211,252,0.25)" strokeWidth="1"
            style={{ animation: 'scan-line 2.5s ease-in-out infinite' }} />
        </svg>
      </div>

      <style>{`
        @keyframes orbit-pulse {
          0%, 100% { opacity: 0.4; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(1); }
          50% { opacity: 1; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(1.3); }
        }
        @keyframes scan-line {
          0% { transform: translateY(-28px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(28px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function Home() {
  const [started, setStarted] = useState(false)
  const processingText = useProcessingText()

  useEffect(() => {
    function handleIniciar() {
      setStarted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('sentinel-iniciar', handleIniciar)
    return () => window.removeEventListener('sentinel-iniciar', handleIniciar)
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(started ? 'sentinel-started' : 'sentinel-reset'))
  }, [started])

  const seguradoras = [
    { src: `${B}logos/coface.png`, alt: 'Coface', invert: true, size: 'h-7 sm:h-9', mini: 'h-5' },
    { src: `${B}logos/atradius.svg`, alt: 'Atradius', size: 'h-7 sm:h-9', mini: 'h-5' },
    { src: `${B}logos/allianz-trade.png`, alt: 'Allianz Trade', invert: true, size: 'h-9 sm:h-12', mini: 'h-7' },
    { src: `${B}logos/avla.svg`, alt: 'AVLA', size: 'h-6 sm:h-8', mini: 'h-4' },
    { src: `${B}logos/aig.png`, alt: 'AIG', size: 'h-7 sm:h-9', mini: 'h-5' },
    { src: `${B}logos/cesce.svg`, alt: 'CESCE', size: 'h-7 sm:h-9', mini: 'h-5' },
    { src: `${B}logos/chubb.svg`, alt: 'CHUBB', size: 'h-7 sm:h-9', mini: 'h-5' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">

      {/* ==================== LANDING ==================== */}
      {!started && (
        <div className="animate-fadeIn">

          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-navy via-navy-light to-navy p-8 sm:p-12 pb-10 mb-8">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sentinel/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cobre/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-[100px]" />
            <div className="absolute inset-0 bg-grid opacity-30" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-6">
              {/* Left: Text */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-[1.05] tracking-tight text-white">
                  <span className="bg-gradient-to-r from-sentinel to-sentinel-light bg-clip-text text-transparent">SENTINEL</span>
                </h1>
                <p className="text-lg sm:text-xl font-medium text-white/50 mb-6 leading-relaxed max-w-lg">
                  Nossa plataforma analisa o perfil da sua empresa e consulta simultaneamente todas as seguradoras do mercado, garantindo a <strong className="text-cobre">melhor opção em seguro de crédito</strong> para o seu negócio.
                </p>
                <button
                  onClick={() => { setStarted(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-sentinel-dark to-sentinel text-navy-dark px-8 sm:px-10 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-sentinel/15 hover:shadow-2xl hover:shadow-sentinel/25 hover:scale-[1.02] transition-all duration-300"
                >
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Iniciar Cotação
                  <span className="absolute -top-2 -right-2 bg-accent-emerald text-navy-dark text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Grátis
                  </span>
                </button>
                <p className="text-white/20 text-xs mt-4">Sem compromisso · Resultado instantâneo</p>
              </div>

              {/* Right: Animated Tech Shield */}
              <div className="flex-shrink-0 flex items-center justify-center w-full lg:w-auto">
                <TechShield />
              </div>
            </div>
          </section>

          {/* Por que o SENTINEL — Unified glass section */}
          <section className="card-glass mb-8 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-sentinel/5 rounded-full blur-[100px]" />
              <div className="absolute -bottom-20 -left-20 w-[250px] h-[250px] bg-cobre/5 rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-grid opacity-20" />
            </div>

            <div className="relative z-10">
              {/* Section header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentinel/10 border border-sentinel/20 text-sentinel text-[10px] font-bold uppercase tracking-widest mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-sentinel animate-pulse" />
                  Resultados Comprovados
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Por que escolher o SENTINEL</h2>
                <p className="text-white/30 text-sm mt-2">Números que falam por si — tecnologia que transforma.</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
                {[
                  {
                    value: 'Consultamos todas as seguradoras do mercado', label: '',
                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
                    gradient: 'from-sentinel to-sentinel-light',
                    iconClass: 'bg-sentinel/10 border border-sentinel/20 text-sentinel shadow-lg shadow-sentinel/5'
                  },
                  {
                    val: 500, suffix: '+', label: 'Empresas atendidas',
                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
                    gradient: 'from-cobre to-cobre-light',
                    iconClass: 'bg-cobre/10 border border-cobre/20 text-cobre shadow-lg shadow-cobre/5'
                  },
                  {
                    val: 98, suffix: '%', label: 'Satisfação dos clientes',
                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
                    gradient: 'from-accent-emerald to-emerald-300',
                    iconClass: 'bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald shadow-lg shadow-accent-emerald/5'
                  },
                  {
                    value: 'Instantâneo', label: 'Prazo de entrega',
                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                    gradient: 'from-accent-violet to-violet-300',
                    iconClass: 'bg-accent-violet/10 border border-accent-violet/20 text-accent-violet shadow-lg shadow-accent-violet/5'
                  },
                ].map((s) => (
                  <div key={s.label || s.value} className="text-center group">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${s.iconClass}`}>
                      {s.icon}
                    </div>
                    <p className={`font-black text-white ${s.value ? 'text-xl sm:text-2xl leading-tight' : 'text-3xl sm:text-4xl'}`}>
                      {s.value || <AnimCounter end={s.val} suffix={s.suffix} />}
                    </p>
                    {s.label && <p className="text-xs sm:text-sm text-white/40 mt-2 font-medium">{s.label}</p>}
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-10" />

              {/* Value pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                    title: '100% Gratuito',
                    text: 'O estudo de mercado SENTINEL é totalmente gratuito. Buscamos a melhor condição do mercado sem que você tenha que pagar a mais por isso.',
                    color: 'emerald', borderColor: 'border-l-accent-emerald/50', iconBg: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20'
                  },
                  {
                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
                    title: 'Decisão Estratégica',
                    text: 'Seus dados geram um estudo de mercado completo que poderá ser determinante para a estratégia de crédito da sua empresa.',
                    color: 'sentinel', borderColor: 'border-l-sentinel/50', iconBg: 'bg-sentinel/10 text-sentinel border-sentinel/20'
                  },
                  {
                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                    title: 'Inteligência de Mercado Fairfield',
                    text: 'O SENTINEL processa seu perfil com a inteligência proprietária da Fairfield e recomenda a melhor condição custo-benefício.',
                    color: 'cobre', borderColor: 'border-l-cobre/50', iconBg: 'bg-cobre/10 text-cobre border-cobre/20'
                  },
                ].map((p) => (
                  <div key={p.title} className={`rounded-xl bg-white/[0.03] border border-white/[0.06] border-l-[3px] ${p.borderColor} p-5 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 group`}>
                    <div className={`h-11 w-11 rounded-xl border flex items-center justify-center mb-4 ${p.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                      {p.icon}
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">{p.title}</h4>
                    <p className="text-sm text-white/35 leading-relaxed">{p.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works - Engine Flow */}
          <section className="card-glass mb-8 relative overflow-hidden">
            {/* Background scan effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sentinel/20 to-transparent" style={{ animation: 'flow-scan 4s ease-in-out infinite' }} />
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentinel/10 border border-sentinel/20 text-sentinel text-[10px] font-bold uppercase tracking-widest mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-sentinel animate-pulse" />
                Smart Credit Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Como funciona o SENTINEL</h2>
              <p className="text-white/30 text-sm mt-2">Três etapas. Uma plataforma. A melhor solução de crédito.</p>
            </div>

            {/* 3-Step Flow with connected lines */}
            <div className="relative">
              {/* Connecting lines — CSS-positioned to touch icon edges exactly */}
              {/* Line 1→2: right edge of icon1 to left edge of icon2 */}
              <div className="hidden md:block absolute z-0 overflow-visible" style={{
                top: '35px',
                left: 'calc(16.667% - 0.833rem + 36px)',
                width: 'calc(33.333% + 0.833rem - 72px)',
                height: '2px',
              }}>
                <div className="w-full h-full bg-sentinel/15 relative overflow-visible">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-300/40 to-sky-400/40" style={{ animation: 'linePulse 2s ease-in-out infinite' }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_8px_#7DD3FC]" style={{ animation: 'travelDot 2.5s linear infinite' }} />
                </div>
              </div>
              {/* Line 2→3: right edge of icon2 to left edge of icon3 */}
              <div className="hidden md:block absolute z-0 overflow-visible" style={{
                top: '35px',
                left: 'calc(50% + 36px)',
                width: 'calc(33.333% + 0.833rem - 72px)',
                height: '2px',
              }}>
                <div className="w-full h-full bg-sentinel/15 relative overflow-visible">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400/40 to-emerald-400/40" style={{ animation: 'linePulse 2s ease-in-out infinite', animationDelay: '1s' }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" style={{ animation: 'travelDot 2.5s linear infinite', animationDelay: '0.8s' }} />
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                {/* Step 1 — Input */}
                <div className="text-center">
                  <div className="w-[72px] h-[72px] rounded-2xl bg-sentinel/10 border border-sentinel/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-7 w-7 text-sentinel" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Seus Dados</h3>
                  <p className="text-[11px] text-white/30 mb-3">Preencha as informações da empresa</p>
                  <AnimatedChecklist items={["CNPJ / Razão Social", "Faturamento e Carteira", "Histórico de Perdas", "Amostra de Compradores"]} />
                </div>

                {/* Step 2 — Engine */}
                <div className="text-center">
                  <div className="w-[72px] h-[72px] rounded-2xl bg-sentinel/15 border border-sentinel/25 flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                    {/* Animated chip with circuits */}
                    <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
                      {/* Circuit traces — horizontal */}
                      <line x1="0" y1="14" x2="14" y2="14" stroke="#7DD3FC" strokeWidth="1" opacity="0.3">
                        <animate attributeName="opacity" values="0.1;0.6;0.1" dur="1.5s" repeatCount="indefinite" />
                      </line>
                      <line x1="34" y1="14" x2="48" y2="14" stroke="#7DD3FC" strokeWidth="1" opacity="0.3">
                        <animate attributeName="opacity" values="0.1;0.6;0.1" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
                      </line>
                      <line x1="0" y1="24" x2="14" y2="24" stroke="#7DD3FC" strokeWidth="1" opacity="0.3">
                        <animate attributeName="opacity" values="0.1;0.6;0.1" dur="1.8s" begin="0.5s" repeatCount="indefinite" />
                      </line>
                      <line x1="34" y1="24" x2="48" y2="24" stroke="#7DD3FC" strokeWidth="1" opacity="0.3">
                        <animate attributeName="opacity" values="0.1;0.6;0.1" dur="1.8s" begin="0.8s" repeatCount="indefinite" />
                      </line>
                      <line x1="0" y1="34" x2="14" y2="34" stroke="#7DD3FC" strokeWidth="1" opacity="0.3">
                        <animate attributeName="opacity" values="0.1;0.6;0.1" dur="1.6s" begin="1s" repeatCount="indefinite" />
                      </line>
                      <line x1="34" y1="34" x2="48" y2="34" stroke="#7DD3FC" strokeWidth="1" opacity="0.3">
                        <animate attributeName="opacity" values="0.1;0.6;0.1" dur="1.6s" begin="0.2s" repeatCount="indefinite" />
                      </line>
                      {/* Circuit traces — vertical */}
                      <line x1="14" y1="0" x2="14" y2="14" stroke="#7DD3FC" strokeWidth="1" opacity="0.3">
                        <animate attributeName="opacity" values="0.1;0.6;0.1" dur="2s" begin="0.4s" repeatCount="indefinite" />
                      </line>
                      <line x1="34" y1="0" x2="34" y2="14" stroke="#7DD3FC" strokeWidth="1" opacity="0.3">
                        <animate attributeName="opacity" values="0.1;0.6;0.1" dur="2s" begin="0.7s" repeatCount="indefinite" />
                      </line>
                      <line x1="14" y1="34" x2="14" y2="48" stroke="#7DD3FC" strokeWidth="1" opacity="0.3">
                        <animate attributeName="opacity" values="0.1;0.6;0.1" dur="1.4s" begin="0.6s" repeatCount="indefinite" />
                      </line>
                      <line x1="34" y1="34" x2="34" y2="48" stroke="#7DD3FC" strokeWidth="1" opacity="0.3">
                        <animate attributeName="opacity" values="0.1;0.6;0.1" dur="1.4s" begin="0.9s" repeatCount="indefinite" />
                      </line>
                      {/* Data pulses traveling along traces */}
                      <circle r="1.5" fill="#7DD3FC">
                        <animateMotion dur="1.2s" repeatCount="indefinite" path="M0,14 L14,14" />
                        <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                      <circle r="1.5" fill="#34D399">
                        <animateMotion dur="1s" repeatCount="indefinite" path="M48,24 L34,24" begin="0.4s" />
                        <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.4s" repeatCount="indefinite" />
                      </circle>
                      <circle r="1.5" fill="#7DD3FC">
                        <animateMotion dur="1.1s" repeatCount="indefinite" path="M14,48 L14,34" begin="0.7s" />
                        <animate attributeName="opacity" values="0;1;0" dur="1.1s" begin="0.7s" repeatCount="indefinite" />
                      </circle>
                      <circle r="1.5" fill="#34D399">
                        <animateMotion dur="0.9s" repeatCount="indefinite" path="M34,0 L34,14" begin="0.2s" />
                        <animate attributeName="opacity" values="0;1;0" dur="0.9s" begin="0.2s" repeatCount="indefinite" />
                      </circle>
                      {/* Central chip die */}
                      <rect x="14" y="14" width="20" height="20" rx="3" stroke="#7DD3FC" strokeWidth="1.5" fill="rgba(125,211,252,0.08)">
                        <animate attributeName="stroke-opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
                      </rect>
                      {/* Inner core */}
                      <rect x="19" y="19" width="10" height="10" rx="1.5" fill="rgba(125,211,252,0.15)" stroke="#7DD3FC" strokeWidth="0.8">
                        <animate attributeName="fill-opacity" values="0.1;0.4;0.1" dur="1.5s" repeatCount="indefinite" />
                      </rect>
                      {/* Pin dots at chip edges */}
                      {[14, 24, 34].map((y) => [14, 34].map((x) => (
                        <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="#7DD3FC" opacity="0.5">
                          <animate attributeName="opacity" values="0.3;1;0.3" dur={`${1 + Math.random()}s`} repeatCount="indefinite" />
                        </circle>
                      )))}
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Ferramenta de análise da Fairfield</h3>
                  <p className="text-[11px] text-white/30 mb-3">Consulta simultaneamente todas as seguradoras do mercado</p>

                  {/* Console mini */}
                  <div className="rounded-lg bg-navy-dark/60 border border-white/[0.06] p-2.5 mb-3 max-w-[260px] mx-auto">
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400/60" />
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400/60" />
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald/60" />
                      <span className="text-[8px] text-white/15 ml-1.5 font-mono">sentinel-engine v1.0</span>
                    </div>
                    <p className="text-[10px] text-sentinel font-mono min-h-[14px]">{processingText}</p>
                    <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-sentinel to-accent-emerald animate-progress-loop" />
                    </div>
                  </div>

                  {/* Insurer logos — two centered rows */}
                  <div className="space-y-3 max-w-[300px] mx-auto">
                    <div className="flex justify-center items-center gap-4">
                      {seguradoras.slice(0, 4).map((s) => (
                        <img key={s.alt} src={s.src} alt={s.alt} title={s.alt} className={`${s.mini || 'h-5'} w-auto object-contain brightness-0 invert opacity-40 hover:opacity-80 transition-opacity`} />
                      ))}
                    </div>
                    <div className="flex justify-center items-center gap-4">
                      {seguradoras.slice(4).map((s) => (
                        <img key={s.alt} src={s.src} alt={s.alt} title={s.alt} className={`${s.mini || 'h-5'} w-auto object-contain brightness-0 invert opacity-40 hover:opacity-80 transition-opacity`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 3 — Output */}
                <div className="text-center">
                  <div className="w-[72px] h-[72px] rounded-2xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-7 w-7 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Melhor Condição</h3>
                  <p className="text-[11px] text-white/30 mb-3">Resultado otimizado para você</p>
                  <div className="space-y-2 max-w-[220px] mx-auto">
                    <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-left">
                      <span className="text-[9px] text-white/25 block">Comparativo</span>
                      <span className="text-xs font-bold text-accent-emerald">Todas as seguradoras do mercado</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-left">
                      <span className="text-[8px] text-white/25 block">Prazo</span>
                      <span className="text-[11px] font-bold text-white">Instantâneo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <style>{`
              @keyframes flow-scan {
                0% { transform: translateY(0); opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { transform: translateY(100%); opacity: 0; }
              }
              @keyframes travelDot {
                0% { left: -4px; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { left: calc(100% - 4px); opacity: 0; }
              }
              @keyframes linePulse {
                0%, 100% { opacity: 0.1; }
                50% { opacity: 0.6; }
              }
            `}</style>
          </section>

          {/* Compromisso */}
          <section className="card-glass mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-cobre/15 border border-cobre/25 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-cobre" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <p className="text-cobre text-[10px] font-bold uppercase tracking-widest">Fairfield — Consultora Independente</p>
                <h2 className="text-xl sm:text-2xl font-black text-white">Nosso compromisso</h2>
              </div>
            </div>
            <p className="text-white/40 text-base sm:text-lg leading-relaxed mb-6">
              A Fairfield atua como <strong className="text-white/70">consultoria em Seguro de Crédito 100% independente</strong> — não representamos nenhuma seguradora. O <strong className="text-sentinel">SENTINEL</strong> é nossa plataforma proprietária que combina <strong className="text-white/70">inteligência artificial</strong> com décadas de experiência no mercado segurador, garantindo a <strong className="text-cobre">melhor condição do mercado</strong> para a sua empresa <strong className="text-white/70">sem que você tenha que pagar a mais por isso</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CommitCard
                title="Imparcialidade Total"
                text="Analisamos todas as propostas sem conflito de interesse."
                color="sentinel"
              />
              <CommitCard
                title="Análise Técnica Profunda"
                text="Comparamos cobertura, prêmio, franquias e serviços agregados."
                color="cobre"
              />
              <CommitCard
                title="Melhor Custo-Benefício"
                text="Garantimos acesso às melhores condições do mercado."
                color="emerald"
              />
            </div>
          </section>
          {/* Seguradoras parceiras */}
          <section className="mb-8">
            <p className="text-center text-[10px] text-white/30 uppercase tracking-widest font-bold mb-6">Seguradoras parceiras conectadas</p>
            <div className="card-glass px-6 py-8">
              <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
                {seguradoras.map((logo) => (
                  <div key={logo.alt} className={`flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-300 ${logo.size || 'h-10 sm:h-12'}`}>
                    <img src={logo.src} alt={logo.alt} className={`h-full w-auto object-contain ${logo.invert ? 'brightness-0 invert' : ''}`} />
                  </div>
                ))}
              </div>
              <div className="section-divider mt-7" />
              <p className="text-center text-sm text-white/40 mt-5">
                O <span className="text-sentinel font-bold">SENTINEL</span> consulta todas simultaneamente e identifica a <span className="text-cobre font-bold">melhor condição</span>.
              </p>
            </div>
          </section>

          {/* CTA Final */}
          <section className="text-center mb-6">
            <button
              onClick={() => { setStarted(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-sentinel-dark to-sentinel text-navy-dark px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-sentinel/15 hover:shadow-2xl hover:shadow-sentinel/25 hover:scale-[1.02] transition-all duration-300"
            >
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Iniciar Cotação Gratuita
            </button>
            <p className="text-white/15 text-xs mt-3">Sem compromisso · Leva menos de 10 minutos</p>
          </section>
        </div>
      )}

      {/* ==================== ETAPA 2: ESCOLHA DA OPERAÇÃO ==================== */}
      {started && (
        <div className="animate-fadeIn">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-4">
              <MiniShield size={48} />
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Escolha o tipo de operação</h2>
                <p className="text-white/35 text-sm">Selecione o formulário adequado ao seu perfil</p>
              </div>
            </div>
            <button onClick={() => setStarted(false)}
              className="text-xs text-white/30 hover:text-sentinel transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
          </div>
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-sentinel/15 bg-sentinel/[0.04] p-4">
              <p className="text-sm font-bold text-sentinel">Proposta rápida</p>
              <p className="text-xs text-white/40 mt-1">Baseada em IA com propostas locais.</p>
            </div>
            <div className="rounded-xl border border-cobre/15 bg-cobre/[0.04] p-4">
              <p className="text-sm font-bold text-cobre">Proposta completa</p>
              <p className="text-xs text-white/40 mt-1">Direto na seguradora (5 dias).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Card Interno */}
            <Link to="/cotacao/interno" className="group card-glass hover:border-sentinel/30 transition-all duration-300 flex flex-col">
              <div className="rounded-xl bg-gradient-to-br from-sentinel/10 to-transparent p-5 mb-5 flex items-center justify-center">
                <TechBrazilMap />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 group-hover:text-sentinel transition-colors">Crédito Interno</h3>
              <p className="text-base text-cobre font-semibold mb-3">Operações Nacionais (Brasil)</p>
              <p className="text-white/40 text-base flex-1 leading-relaxed">
                Proteção para vendas a prazo no mercado brasileiro. Cobertura contra inadimplência de compradores nacionais.
              </p>
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <ul className="text-sm text-white/30 space-y-1.5">
                  <li>• Valores em Reais (R$)</li>
                  <li>• Até 20 compradores na amostra</li>
                  <li>• Detalhamento de perdas por faixa</li>
                </ul>
              </div>
              <div className="mt-5 btn-primary text-center text-base">
                Iniciar Estudo de Mercado
              </div>
            </Link>

            {/* Card Externo */}
            <Link to="/cotacao/externo" className="group card-glass hover:border-cobre/30 transition-all duration-300 flex flex-col">
              <div className="rounded-xl bg-gradient-to-br from-cobre/10 to-transparent p-5 mb-5 flex items-center justify-center">
                <TechGlobe />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 group-hover:text-cobre transition-colors">Crédito Externo</h3>
              <p className="text-base text-cobre font-semibold mb-3">Operações de Exportação</p>
              <p className="text-white/40 text-base flex-1 leading-relaxed">
                Proteção para vendas internacionais. Cobertura contra inadimplência de importadores estrangeiros.
              </p>
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <ul className="text-sm text-white/30 space-y-1.5">
                  <li>• Valores em Dólares (US$)</li>
                  <li>• Distribuição por continente/país</li>
                  <li>• Até 10 compradores na amostra</li>
                </ul>
              </div>
              <div className="mt-5 btn-accent text-center text-base">
                Iniciar Estudo de Mercado
              </div>
            </Link>
          </div>

          {/* Reforço */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-emerald/10 border border-accent-emerald/20">
              <svg className="w-3.5 h-3.5 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm text-accent-emerald font-medium">100% gratuito e sem compromisso — seus dados são protegidos pela LGPD</span>
            </div>
          </div>

          {/* NDA info */}
          <div className="mt-6 card-glass">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-cobre text-xs font-bold uppercase tracking-widest">Sigilo Garantido</p>
                <h4 className="text-xl font-bold text-white">Compromisso de Confidencialidade</h4>
              </div>
            </div>
            <p className="text-white/35 text-base leading-relaxed mb-4">
              Todas as informações são estritamente confidenciais e protegidas por contrato de sigilo. Seus dados nunca serão compartilhados além do necessário para a cotação.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                "Dados utilizados exclusivamente para estudo de mercado",
                "Sigilo absoluto sobre dados financeiros e comerciais",
                "Nenhuma informação compartilhada sem autorização",
                "Dados pessoais protegidos nos termos da LGPD"
              ].map((t) => (
                <div key={t} className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <svg className="w-3.5 h-3.5 text-accent-emerald flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <p className="text-sm text-white/40 leading-relaxed">{t}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-white/15 text-[10px] mt-4 pt-3 border-t border-white/[0.04]">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Vigencia da proposta: 90 dias · SUSEP 20.2036457.1
            </div>
          </div>
        </div>
      )}

      {/* ═══ Floating Support Chat Button ═══ */}
      <Link
        to="/icover"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl shadow-sentinel/20 hover:shadow-sentinel/40 hover:scale-105 transition-all duration-300 group"
        style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0ea5e9 100%)' }}
      >
        {/* Chat bubble icon */}
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-white text-sm font-semibold leading-tight">Suporte</span>
          <span className="text-emerald-300 text-[10px] font-medium flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Chat ao vivo
          </span>
        </div>
        {/* Online pulse */}
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-navy animate-pulse sm:hidden" />
      </Link>
    </div>
  )
}

/* ─── Sub-components ─── */
function PillarCard({ icon, title, text, color }) {
  const colors = {
    emerald: 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald',
    sentinel: 'bg-sentinel/10 border-sentinel/20 text-sentinel',
    cobre: 'bg-cobre/10 border-cobre/20 text-cobre',
  }
  return (
    <div className="card group hover:border-white/10 transition-all">
      <div className={`h-10 w-10 rounded-xl border flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <h4 className="text-base font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-white/35 leading-relaxed">{text}</p>
    </div>
  )
}

function CommitCard({ title, text, color }) {
  const colors = {
    sentinel: 'border-sentinel/15 hover:border-sentinel/30',
    cobre: 'border-cobre/15 hover:border-cobre/30',
    emerald: 'border-accent-emerald/15 hover:border-accent-emerald/30',
  }
  return (
    <div className={`rounded-xl border bg-white/[0.02] p-5 transition-all ${colors[color]}`}>
      <h4 className="text-base font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-white/35 leading-relaxed">{text}</p>
    </div>
  )
}
