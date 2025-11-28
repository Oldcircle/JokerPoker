
import React from 'react';
import { GameState, Joker, Language } from '../types';
import JokerComponent from './JokerComponent';
import { getUiText } from '../translations';
import { RefreshCw, ArrowRight, TrendingUp } from 'lucide-react';

interface ShopProps {
  gameState: GameState;
  language: Language;
  onBuyJoker: (joker: Joker) => void;
  onSellJoker: (joker: Joker) => void;
  onReroll: () => void;
  onNextRound: () => void;
}

const Shop: React.FC<ShopProps> = ({ gameState, language, onBuyJoker, onSellJoker, onReroll, onNextRound }) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center bg-[#1a1a1a]/95 text-white animate-in fade-in zoom-in-95 duration-300">
      
      {/* Shop Header */}
      <div className="w-full h-32 bg-[#2c1a1a] border-b-4 border-red-900 flex flex-col items-center justify-center shadow-lg mb-8 relative overflow-hidden">
        <h1 className="text-6xl font-bold text-[#FE5F55] tracking-widest text-shadow-fire mb-2 relative z-10">{getUiText('shopTitle', language)}</h1>
        <div className="flex items-center gap-4 relative z-10">
            <div className="text-xl text-yellow-400 font-mono bg-black/50 px-6 py-2 rounded-full border border-yellow-700 shadow-inner flex items-center gap-2">
                <span>${gameState.money}</span>
            </div>
            {gameState.interestEarned > 0 && (
                <div className="text-sm text-green-400 font-bold bg-green-900/50 px-3 py-1 rounded border border-green-700 animate-pulse flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {getUiText('interest', language)} +${gameState.interestEarned}
                </div>
            )}
        </div>
      </div>

      <div className="flex-1 w-full max-w-5xl flex flex-col items-center">
          
          {/* Shop Jokers */}
          <div className="flex gap-8 mb-12 items-start justify-center min-h-[250px] w-full">
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
                 <div className="text-slate-500 italic text-xl mt-12 border-2 border-dashed border-slate-700 rounded-xl p-8">Sold Out</div>
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

      {/* Your Current Jokers (Inventory Mode) */}
      <div className="w-full bg-[#0d0d0d] p-6 border-t-4 border-slate-800 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-4 font-bold flex w-full justify-between border-b border-slate-800 pb-2">
                <span>{getUiText('maxJokers', language)} ({gameState.jokers.length}/5)</span>
                <span className="text-slate-600">Inventory</span>
            </div>
            
            <div className="flex gap-6 min-h-[180px] items-start justify-center w-full bg-[#151515] p-4 rounded-xl border-2 border-slate-800 border-dashed">
                {gameState.jokers.length > 0 ? (
                    gameState.jokers.map(joker => (
                        <div key={joker.id} className="transition-all hover:-translate-y-1">
                            <JokerComponent 
                                joker={joker} 
                                language={language} 
                                mode="inventory" 
                                onSell={onSellJoker}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-slate-600 text-sm uppercase tracking-widest mt-12">No Jokers Owned</div>
                )}
            </div>
        </div>
      </div>

    </div>
  );
};

export default Shop;
