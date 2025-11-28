
import React, { useState, useEffect } from 'react';
import { createDeck, evaluateHand, getScoringCards, getRandomJokers, generateBlinds } from './utils';
import { GameState, Language, Joker, Blind, Card } from './types';
import { INITIAL_JOKERS, HAND_BASE_SCORES, ANTE_BASE_SCORES } from './constants';
import { getUiText, getHandName, getBossDesc } from './translations';
import CardComponent from './components/CardComponent';
import JokerComponent from './components/JokerComponent';
import Shop from './components/Shop';
import { getJesterAdvice } from './geminiService';
import { Play, RotateCcw, BrainCircuit, XCircle, Languages, Swords, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh');

  // Initial State Helpers
  const getInitialBlinds = () => generateBlinds(1);

  // Game State
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    hand: [],
    discards: 3,
    handsLeft: 4,
    money: 4,
    score: 0,
    targetScore: 300,
    round: 1,
    ante: 1,
    jokers: [], 
    shopJokers: [],
    rerollCost: 5,
    playedHand: null,
    lastHandType: null,
    lastHandScore: 0,
    gameState: 'playing',
    // New
    currentBlind: getInitialBlinds()[0],
    blindsQueue: getInitialBlinds(), // Will shift first one out on init
    interestEarned: 0
  });

  const [scoringStep, setScoringStep] = useState<{
    chips: number;
    mult: number;
    total: number;
    message: string;
    triggerId?: string;
  } | null>(null);

  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize Game
  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewGame = () => {
    const fullDeck = createDeck();
    const blinds = generateBlinds(1);
    const firstBlind = blinds[0]; // Small Blind

    // Prepare deck with no debuffs initially
    
    setGameState({
      deck: fullDeck.slice(8),
      hand: fullDeck.slice(0, 8),
      discards: 3,
      handsLeft: 4,
      money: 4,
      score: 0,
      targetScore: Math.floor(ANTE_BASE_SCORES[0] * firstBlind.scoreMult),
      round: 1,
      ante: 1,
      jokers: INITIAL_JOKERS, 
      shopJokers: [],
      rerollCost: 5,
      playedHand: null,
      lastHandType: null,
      lastHandScore: 0,
      gameState: 'playing',
      currentBlind: firstBlind,
      blindsQueue: blinds,
      interestEarned: 0
    });
    setScoringStep(null);
    setAiTip(null);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const toggleCardSelection = (cardId: string) => {
    if (gameState.gameState !== 'playing') return;
    
    setGameState(prev => {
      const isSelected = prev.hand.find(c => c.id === cardId)?.isSelected;
      const selectedCount = prev.hand.filter(c => c.isSelected).length;

      if (!isSelected && selectedCount >= 5) return prev; // Max 5 cards

      return {
        ...prev,
        hand: prev.hand.map(c => c.id === cardId ? { ...c, isSelected: !c.isSelected } : c)
      };
    });
  };

  const discardHand = () => {
    if (gameState.discards <= 0 || gameState.gameState !== 'playing') return;

    const selectedCards = gameState.hand.filter(c => c.isSelected);
    if (selectedCards.length === 0) return;

    setGameState(prev => {
      const remainingHand = prev.hand.filter(c => !c.isSelected);
      const drawCount = 8 - remainingHand.length;
      
      // Reshuffle discard back if empty? (Lite version logic: usually just draw from deck)
      // Balatro doesn't reshuffle discards until deck is empty, but we'll stick to simple deck logic
      const newCards = prev.deck.slice(0, drawCount);
      const remainingDeck = prev.deck.slice(drawCount);

      // Apply Boss Debuffs to new cards if applicable
      const handWithDebuffs = checkDebuffs([...remainingHand, ...newCards], prev.currentBlind.bossType);

      return {
        ...prev,
        deck: remainingDeck,
        hand: handWithDebuffs,
        discards: prev.discards - 1,
      };
    });
  };

  const checkDebuffs = (cards: Card[], bossType: string): Card[] => {
    return cards.map(c => {
        let shouldDebuff = false;
        if (bossType === 'The Goad' && c.suit === 'Spades') shouldDebuff = true;
        if (bossType === 'The Club' && c.suit === 'Clubs') shouldDebuff = true;
        if (bossType === 'The Window' && c.suit === 'Diamonds') shouldDebuff = true;
        if (bossType === 'The Head' && c.suit === 'Hearts') shouldDebuff = true;
        return { ...c, isDebuffed: shouldDebuff };
    });
  }

  const showNotification = (msg: string) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 2000);
  }

  const playHand = async () => {
    const selectedCards = gameState.hand.filter(c => c.isSelected);
    if (selectedCards.length === 0 || gameState.handsLeft <= 0) return;

    // Boss Constraint Check
    if (gameState.currentBlind.bossType === 'The Psychic' && selectedCards.length < 5) {
        showNotification(getUiText('psychicAlert', language));
        return;
    }

    const evaluation = evaluateHand(selectedCards);
    const scoringCards = getScoringCards(selectedCards, evaluation.type);
    
    setGameState(prev => ({ 
      ...prev, 
      gameState: 'scoring', 
      playedHand: selectedCards,
      lastHandType: evaluation.type 
    }));

    // Base Score
    const base = HAND_BASE_SCORES[evaluation.type];
    let currentChips = base.chips;
    let currentMult = base.mult;

    // Card Chips (Debuffed cards give 0)
    scoringCards.forEach(card => {
        if (!card.isDebuffed) {
            currentChips += card.chipValue;
        }
    });

    setScoringStep({
      chips: currentChips,
      mult: currentMult,
      total: currentChips * currentMult,
      message: getHandName(evaluation.type, language)
    });

    await wait(800);

    // Joker Effects
    for (const joker of gameState.jokers) {
      if (joker.trigger === 'play') {
        const effect = joker.effect(gameState, selectedCards, evaluation.type, language);
        if (effect.chips || effect.mult || effect.xMult) {
          
          if (effect.chips) currentChips += effect.chips;
          if (effect.mult) currentMult += effect.mult;
          if (effect.xMult) currentMult *= effect.xMult;

          const localizedName = (language === 'zh' && joker.name_zh) ? joker.name_zh : joker.name;

          setScoringStep({
            chips: currentChips,
            mult: currentMult,
            total: currentChips * currentMult,
            message: `${localizedName}: ${effect.message}`,
            triggerId: joker.id
          });
          
          await wait(800);
        }
      }
    }

    const finalScore = currentChips * currentMult;
    
    setScoringStep({
      chips: currentChips,
      mult: currentMult,
      total: finalScore,
      message: getUiText('handScore', language)
    });
    
    await wait(1200);

    // Resolve
    setGameState(prev => {
        const newScore = prev.score + finalScore;
        const won = newScore >= prev.targetScore;
        const lost = !won && prev.handsLeft - 1 <= 0;

        const remainingHand = prev.hand.filter(c => !c.isSelected);
        const drawCount = 8 - remainingHand.length;
        const newCards = prev.deck.slice(0, drawCount);
        const remainingDeck = prev.deck.slice(drawCount);
        
        // Re-apply debuffs to current hand if boss active
        const handWithDebuffs = checkDebuffs([...remainingHand, ...newCards], prev.currentBlind.bossType);

        let nextState: GameState['gameState'] = 'playing';
        let extraMoney = 0;
        let interest = 0;

        if (won) {
            nextState = 'won'; // Show win screen then manual transition to shop
            extraMoney = prev.handsLeft; // $1 per remaining hand
            extraMoney += prev.currentBlind.reward; // Blind reward
            
            // Interest Calc: $1 for every $5, max $5
            const totalMoneyBeforeInterest = prev.money + extraMoney;
            interest = Math.min(5, Math.floor(totalMoneyBeforeInterest / 5));
        }
        else if (lost) nextState = 'lost';

        return {
            ...prev,
            score: newScore,
            money: won ? prev.money + extraMoney + interest : prev.money, // Add money immediately for simplicity or handle in Shop transition
            interestEarned: interest,
            handsLeft: prev.handsLeft - 1,
            deck: remainingDeck,
            hand: handWithDebuffs,
            gameState: nextState,
            lastHandScore: finalScore,
            playedHand: null,
        };
    });
    
    setScoringStep(null);
  };

  const goToShop = () => {
     setGameState(prev => ({
         ...prev,
         gameState: 'shop',
         shopJokers: getRandomJokers(3),
         rerollCost: 5,
         // Reset score for next round logic
         score: 0
     }));
  };

  const nextRound = () => {
    setGameState(prev => {
        let newAnte = prev.ante;
        let newQueue = [...prev.blindsQueue];
        
        // Shift current blind out
        if (newQueue.length > 0 && newQueue[0].id === prev.currentBlind.id) {
             newQueue.shift();
        }

        // Check if we need new Ante
        if (newQueue.length === 0) {
            newAnte += 1;
            newQueue = generateBlinds(newAnte);
        }

        const nextBlind = newQueue[0];
        const baseScore = ANTE_BASE_SCORES[Math.min(newAnte - 1, ANTE_BASE_SCORES.length - 1)] || 100000 * newAnte;
        const target = Math.floor(baseScore * nextBlind.scoreMult);

        // Prepare new deck
        const fullDeck = createDeck();
        const hand = fullDeck.slice(0, 8);
        const deck = fullDeck.slice(8);
        
        // Apply initial debuffs
        const handWithDebuffs = checkDebuffs(hand, nextBlind.bossType);

        return {
            ...prev,
            deck,
            hand: handWithDebuffs,
            score: 0,
            targetScore: target,
            discards: 3,
            handsLeft: 4,
            round: prev.round + 1,
            ante: newAnte,
            gameState: 'playing',
            currentBlind: nextBlind,
            blindsQueue: newQueue,
            interestEarned: 0 // Reset for next shop visit
        };
    });
    setAiTip(null);
  };

  // Shop Actions
  const buyJoker = (joker: Joker) => {
    if (gameState.money >= joker.price && gameState.jokers.length < 5) {
        setGameState(prev => ({
            ...prev,
            money: prev.money - joker.price,
            jokers: [...prev.jokers, joker],
            shopJokers: prev.shopJokers.filter(j => j.id !== joker.id)
        }));
    }
  };

  const sellJoker = (joker: Joker) => {
      setGameState(prev => ({
          ...prev,
          money: prev.money + Math.floor(joker.price / 2),
          jokers: prev.jokers.filter(j => j.id !== joker.id)
      }));
  };

  const rerollShop = () => {
      if (gameState.money >= gameState.rerollCost) {
          setGameState(prev => ({
              ...prev,
              money: prev.money - prev.rerollCost,
              shopJokers: getRandomJokers(3),
              rerollCost: prev.rerollCost + 1
          }));
      }
  };

  const askJester = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    const advice = await getJesterAdvice(gameState, language);
    setAiTip(advice);
    setIsAiLoading(false);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // --- Render ---

  const getSelectedHandName = () => {
    const selected = gameState.hand.filter(c => c.isSelected);
    if (selected.length === 0) return getUiText('selectCards', language);
    return getHandName(evaluateHand(selected).type, language);
  };

  // Run Info Display (Left Panel)
  const getBlindColor = (type: string) => {
      if (type === 'Boss') return 'bg-red-900 border-red-600 text-red-100';
      if (type === 'Big') return 'bg-yellow-900 border-yellow-600 text-yellow-100';
      return 'bg-blue-900 border-blue-600 text-blue-100';
  };

  return (
    <div className="relative w-full h-screen bg-transparent text-white overflow-hidden flex flex-col font-sans crt select-none">
      
      {/* Dynamic Background */}
      <div className="bg-vortex"></div>
      <div className="bg-vortex-overlay"></div>

      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-8 py-4 rounded-lg shadow-xl font-bold text-2xl animate-bounce border-4 border-red-800">
            {notification}
        </div>
      )}

      {/* SHOP OVERLAY */}
      {gameState.gameState === 'shop' && (
          <Shop 
            gameState={gameState} 
            language={language} 
            onBuyJoker={buyJoker} 
            onReroll={rerollShop} 
            onNextRound={nextRound} 
          />
      )}

      {/* HUD Top */}
      <div className="flex justify-between items-start p-4 bg-[#111]/90 border-b-4 border-slate-700 h-28 z-10 backdrop-blur-sm shadow-xl">
        
        {/* Run Info (Left) */}
        <div className="flex gap-4 items-center">
            <div className="flex flex-col gap-1 w-24">
                <div className="bg-blue-600 text-center rounded py-1 text-xs font-bold uppercase border-b-2 border-blue-800">
                    {getUiText('ante', language)}
                    <div className="text-2xl text-white">{gameState.ante}</div>
                </div>
                <div className="bg-orange-600 text-center rounded py-1 text-xs font-bold uppercase border-b-2 border-orange-800">
                     {getUiText('round', language)}
                     <div className="text-xl text-white">{gameState.round}</div>
                </div>
            </div>

            <div className={`flex flex-col justify-center px-4 py-2 rounded-lg border-2 shadow-inner h-20 w-48 ${getBlindColor(gameState.currentBlind.type)}`}>
                <div className="text-xs uppercase opacity-70 tracking-widest font-bold">
                    {gameState.currentBlind.type === 'Boss' ? getUiText('blindBoss', language) : 
                     gameState.currentBlind.type === 'Big' ? getUiText('blindBig', language) : 
                     getUiText('blindSmall', language)}
                </div>
                <div className="text-xl font-bold leading-tight truncate">
                    {gameState.currentBlind.name === 'Small Blind' ? getUiText('blindSmall', language) :
                     gameState.currentBlind.name === 'Big Blind' ? getUiText('blindBig', language) : 
                     gameState.currentBlind.bossType}
                </div>
                <div className="text-xs font-mono mt-1 opacity-90">
                    {getUiText('score', language)} x{gameState.currentBlind.scoreMult}
                </div>
            </div>
        </div>

        {/* Center Score Board */}
        <div className="flex gap-4 absolute left-1/2 transform -translate-x-1/2 top-4">
             <div className="bg-slate-900 p-2 rounded-xl w-40 border-4 border-slate-600 shadow-2xl flex flex-col items-center">
                <div className="text-xs text-slate-400 uppercase tracking-widest">{getUiText('score', language)}</div>
                <div className="text-3xl font-bold text-white text-shadow-retro tracking-tighter">{gameState.score}</div>
            </div>
            <div className="bg-red-950/90 p-2 rounded-xl w-48 border-4 border-red-700 shadow-2xl relative overflow-hidden flex flex-col items-center">
                <div className="text-xs text-red-300 uppercase tracking-widest relative z-10">{getUiText('targetScore', language)}</div>
                <div className="text-3xl font-bold text-white text-shadow-retro tracking-tighter relative z-10">{gameState.targetScore}</div>
                {/* Progress Bar BG */}
                <div 
                    className="absolute top-0 left-0 bottom-0 bg-red-600/30 z-0 transition-all duration-500"
                    style={{ width: `${Math.min(100, (gameState.score / gameState.targetScore) * 100)}%` }}
                ></div>
            </div>
        </div>

        {/* Right Stats */}
        <div className="flex gap-4 text-right items-start pl-2">
            <div className="flex flex-col gap-1">
                <div className="text-blue-200 font-bold text-lg bg-blue-900/60 px-3 rounded border border-blue-500/50 shadow-sm">{getUiText('hands', language)}: <span className="text-white text-xl">{gameState.handsLeft}</span></div>
                <div className="text-red-200 font-bold text-lg bg-red-900/60 px-3 rounded border border-red-500/50 shadow-sm">{getUiText('discards', language)}: <span className="text-white text-xl">{gameState.discards}</span></div>
            </div>
            <div className="bg-yellow-900/20 p-2 rounded border-2 border-yellow-600 w-24 flex flex-col items-center justify-center backdrop-blur-md">
                <div className="text-xs text-yellow-600 uppercase">Cash</div>
                <div className="text-yellow-400 font-bold text-2xl drop-shadow-sm">${gameState.money}</div>
            </div>
            <button 
                onClick={toggleLanguage}
                className="bg-slate-800 hover:bg-slate-700 p-2 rounded border-2 border-slate-600 text-white transition-colors"
            >
                <Languages className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-0 mt-4">
        
        {/* Boss Badge (Only visible on Boss Blind) */}
        {gameState.currentBlind.type === 'Boss' && (
             <div className="absolute top-0 z-0 flex flex-col items-center animate-pulse opacity-80 pointer-events-none">
                 <ShieldAlert className="w-16 h-16 text-red-600 mb-1" />
                 <div className="bg-red-950 border border-red-500 text-red-200 px-3 py-1 rounded text-sm font-bold shadow-lg text-center max-w-xs">
                     <span className="uppercase block text-xs opacity-70">{getUiText('bossAbility', language)}</span>
                     {getBossDesc(gameState.currentBlind.bossType, language)}
                 </div>
             </div>
        )}

        {/* Scoring Overlay / Animation */}
        {scoringStep && (
            <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-200 backdrop-blur-sm">
                <div className="text-5xl mb-8 font-bold text-white animate-bounce text-shadow-fire">{scoringStep.message}</div>
                <div className="flex items-center gap-6 bg-[#222] p-10 rounded-2xl border-4 border-white shadow-2xl relative overflow-hidden">
                    {/* Fire Effect Background in Box */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent"></div>
                    
                    <div className="bg-[#0091E6] p-6 rounded-xl min-w-[140px] text-center shadow-lg border-b-4 border-[#004E80] relative z-10">
                        <div className="text-xs uppercase mb-1 text-blue-200 font-bold">{getUiText('chips', language)}</div>
                        <div className="text-5xl font-bold tracking-tighter">{Math.floor(scoringStep.chips)}</div>
                    </div>
                    <div className="text-5xl font-black text-slate-500 relative z-10">X</div>
                    <div className="bg-[#FE5F55] p-6 rounded-xl min-w-[140px] text-center shadow-lg border-b-4 border-[#921B13] relative z-10">
                        <div className="text-xs uppercase mb-1 text-red-200 font-bold">{getUiText('mult', language)}</div>
                        <div className="text-5xl font-bold tracking-tighter">{scoringStep.mult.toFixed(1)}</div>
                    </div>
                    <div className="text-5xl font-black text-slate-500 relative z-10">=</div>
                    <div className="text-7xl font-black text-yellow-400 text-shadow-fire relative z-10 animate-pulse">{Math.floor(scoringStep.total)}</div>
                </div>
            </div>
        )}

        {/* Game Over / Win Screens */}
        {gameState.gameState === 'won' && (
             <div className="absolute inset-0 z-40 bg-green-900/95 flex flex-col items-center justify-center animate-in zoom-in-90 duration-300">
                <h2 className="text-8xl font-black mb-4 text-white uppercase italic transform -skew-x-12 text-shadow-pixel">{getUiText('wonTitle', language)}</h2>
                <div className="text-2xl mb-12 font-mono text-green-200">Score Reached!</div>
                <button onClick={goToShop} className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-12 rounded-lg text-3xl shadow-pixel border-b-8 border-yellow-700 active:border-b-0 active:translate-y-2 transition-all">
                    {getUiText('wonButton', language)}
                </button>
             </div>
        )}
        {gameState.gameState === 'lost' && (
             <div className="absolute inset-0 z-40 bg-red-950/95 flex flex-col items-center justify-center animate-in zoom-in-90 duration-300">
                <h2 className="text-8xl font-black mb-8 text-white uppercase italic text-shadow-fire">{getUiText('lostTitle', language)}</h2>
                <div className="text-3xl mb-12 font-mono">{getUiText('lostDesc', language)} <span className="text-red-400 font-bold text-4xl">{gameState.ante}</span></div>
                <button onClick={startNewGame} className="bg-white hover:bg-gray-200 text-black font-black py-4 px-12 rounded-lg text-3xl shadow-pixel border-b-8 border-gray-400 active:border-b-0 active:translate-y-2 transition-all">
                    {getUiText('lostButton', language)}
                </button>
             </div>
        )}

        {/* Joker Zone */}
        <div className="flex gap-4 mb-6 mt-12 items-start min-h-[160px]">
            {gameState.jokers.map(joker => (
                <JokerComponent 
                    key={joker.id} 
                    joker={joker} 
                    language={language} 
                    mode="inventory"
                    onSell={sellJoker}
                />
            ))}
            {/* Empty slots placeholders */}
            {[...Array(5 - gameState.jokers.length)].map((_, i) => (
                <div key={i} className="w-28 h-40 rounded-xl border-2 border-dashed border-white/20 bg-black/20 flex flex-col items-center justify-center text-white/20 text-center text-sm p-2 backdrop-blur-sm">
                    <span className="text-2xl font-bold opacity-50 mb-1">{i + 1 + gameState.jokers.length}</span>
                    <span className="uppercase text-[10px] tracking-widest">{getUiText('emptySlot', language)}</span>
                </div>
            ))}
        </div>
        
        {/* Hand Info Text */}
        <div className="h-10 mb-2 flex items-center gap-3 bg-black/60 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
            <span className="text-slate-300 uppercase tracking-widest text-xs font-bold">{language === 'zh' ? '当前牌型' : 'HAND TYPE'}:</span>
            <span className="font-bold text-2xl text-yellow-400 drop-shadow-md font-mono">{getSelectedHandName()}</span>
            {gameState.gameState === 'playing' && (
                 <div className="ml-4 text-xs bg-slate-800 px-3 py-1 rounded-full text-blue-300 font-mono border border-slate-600">
                    <span className="text-blue-400 font-bold">{HAND_BASE_SCORES[evaluateHand(gameState.hand.filter(c => c.isSelected)).type].chips}</span>
                    <span className="mx-1 text-slate-500">X</span>
                    <span className="text-red-400 font-bold">{HAND_BASE_SCORES[evaluateHand(gameState.hand.filter(c => c.isSelected)).type].mult}</span>
                 </div>
            )}
        </div>

        {/* Card Hand Area */}
        <div className="flex justify-center items-end -space-x-4 h-48 px-4 w-full max-w-6xl pb-4 perspective-1000">
            {gameState.hand.map((card, index) => {
                // Calculate slight rotation for fan effect
                const rotation = (index - (gameState.hand.length - 1) / 2) * 2;
                const offsetY = Math.abs(index - (gameState.hand.length - 1) / 2) * 2;
                
                return (
                    <div 
                        key={card.id} 
                        style={{ transform: `translateY(${offsetY}px) rotate(${rotation}deg)` }}
                        className="transition-transform duration-300"
                    >
                        <CardComponent 
                            card={card} 
                            onClick={() => toggleCardSelection(card.id)} 
                            disabled={gameState.gameState !== 'playing'}
                        />
                    </div>
                );
            })}
        </div>

        {/* Controls */}
        <div className="flex gap-6 mt-4 mb-8">
            <button 
                onClick={playHand}
                disabled={gameState.gameState !== 'playing'}
                className="group relative px-10 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-900 text-white font-black text-xl rounded-xl border-b-8 border-blue-800 hover:border-blue-700 active:border-b-0 active:translate-y-2 transition-all w-56 flex items-center justify-center gap-3 shadow-pixel uppercase tracking-widest"
            >
                <Play className="w-6 h-6 fill-current" />
                {getUiText('playHand', language)}
            </button>
            
            <button 
                onClick={discardHand}
                disabled={gameState.gameState !== 'playing' || gameState.discards <= 0}
                className="group px-8 py-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-900 text-white font-bold text-lg rounded-xl border-b-8 border-red-800 hover:border-red-700 active:border-b-0 active:translate-y-2 transition-all w-48 flex items-center justify-center gap-2 shadow-pixel uppercase tracking-wider"
            >
                <XCircle className="w-5 h-5" />
                {getUiText('discard', language)}
            </button>

            <button
                onClick={() => setGameState(prev => ({...prev, hand: [...prev.hand].sort((a,b) => b.value - a.value)}))}
                className="px-6 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl border-b-8 border-orange-800 active:border-b-0 active:translate-y-2 transition-all shadow-pixel"
                title={getUiText('sort', language)}
            >
                <RotateCcw className="w-6 h-6" />
            </button>
        </div>

        {/* Gemini Jester Tip */}
        <div className="absolute bottom-6 right-6 max-w-xs z-30">
            {aiTip && (
                <div className="bg-[#2a1a3a] border-2 border-purple-500 p-4 rounded-xl text-sm text-purple-200 mb-3 animate-in slide-in-from-bottom-2 fade-in shadow-xl relative">
                    <div className="absolute -bottom-2 right-10 w-4 h-4 bg-[#2a1a3a] border-r-2 border-b-2 border-purple-500 transform rotate-45"></div>
                    
                    <span className="font-bold text-purple-400 uppercase tracking-wider block mb-1">{getUiText('jesterSays', language)}</span> 
                    {aiTip}
                    <button onClick={() => setAiTip(null)} className="absolute top-2 right-2 text-xs opacity-50 hover:opacity-100 hover:bg-purple-800 rounded p-1">✕</button>
                </div>
            )}
            <button 
                onClick={askJester}
                disabled={isAiLoading || gameState.gameState !== 'playing'}
                className="w-full bg-purple-700 hover:bg-purple-600 disabled:bg-slate-800 disabled:border-slate-900 text-white p-3 rounded-lg border-b-4 border-purple-900 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-3 text-sm font-bold shadow-lg transition-all"
            >
                {isAiLoading ? <div className="animate-spin text-xl">🤡</div> : <BrainCircuit className="w-5 h-5" />}
                <span className="uppercase tracking-wider">{isAiLoading ? getUiText('thinking', language) : getUiText('askJester', language)}</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default App;
