'use client'

const NUTRIENT_INFO = {
  Ca: {
    name: 'Vápník',
    symbol: 'Ca',
    color: 'bg-nutrient-ca',
    hoverColor: 'hover:bg-nutrient-ca/90',
    activeColor: 'ring-nutrient-ca',
  },
  Mg: {
    name: 'Hořčík',
    symbol: 'Mg',
    color: 'bg-nutrient-mg',
    hoverColor: 'hover:bg-nutrient-mg/90',
    activeColor: 'ring-nutrient-mg',
  },
  K: {
    name: 'Draslík',
    symbol: 'K',
    color: 'bg-nutrient-k',
    hoverColor: 'hover:bg-nutrient-k/90',
    activeColor: 'ring-nutrient-k',
  },
  S: {
    name: 'Síra',
    symbol: 'S',
    color: 'bg-nutrient-s',
    hoverColor: 'hover:bg-nutrient-s/90',
    activeColor: 'ring-nutrient-s',
  },
  P: {
    name: 'Fosfor',
    symbol: 'P',
    color: 'bg-nutrient-p',
    hoverColor: 'hover:bg-nutrient-p/90',
    activeColor: 'ring-nutrient-p',
  },
  N: {
    name: 'Dusík',
    symbol: 'N',
    color: 'bg-nutrient-n',
    hoverColor: 'hover:bg-nutrient-n/90',
    activeColor: 'ring-nutrient-n',
  },
}

export default function NutrientButton({ nutrient, isActive, onClick }) {
  const info = NUTRIENT_INFO[nutrient]

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 p-4 rounded-2xl 
        bg-white shadow-warm transition-all duration-300
        hover:shadow-warm-lg hover:scale-105
        ${isActive ? 'scale-105 ring-4 ' + info.activeColor : ''}
        min-w-[100px] touch-manipulation
      `}
      style={{ minHeight: '44px' }}
    >
      <div
        className={`
          w-12 h-12 rounded-xl ${info.color} 
          flex items-center justify-center
          text-white font-bold text-xl
          transition-all duration-300
          ${info.hoverColor}
        `}
      >
        {info.symbol}
      </div>
      <div className="text-sm font-medium text-text-dark">{info.name}</div>
      
      {isActive && (
        <div className={`w-full h-1 rounded-full ${info.color} mt-1`} />
      )}
    </button>
  )
}
