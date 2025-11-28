
import React from 'react';
import { GameState, Joker, Language } from '../types';
import JokerComponent from './JokerComponent';
import { getUiText } from '../translations';
import { RefreshCw, ArrowRight } from 'lucide-react';

interface ShopProps {
  gameState: GameState;
  language: Language;
  onBuyJoker: (joker: Joker) => void;
  onReroll: () => void;
  onNextRound: () => void;
}

const Shop: React.FC<ShopProps> = ({ gameState, language, onBuyJoker, onReroll, onNextRound }) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center bg-[#1a1a1a]/95 text-white animate-in fade-in zoom-in-95 duration-300">
      
      {/* Shop Header */}
      <div className="w-full h-32 bg-[#2c1a1a] border-b-4 border-red-900 flex flex-col items-center justify-center shadow-lg mb-8">
        <h1 className="text-6xl font-bold text-[#FE5F55] tracking-widest text-shadow-fire mb-2">{getUiText('shopTitle', language)}</h1>
        <div className="text-xl text-yellow-400 font-mono bg-black/30 px-4 py-1 rounded border border-yellow-700">
             ${gameState.money}
        </div>
      </div>

      <div className="flex-1 w-full max-w-5xl flex flex-col items-center">
          
          {/* Shop Jokers */}
          <div className="flex gap-8 mb-12 items-start justify-center min-h-[250px]">
             {gameState.shopJokers.length > 0 ? (
                 gameState.shopJokers.map(joker => (
                    <JokerComponent 
                        key={joker.id}
                        joker={joker}
                        language={language}
                        mode="shop"
                        onBuy={onBuyJoker}
                        canAfford={gameState.money >= joker.price}
                    />
                 ))
             ) : (
                 <div className="text-slate-500 italic text-xl mt-12">Sold Out</div>
             )}
          </div>

          {/* Shop Actions */}
          <div className="flex gap-8">
              <button 
                onClick={onReroll}
                disabled={gameState.money < gameState.rerollCost}
                className={`
                    flex flex-col items-center justify-center w-32 h-24 rounded-lg border-4 transition-all
                    ${gameState.money >= gameState.rerollCost 
                        ? 'bg-blue-600 border-blue-800 hover:bg-blue-500 hover:-translate-y-1 shadow-pixel' 
                        : 'bg-slate-700 border-slate-600 opacity-50 cursor-not-allowed'}
                `}
              >
                  <RefreshCw className={`w-8 h-8 mb-1 ${gameState.money >= gameState.rerollCost ? 'animate-spin-slow' : ''}`} />
                  <span className="font-bold text-lg">{getUiText('reroll', language)}</span>
                  <span className="text-yellow-300 text-sm font-mono">${gameState.rerollCost}</span>
              </button>

              <button 
                onClick={onNextRound}
                className="flex flex-col items-center justify-center w-48 h-24 bg-red-600 border-4 border-red-800 rounded-lg hover:bg-red-500 hover:-translate-y-1 shadow-pixel transition-all group"
              >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl uppercase">{getUiText('nextRound', language)}</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
              </button>
          </div>

      </div>

      {/* Your Current Jokers (Mini View) */}
      <div className="w-full bg-[#111] p-4 border-t-2 border-slate-700">
        <div className="max-w-5xl mx-auto">
            <div className="text-xs text-slate-500 uppercase mb-2">{getUiText('maxJokers', language)} ({gameState.jokers.length}/5)</div>
            <div className="flex gap-4">
                {gameState.jokers.map(joker => (
                    <div key={joker.id} className="scale-75 origin-top-left -mr-4">
                        <JokerComponent joker={joker} language={language} mode="display" />
                    </div>
                ))}
            </div>
        </div>
      </div>

    </div>
  );
};

export default Shop;