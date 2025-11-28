
import React from 'react';
import { Card } from '../types';
import { Heart, Diamond, Club, Spade, Ban } from 'lucide-react';

interface CardProps {
  card: Card;
  onClick: () => void;
  disabled?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
  const colorClass = isRed ? 'text-[#FE5F55]' : 'text-[#4A90E2]';
  const suitColorClass = isRed ? 'fill-[#FE5F55]' : 'fill-[#4A90E2]';
  
  const getIcon = (className: string) => {
    switch (card.suit) {
      case 'Hearts': return <Heart className={className} />;
      case 'Diamonds': return <Diamond className={className} />;
      case 'Clubs': return <Club className={className} />;
      case 'Spades': return <Spade className={className} />;
    }
  };

  return (
    <div 
      onClick={!disabled ? onClick : undefined}
      className={`
        relative w-24 h-36 rounded-lg select-none transition-all duration-100 cursor-pointer
        flex flex-col justify-between p-2 shadow-pixel bg-white border-2 border-black
        ${card.isSelected ? '-translate-y-8 border-yellow-400 z-10' : 'hover:-translate-y-2 z-0'}
        ${disabled ? 'opacity-70 cursor-not-allowed bg-gray-200' : ''}
        ${card.isDebuffed ? 'grayscale brightness-75 bg-slate-200' : ''}
        ${colorClass}
      `}
    >
      {/* Debuff Overlay */}
      {card.isDebuffed && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none opacity-80">
            <Ban className="w-16 h-16 text-red-600" />
        </div>
      )}

      {/* Selection Glow */}
      {card.isSelected && (
          <div className="absolute inset-0 bg-yellow-400 opacity-20 animate-pulse pointer-events-none rounded-lg"></div>
      )}

      {/* Top Left */}
      <div className="flex flex-col items-center leading-none">
        <span className="font-bold text-2xl font-mono tracking-tighter">{card.rank}</span>
        {getIcon(`w-5 h-5 ${suitColorClass}`)}
      </div>

      {/* Center Big Icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="transform scale-[2.5]">
            {getIcon(`w-8 h-8 ${suitColorClass} opacity-20`)}
        </div>
      </div>

      {/* Bottom Right (Rotated) */}
      <div className="flex flex-col items-center leading-none transform rotate-180">
        <span className="font-bold text-2xl font-mono tracking-tighter">{card.rank}</span>
        {getIcon(`w-5 h-5 ${suitColorClass}`)}
      </div>

      {/* Chip Value Tag */}
      {!card.isDebuffed && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-black shadow-sm transform rotate-12 z-20">
            +{card.chipValue}
        </div>
      )}
    </div>
  );
};

export default CardComponent;
