# 🃏 Joker Poker (Balatro Lite)

[English](#english) | [中文](#中文)

---

<a name="english"></a>
## 🇬🇧 English

**Joker Poker** is a web-based roguelike deck-building game heavily inspired by the hit game *Balatro*. Play illegal poker hands, discover game-changing Jokers, and trigger adrenaline-pumping combos to beat the Boss Blinds.

This project features a retro CRT aesthetic, a full poker engine, and an AI-powered "Jester" advisor powered by **Google Gemini**.

### ✨ Features

*   **Roguelike Loop:** Progress through Small, Big, and Boss Blinds with increasing difficulty.
*   **Joker System:** Collect over 10 unique Jokers (Common, Uncommon, Rare) that modify your score (Mult/Chips) or gameplay.
*   **Shop & Economy:** Buy new Jokers, sell old ones, reroll the shop, and earn interest on your savings (Max $5 interest per round).
*   **Boss Blinds:** Face challenging bosses like "The Wall" (Huge score target), "The Psychic" (Must play 5 cards), or specific Suit Debuffs.
*   **AI Jester:** Stuck? Ask the AI Jester for strategic advice based on your current hand and game state (Powered by Google Gemini 2.5 Flash).
*   **Visuals:** CRT scanlines, chromatic aberration, pixel-art styling, and dynamic vortex backgrounds.
*   **Bilingual:** Full support for English and Chinese (Simplified).

### 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Tailwind CSS
*   **AI:** Google GenAI SDK (`@google/genai`)
*   **Icons:** Lucide React
*   **Build/Runtime:** ES Modules (via Importmap) / Vite compatible

### 🚀 Getting Started

1.  **Clone the repository.**
2.  **Environment Setup:**
    You need a Google Gemini API Key to use the Jester feature.
    Create a `.env` file or set the environment variable in your runtime:
    ```bash
    API_KEY=your_google_gemini_api_key
    ```
3.  **Run the application:**
    *   If using a standard bundler (Vite/Webpack): `npm install && npm run dev`
    *   If using a browser-based editor: Ensure `index.html` is the entry point.

### 🎮 How to Play

1.  **Select Cards:** Click cards to select up to 5 cards from your hand.
2.  **Play Hand:** Score points based on the poker hand ranking + Card Chips + Joker Multipliers.
3.  **Discard:** Don't like your cards? Discard up to 3 selected cards to draw new ones.
4.  **Beat the Blind:** Reach the target score before you run out of hands.
5.  **The Shop:** After winning a round, spend your money on Jokers to get stronger.
    *   *Tip:* Keep your money above $25 to maximize interest earnings ($5 max).

---

<a name="中文"></a>
## 🇨🇳 中文

**Joker Poker (小丑牌 Lite)** 是一款基于 Web 的肉鸽（Roguelike）卡牌构筑游戏，致敬了热门游戏《Balatro》。你需要打出非法的扑克牌型，发掘能改变局势的小丑牌，通过令人肾上腺素飙升的连击来击败 BOSS 盲注。

本项目拥有复古的 CRT 视觉效果、完整的扑克计分引擎，以及由 **Google Gemini** 驱动的 AI “弄臣” 顾问。

### ✨ 游戏特性

*   **肉鸽循环：** 挑战小盲注、大盲注和 BOSS 盲注，难度逐级递增。
*   **小丑牌系统：** 收集超过 10 种独特的小丑牌（普通、罕见、稀有），它们可以修改倍率（Mult）、筹码（Chips）或游戏规则。
*   **商店与经济：** 购买新小丑、出售旧小丑、刷新商店，并利用存款赚取利息（每回合最多 $5 利息）。
*   **BOSS 盲注：** 对抗具有特殊能力的 BOSS，如“高墙”（超高分目标）、“灵能者”（必须打出5张牌）或特定花色的削弱效果。
*   **AI 弄臣：** 卡关了？根据你当前的手牌和局势，向 AI 弄臣寻求战略建议（由 Google Gemini 2.5 Flash 驱动）。
*   **视觉效果：** CRT 扫描线、色差效果、像素艺术风格和动态漩涡背景。
*   **双语支持：** 完美支持英文和简体中文切换。

### 🛠️ 技术栈

*   **前端：** React 19, TypeScript, Tailwind CSS
*   **人工智能：** Google GenAI SDK (`@google/genai`)
*   **图标库：** Lucide React
*   **构建/运行：** ES Modules (via Importmap) / 兼容 Vite

### 🚀 快速开始

1.  **克隆项目代码。**
2.  **环境设置：**
    你需要一个 Google Gemini API 密钥来使用“问问弄臣”功能。
    创建 `.env` 文件或在你的运行环境中设置变量：
    ```bash
    API_KEY=你的_google_gemini_api_key
    ```
3.  **运行应用：**
    *   如果使用标准打包工具 (Vite/Webpack): `npm install && npm run dev`
    *   如果使用在线编辑器: 确保 `index.html` 是入口文件。

### 🎮 玩法指南

1.  **选择卡牌：** 点击手牌进行选择（最多 5 张）。
2.  **出牌：** 根据扑克牌型等级 + 卡牌筹码 + 小丑牌倍率来获得分数。
3.  **弃牌：** 手牌不好？选择不想保留的牌并点击“弃牌”来抽取新牌（有次数限制）。
4.  **击败盲注：** 在出手次数耗尽前达到目标分数。
5.  **商店购物：** 获胜后进入商店，花费金钱购买小丑牌来增强实力。
    *   *提示：* 尽量保留 $25 以上的存款以获取最大利息收益（$5）。

---

*Project created as a demonstration of React + Gemini API capability.*
