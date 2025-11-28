
import { GoogleGenAI } from "@google/genai";
import { GameState, Language } from "./types";
import { evaluateHand } from "./utils";
import { HAND_NAMES } from "./translations";

export const getJesterAdvice = async (gameState: GameState, language: Language): Promise<string> => {
  if (!process.env.API_KEY) {
      return language === 'zh' 
        ? "没有 API 密钥，我无法预知未来！（缺少环境变量）" 
        : "I can't see the future without an API Key! (Missing env variable)";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  // Prepare a concise summary of the state
  const handDesc = gameState.hand.map(c => `${c.rank}${c.suit.charAt(0)}`).join(', ');
  const jokersDesc = gameState.jokers.map(j => (language === 'zh' && j.name_zh ? j.name_zh : j.name)).join(', ');
  const bestHandPossible = evaluateHand(gameState.hand.filter(c => c.isSelected));
  const handName = HAND_NAMES[bestHandPossible.type][language];
  
  const promptEn = `
    You are the Jester in a Balatro-like roguelike poker game.
    Analyze the current game state and give brief, witty, strategic advice (max 2 sentences).
    
    Current Round: ${gameState.round}
    Money: $${gameState.money}
    Target Score: ${gameState.targetScore}
    Current Score: ${gameState.score}
    Hands Left: ${gameState.handsLeft}
    Discards Left: ${gameState.discards}
    
    Jokers Active: ${jokersDesc}
    Cards in Hand: ${handDesc}
    
    The user currently has selected cards forming a: ${handName}.
    
    Should they play this? Discard? Look for a specific hand (Flush, Straight)? 
    Be sarcastic but helpful.
  `;

  const promptZh = `
    你是一个类似 Balatro 的肉鸽扑克游戏中的“弄臣”（Jester）。
    分析当前游戏状态，并给出简短、机智且具有战略意义的建议（最多2句话）。
    请用中文回答。
    
    当前回合: ${gameState.round}
    金钱: $${gameState.money}
    目标分数: ${gameState.targetScore}
    当前分数: ${gameState.score}
    剩余出手: ${gameState.handsLeft}
    剩余弃牌: ${gameState.discards}
    
    激活的小丑牌: ${jokersDesc}
    手牌: ${handDesc}
    
    用户当前选中的牌组成了: ${handName}。
    
    他们应该出牌吗？还是弃牌？或者寻找特定的牌型（同花、顺子）？
    语气要有点讽刺，但要乐于助人。
  `;

  const prompt = language === 'zh' ? promptZh : promptEn;

  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return result.text || (language === 'zh' ? "群星沉默..." : "The stars are silent...");
  } catch (error) {
    console.error("Gemini Error:", error);
    return language === 'zh' ? "我的水晶球起雾了（网络错误）。" : "My crystal ball is foggy (Network Error).";
  }
};
