'use client'

export default function ConversionInput({
  label,
  value,
  onChange,
  unit,
  onUnitChange,
  units,
  readOnly = false,
  placeholder = '0',
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-text-light">{label}</label>
      
      <div className="flex gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`
            flex-1 px-4 py-3 rounded-xl
            bg-white border-2 border-transparent
            focus:border-primary-brown focus:outline-none
            transition-all duration-200
            text-lg font-medium
            ${readOnly ? 'bg-stone-50 text-text-light cursor-not-allowed' : ''}
          `}
          style={{ minHeight: '44px' }}
          min="0"
          step="any"
        />
        
        <select
          value={unit}
          onChange={(e) => onUnitChange?.(e.target.value)}
          disabled={readOnly}
          className={`
            px-4 py-3 rounded-xl
            bg-white border-2 border-transparent
            focus:border-primary-brown focus:outline-none
            transition-all duration-200
            font-medium cursor-pointer
            ${readOnly ? 'bg-stone-50 text-text-light cursor-not-allowed' : ''}
          `}
          style={{ minHeight: '44px', minWidth: '100px' }}
        >
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
