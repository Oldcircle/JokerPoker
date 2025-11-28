
import { HandType, HandScoreBase, Joker, BossType, Blind } from './types';

export const SUITS: any[] = ['Spades', 'Hearts', 'Clubs', 'Diamonds'];
export const RANKS: any[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const HAND_BASE_SCORES: Record<HandType, HandScoreBase> = {
  'High Card': { chips: 5, mult: 1 },
  'Pair': { chips: 10, mult: 2 },
  'Two Pair': { chips: 20, mult: 2 },
  'Three of a Kind': { chips: 30, mult: 3 },
  'Straight': { chips: 30, mult: 4 },
  'Flush': { chips: 35, mult: 4 },
  'Full House': { chips: 40, mult: 4 },
  'Four of a Kind': { chips: 60, mult: 7 },
  'Straight Flush': { chips: 100, mult: 8 },
  'Royal Flush': { chips: 100, mult: 8 },
};

export const ANTE_BASE_SCORES = [300, 800, 2000, 5000, 11000, 20000, 35000, 50000];

export const BOSS_BLINDS: {type: BossType, descEn: string, descZh: string}[] = [
  { type: 'The Wall', descEn: 'Extra large blind', descZh: '超大盲注 (目标分数x2)' },
  { type: 'The Psychic', descEn: 'Must play 5 cards', descZh: '必须打出5张牌' },
  { type: 'The Goad', descEn: 'Spade cards are debuffed', descZh: '黑桃牌被削弱' },
  { type: 'The Club', descEn: 'Club cards are debuffed', descZh: '梅花牌被削弱' },
  { type: 'The Window', descEn: 'Diamond cards are debuffed', descZh: '方块牌被削弱' },
  { type: 'The Head', descEn: 'Heart cards are debuffed', descZh: '红桃牌被削弱' },
];

export const ALL_JOKERS: Joker[] = [
  {
    id: 'joker_joker',
    name: 'Joker',
    name_zh: '小丑',
    description: '+4 Mult',
    description_zh: '+4 倍率',
    rarity: 'Common',
    price: 2,
    trigger: 'play',
    effect: (_, __, ___, lang) => ({ 
      mult: 4, 
      message: lang === 'zh' ? '+4 倍率' : '+4 Mult' 
    })
  },
  {
    id: 'greedy_joker',
    name: 'Greedy Joker',
    name_zh: '贪婪小丑',
    description: 'Played Diamonds give +4 Mult when scored',
    description_zh: '打出的方块牌计分时 +4 倍率',
    rarity: 'Common',
    price: 5,
    trigger: 'play',
    effect: (_, playedHand, __, lang) => {
      // Filter out debuffed cards
      const diamonds = playedHand.filter(c => c.suit === 'Diamonds' && !c.isDebuffed).length;
      if (diamonds > 0) {
        const amount = diamonds * 4;
        return { 
          mult: amount, 
          message: lang === 'zh' ? `+${amount} 倍率` : `+${amount} Mult` 
        };
      }
      return {};
    }
  },
  {
    id: 'lusty_joker',
    name: 'Lusty Joker',
    name_zh: '色欲小丑',
    description: 'Played Hearts give +4 Mult when scored',
    description_zh: '打出的红桃牌计分时 +4 倍率',
    rarity: 'Common',
    price: 5,
    trigger: 'play',
    effect: (_, playedHand, __, lang) => {
      const hearts = playedHand.filter(c => c.suit === 'Hearts' && !c.isDebuffed).length;
      if (hearts > 0) {
        const amount = hearts * 4;
        return { 
          mult: amount, 
          message: lang === 'zh' ? `+${amount} 倍率` : `+${amount} Mult` 
        };
      }
      return {};
    }
  },
  {
    id: 'wrathful_joker',
    name: 'Wrathful Joker',
    name_zh: '暴怒小丑',
    description: 'Played Spades give +4 Mult when scored',
    description_zh: '打出的黑桃牌计分时 +4 倍率',
    rarity: 'Common',
    price: 5,
    trigger: 'play',
    effect: (_, playedHand, __, lang) => {
      const spades = playedHand.filter(c => c.suit === 'Spades' && !c.isDebuffed).length;
      if (spades > 0) {
        const amount = spades * 4;
        return { 
          mult: amount, 
          message: lang === 'zh' ? `+${amount} 倍率` : `+${amount} Mult` 
        };
      }
      return {};
    }
  },
  {
    id: 'gluttonous_joker',
    name: 'Gluttonous Joker',
    name_zh: '暴食小丑',
    description: 'Played Clubs give +4 Mult when scored',
    description_zh: '打出的梅花牌计分时 +4 倍率',
    rarity: 'Common',
    price: 5,
    trigger: 'play',
    effect: (_, playedHand, __, lang) => {
      const clubs = playedHand.filter(c => c.suit === 'Clubs' && !c.isDebuffed).length;
      if (clubs > 0) {
        const amount = clubs * 4;
        return { 
          mult: amount, 
          message: lang === 'zh' ? `+${amount} 倍率` : `+${amount} Mult` 
        };
      }
      return {};
    }
  },
  {
    id: 'droll_joker',
    name: 'Droll Joker',
    name_zh: '滑稽小丑',
    description: '+10 Mult if played hand contains a Flush',
    description_zh: '如果打出的牌包含同花，+10 倍率',
    rarity: 'Uncommon',
    price: 6,
    trigger: 'play',
    effect: (_, __, handType, lang) => {
      const isFlush = handType === 'Flush' || handType === 'Straight Flush' || handType === 'Royal Flush';
      return isFlush 
        ? { mult: 10, message: lang === 'zh' ? '+10 倍率' : '+10 Mult' } 
        : {};
    }
  },
  {
    id: 'banner',
    name: 'Banner',
    name_zh: '横幅',
    description: '+40 Chips for each remaining discard',
    description_zh: '每次剩余弃牌次数提供 +40 筹码',
    rarity: 'Common',
    price: 5,
    trigger: 'play',
    effect: (gameState, _, __, lang) => {
      const amount = gameState.discards * 40;
      return { 
        chips: amount, 
        message: lang === 'zh' ? `+${amount} 筹码` : `+${amount} Chips` 
      };
    }
  },
  {
    id: 'half_joker',
    name: 'Half Joker',
    name_zh: '半个小丑',
    description: '+20 Mult if played hand contains 3 or fewer cards',
    description_zh: '如果打出的手牌少于或等于3张，+20 倍率',
    rarity: 'Common',
    price: 4,
    trigger: 'play',
    effect: (_, playedHand, __, lang) => {
      return playedHand.length <= 3 
        ? { mult: 20, message: lang === 'zh' ? '+20 倍率' : '+20 Mult' }
        : {};
    }
  },
  {
    id: 'the_duo',
    name: 'The Duo',
    name_zh: '二重奏',
    description: 'X2 Mult if played hand contains a Pair',
    description_zh: '如果打出的牌包含对子，X2 倍率',
    rarity: 'Rare',
    price: 8,
    trigger: 'play',
    effect: (_, __, handType, lang) => {
        const pairs = ['Pair', 'Two Pair', 'Full House', 'Four of a Kind'];
        return pairs.includes(handType)
            ? { xMult: 2, message: lang === 'zh' ? 'X2 倍率' : 'X2 Mult' }
            : {};
    }
  },
  {
    id: 'even_steven',
    name: 'Even Steven',
    name_zh: '偶数史蒂文',
    description: 'Played cards with even rank give +4 Mult',
    description_zh: '打出的偶数点数牌提供 +4 倍率',
    rarity: 'Common',
    price: 4,
    trigger: 'play',
    effect: (_, playedHand, __, lang) => {
        const evens = playedHand.filter(c => ['2','4','6','8','10'].includes(c.rank) && !c.isDebuffed).length;
        if (evens > 0) {
            const amount = evens * 4;
            return { mult: amount, message: lang === 'zh' ? `+${amount} 倍率` : `+${amount} Mult` };
        }
        return {};
    }
  },
  {
    id: 'odd_todd',
    name: 'Odd Todd',
    name_zh: '奇数托德',
    description: 'Played cards with odd rank give +30 Chips',
    description_zh: '打出的奇数点数牌提供 +30 筹码',
    rarity: 'Common',
    price: 4,
    trigger: 'play',
    effect: (_, playedHand, __, lang) => {
        const odds = playedHand.filter(c => ['A','3','5','7','9'].includes(c.rank) && !c.isDebuffed).length;
        if (odds > 0) {
            const amount = odds * 30;
            return { chips: amount, message: lang === 'zh' ? `+${amount} 筹码` : `+${amount} Chips` };
        }
        return {};
    }
  },
  {
    id: 'mystic_summit',
    name: 'Mystic Summit',
    name_zh: '神秘之巅',
    description: '+15 Mult when 0 discards remaining',
    description_zh: '当剩余弃牌次数为0时，+15 倍率',
    rarity: 'Common',
    price: 3,
    trigger: 'play',
    effect: (gameState, _, __, lang) => {
        return gameState.discards === 0
            ? { mult: 15, message: lang === 'zh' ? '+15 倍率' : '+15 Mult' }
            : {};
    }
  }
];

export const INITIAL_JOKERS: Joker[] = [
    ALL_JOKERS.find(j => j.id === 'joker_joker')!,
];

export const getCardValue = (rank: string): number => {
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return parseInt(rank);
};

export const getSortValue = (rank: string): number => {
  const map: Record<string, number> = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
  return map[rank];
};
