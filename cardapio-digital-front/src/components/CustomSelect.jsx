import { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ value, onChange, options, placeholder, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value == value); 

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center text-left focus:outline-none transition-all ${className}`}
      >
        <span className={`block truncate ${selectedOption ? 'text-white' : 'text-white/50'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 ml-2 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-shaday-red' : 'text-white/50'}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-[999] w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.8)] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar animate-fade-in">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-white/50">Nenhuma opção disponível</div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange({ target: { value: opt.value } });
                  setIsOpen(false);
                }}
                className={`px-4 py-3 text-sm cursor-pointer transition-colors border-l-2 ${
                  value == opt.value 
                    ? 'bg-shaday-red/10 text-white border-shaday-red font-bold' 
                    : 'text-white/80 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}