
import { Card, Suit, Rank, HandType, Joker, Blind, BossType } from './types';
import { SUITS, RANKS, getCardValue, getSortValue, ALL_JOKERS, ANTE_BASE_SCORES, BOSS_BLINDS } from './constants';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({
        id: `${rank}-${suit}-${Math.random()}`,
        suit: suit as Suit,
        rank: rank as Rank,
        value: getSortValue(rank),
        chipValue: getCardValue(rank),
        isSelected: false,
        isDebuffed: false,
      });
    });
  });
  return shuffle(deck);
};

export const shuffle = (array: Card[]): Card[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const getRandomJokers = (count: number): Joker[] => {
    const shuffled = [...ALL_JOKERS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(j => ({...j, id: j.id + Math.random().toString(36).substr(2, 9)}));
};

export const generateBlinds = (ante: number): Blind[] => {
    const baseScore = ANTE_BASE_SCORES[Math.min(ante - 1, ANTE_BASE_SCORES.length - 1)] || 100000 * ante;
    
    // Pick a random boss
    const randomBoss = BOSS_BLINDS[Math.floor(Math.random() * BOSS_BLINDS.length)];
    const isWall = randomBoss.type === 'The Wall';
    const bossScoreMult = isWall ? 4 : 2;

    const small: Blind = {
        id: `small-${ante}`,
        name: 'Small Blind',
        type: 'Small',
        bossType: 'None',
        scoreMult: 1,
        reward: 3
    };

    const big: Blind = {
        id: `big-${ante}`,
        name: 'Big Blind',
        type: 'Big',
        bossType: 'None',
        scoreMult: 1.5,
        reward: 4
    };

    const boss: Blind = {
        id: `boss-${ante}`,
        name: randomBoss.type, // Name is the boss type (e.g. "The Psychic")
        type: 'Boss',
        bossType: randomBoss.type,
        scoreMult: bossScoreMult,
        reward: 5
    };

    return [small, big, boss];
};

export const evaluateHand = (cards: Card[]): { type: HandType; scoringCards: Card[] } => {
  if (cards.length === 0) return { type: 'High Card', scoringCards: [] };

  const sorted = [...cards].sort((a, b) => a.value - b.value);
  const values = sorted.map(c => c.value);
  const suits = sorted.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]) && cards.length >= 5;
  
  let isStraight = false;
  if (cards.length >= 5) {
      let distinctValues = Array.from(new Set(values));
      if (distinctValues.length >= 5) {
          for(let i=0; i <= distinctValues.length - 5; i++) {
              if (distinctValues[i+4] - distinctValues[i] === 4) {
                  isStraight = true;
                  break;
              }
          }
          if (!isStraight && distinctValues.includes(14) && distinctValues.includes(2) && distinctValues.includes(3) && distinctValues.includes(4) && distinctValues.includes(5)) {
            isStraight = true;
          }
      }
  }

  const counts: Record<string, number> = {};
  values.forEach(v => counts[v] = (counts[v] || 0) + 1);
  const countValues = Object.values(counts).sort((a, b) => b - a);

  if (isFlush && isStraight) {
    const hasAce = values.includes(14);
    const hasKing = values.includes(13);
    if (hasAce && hasKing) return { type: 'Royal Flush', scoringCards: cards };
    return { type: 'Straight Flush', scoringCards: cards };
  }

  if (countValues[0] === 4) return { type: 'Four of a Kind', scoringCards: cards };
  if (countValues[0] === 3 && countValues[1] >= 2) return { type: 'Full House', scoringCards: cards };
  if (isFlush) return { type: 'Flush', scoringCards: cards };
  if (isStraight) return { type: 'Straight', scoringCards: cards };
  if (countValues[0] === 3) return { type: 'Three of a Kind', scoringCards: cards };
  if (countValues[0] === 2 && countValues[1] === 2) return { type: 'Two Pair', scoringCards: cards };
  if (countValues[0] === 2) return { type: 'Pair', scoringCards: cards };

  return { type: 'High Card', scoringCards: [sorted[sorted.length - 1]] };
};

export const getScoringCards = (cards: Card[], type: HandType): Card[] => {
    const sorted = [...cards].sort((a, b) => b.value - a.value); 
    const counts: Record<string, Card[]> = {};
    sorted.forEach(c => {
        if (!counts[c.value]) counts[c.value] = [];
        counts[c.value].push(c);
    });

    switch (type) {
        case 'Four of a Kind': return Object.values(counts).find(arr => arr.length === 4) || [];
        case 'Full House':
            const three = Object.values(counts).find(arr => arr.length === 3) || [];
            const two = Object.values(counts).find(arr => arr.length >= 2 && arr !== three) || [];
            return [...three, ...two.slice(0, 2)];
        case 'Three of a Kind': return Object.values(counts).find(arr => arr.length === 3) || [];
        case 'Two Pair':
            const pairs = Object.values(counts).filter(arr => arr.length >= 2).slice(0, 2);
            return pairs.flat().slice(0, 4);
        case 'Pair': return Object.values(counts).find(arr => arr.length >= 2)?.slice(0,2) || [];
        case 'High Card': return [sorted[0]];
        default: return cards;
    }
}
