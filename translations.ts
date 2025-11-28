
import { HandType, Language, BossType } from './types';
import { BOSS_BLINDS } from './constants';

export const UI_TEXT = {
  score: { en: 'Score', zh: '分数' },
  targetScore: { en: 'Target', zh: '目标' }, 
  ante: { en: 'Ante', zh: '底注' },
  round: { en: 'Round', zh: '回合' },
  hands: { en: 'Hands', zh: '出手' },
  discards: { en: 'Discards', zh: '弃牌' },
  playHand: { en: 'PLAY HAND', zh: '出牌' },
  discard: { en: 'DISCARD', zh: '弃牌' },
  sort: { en: 'Sort', zh: '排序' },
  selectCards: { en: 'Select Cards', zh: '选择卡牌' },
  handScore: { en: 'Hand Score!', zh: '手牌得分！' },
  wonTitle: { en: 'Blind Defeated!', zh: '盲注击败！' },
  wonButton: { en: 'Go to Shop', zh: '前往商店' },
  lostTitle: { en: 'Game Over', zh: '游戏结束' },
  lostDesc: { en: 'You reached Ante', zh: '你到达了底注' },
  lostButton: { en: 'New Run', zh: '重新开始' },
  askJester: { en: 'Ask Jester', zh: '问问弄臣' },
  thinking: { en: 'Thinking...', zh: '思考中...' },
  jesterSays: { en: 'Jester:', zh: '弄臣：' },
  chips: { en: 'Chips', zh: '筹码' },
  mult: { en: 'Mult', zh: '倍率' },
  base: { en: 'Base', zh: '基础' },
  emptySlot: { en: 'Slot', zh: '槽位' },
  shopTitle: { en: 'SHOP', zh: '商店' },
  reroll: { en: 'Reroll', zh: '刷新' },
  nextRound: { en: 'Next Round', zh: '下一回合' },
  buy: { en: 'BUY', zh: '购买' },
  sell: { en: 'SELL', zh: '出售' },
  maxJokers: { en: 'Max Jokers', zh: '小丑牌已满' },
  noMoney: { en: 'Not Enough $', zh: '余额不足' },
  blindSmall: { en: 'Small Blind', zh: '小盲注' },
  blindBig: { en: 'Big Blind', zh: '大盲注' },
  blindBoss: { en: 'Boss Blind', zh: 'BOSS 盲注' },
  interest: { en: 'Interest', zh: '利息' },
  reward: { en: 'Reward', zh: '奖励' },
  bossAbility: { en: 'Ability', zh: '能力' },
  psychicAlert: { en: 'Must play 5 cards!', zh: '必须打出5张牌！' },
};

export const HAND_NAMES: Record<HandType, Record<Language, string>> = {
  'High Card': { en: 'High Card', zh: '高牌' },
  'Pair': { en: 'Pair', zh: '对子' },
  'Two Pair': { en: 'Two Pair', zh: '两对' },
  'Three of a Kind': { en: 'Three of a Kind', zh: '三条' },
  'Straight': { en: 'Straight', zh: '顺子' },
  'Flush': { en: 'Flush', zh: '同花' },
  'Full House': { en: 'Full House', zh: '葫芦' },
  'Four of a Kind': { en: 'Four of a Kind', zh: '四条' },
  'Straight Flush': { en: 'Straight Flush', zh: '同花顺' },
  'Royal Flush': { en: 'Royal Flush', zh: '皇家同花顺' },
};

export const getBossDesc = (type: BossType, lang: Language) => {
    const boss = BOSS_BLINDS.find(b => b.type === type);
    if (!boss) return '';
    return lang === 'zh' ? boss.descZh : boss.descEn;
};

export const getUiText = (key: keyof typeof UI_TEXT, lang: Language) => UI_TEXT[key][lang];
export const getHandName = (type: HandType, lang: Language) => HAND_NAMES[type][lang];
