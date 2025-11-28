
export type Suit = 'Spades' | 'Hearts' | 'Clubs' | 'Diamonds';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type Language = 'en' | 'zh';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number; // For sorting/logic (2=2, J=11, A=14)
  chipValue: number; // Base chips provided by card
  isSelected: boolean;
  isDebuffed: boolean; // New: Boss effect
  modifier?: 'Stone' | 'Gold' | 'Steel' | 'Glass'; 
}

export type HandType = 
  | 'High Card' 
  | 'Pair' 
  | 'Two Pair' 
  | 'Three of a Kind' 
  | 'Straight' 
  | 'Flush' 
  | 'Full House' 
  | 'Four of a Kind' 
  | 'Straight Flush'
  | 'Royal Flush';

export interface HandScoreBase {
  chips: number;
  mult: number;
}

export interface Joker {
  id: string;
  name: string;
  name_zh?: string;
  description: string;
  description_zh?: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  price: number;
  trigger: 'play' | 'hold' | 'discard'; 
  effect: (gameState: GameState, playedHand: Card[], handType: HandType, language: Language) => { chips?: number; mult?: number; xMult?: number; message?: string };
}

export type BossType = 'None' | 'The Wall' | 'The Psychic' | 'The Goad' | 'The Club' | 'The Window' | 'The Head';

export interface Blind {
  id: string;
  name: string;
  type: 'Small' | 'Big' | 'Boss';
  bossType: BossType;
  scoreMult: number; // Multiplier against base Ante score
  reward: number;
}

export interface GameState {
  deck: Card[];
  hand: Card[];
  discards: number;
  handsLeft: number;
  money: number;
  score: number;
  targetScore: number;
  round: number;
  ante: number;
  jokers: Joker[];
  shopJokers: Joker[]; 
  rerollCost: number;
  playedHand: Card[] | null;
  lastHandType: HandType | null;
  lastHandScore: number;
  gameState: 'playing' | 'scoring' | 'won' | 'lost' | 'shop';
  
  // New Blind System
  currentBlind: Blind;
  blindsQueue: Blind[]; 
  interestEarned: number; // For UI display in shop
}
