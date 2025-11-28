
import React from 'react';
import { Joker, Language } from '../types';
import { getUiText } from '../translations';

interface JokerProps {
  joker: Joker;
  language: Language;
  mode?: 'display' | 'shop' | 'inventory';
  onBuy?: (joker: Joker) => void;
  onSell?: (joker: Joker) => void;
  canAfford?: boolean;
}

const JokerComponent: React.FC<JokerProps> = ({ joker, language, mode = 'display', onBuy, onSell, canAfford }) => {
  const getRarityColor = (r: string) => {
    switch (r) {
      case 'Common': return 'bg-[#0091E6] border-[#004E80]'; // Blue
      case 'Uncommon': return 'bg-[#4BC292] border-[#206848]'; // Green
      case 'Rare': return 'bg-[#FE5F55] border-[#921B13]'; // Red
      case 'Legendary': return 'bg-[#B266E3] border-[#5D237D]'; // Purple
      default: return 'bg-gray-600 border-gray-800';
    }
  };

  const displayName = language === 'zh' && joker.name_zh ? joker.name_zh : joker.name;
  const displayDesc = language === 'zh' && joker.description_zh ? joker.description_zh : joker.description;

  return (
    <div className="flex flex-col gap-2 items-center">
        <div className={`
          w-28 h-40 rounded-xl border-4 flex flex-col items-center p-1 text-white shadow-lg relative overflow-hidden shrink-0 transition-transform hover:scale-105
          ${getRarityColor(joker.rarity)}
        `}>
           {/* Header Name */}
           <div className="text-center font-bold text-sm leading-tight uppercase border-b-2 border-white/30 w-full pb-1 mb-1 truncate shadow-sm">
             {displayName}
           </div>
           
           {/* Art Placeholder */}
           <div className="flex-1 flex items-center justify-center bg-black/10 w-full rounded my-1 relative">
                {/* Simple Generated Art pattern based on ID */}
                <div className="text-5xl drop-shadow-md animate-pulse">
                    🤡
                </div>
                {/* Rarity Text Background */}
                <div className="absolute top-0 right-0 text-[8px] uppercase font-bold bg-black/40 px-1 rounded-bl">
                    {joker.rarity}
                </div>
           </div>
    
           {/* Description Box */}
           <div className="text-[10px] text-center leading-tight bg-white/90 text-black p-1.5 rounded w-full flex items-center justify-center min-h-[40px] border-2 border-black/10">
             <span className="line-clamp-3 font-semibold">{displayDesc}</span>
           </div>
        </div>

        {/* Action Buttons */}
        {mode === 'shop' && (
            <button 
                onClick={() => onBuy && onBuy(joker)}
                disabled={!canAfford}
                className={`
                    w-full py-1 font-bold text-sm rounded border-2 shadow-pixel transition-all active:translate-y-1
                    ${canAfford 
                        ? 'bg-green-500 hover:bg-green-400 border-green-700 text-white' 
                        : 'bg-gray-500 border-gray-700 text-gray-300 cursor-not-allowed'}
                `}
            >
                {getUiText('buy', language)} ${joker.price}
            </button>
        )}

        {mode === 'inventory' && onSell && (
             <button 
                onClick={() => onSell(joker)}
                className="w-full py-0.5 font-bold text-xs bg-red-500 hover:bg-red-400 border-red-700 text-white rounded border-b-2 shadow-sm active:border-b-0 active:translate-y-px"
            >
                {getUiText('sell', language)} ${Math.floor(joker.price / 2)}
            </button>
        )}
    </div>
  );
};

export default JokerComponent;