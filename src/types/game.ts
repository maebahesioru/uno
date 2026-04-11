export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4' | 'wildSwap' | 'wildShuffle' | 'wildCustom';

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isAI: boolean;
}

export type ScoringRule = 'international' | 'japanese';

export interface DeckOptions {
  includeWildSwap: boolean;
  includeWildShuffle: boolean;
  includeWildCustom: boolean;
}

export interface HouseRules {
  allowDrawStacking: boolean; // ドロー2/ドロー4の累積
  allowWild4Anytime: boolean; // ワイルドドロー4をいつでも出せる
  allowMultipleCards: boolean; // 同じ数字/記号を一度に出せる
  allowSequentialNumbers: boolean; // 連続する数字3つを同時に出せる
  forbidActionCardFinish: boolean; // 記号カードでの上がり禁止
  lastManStanding: boolean; // 最後の1人まで続ける
}

export interface GameOptions {
  deckOptions: DeckOptions;
  scoringRule: ScoringRule;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
  direction: 1 | -1;
  currentColor: CardColor;
  gameOver: boolean;
  winner: string | null;
  unoDeclarations: Set<string>; // プレイヤーIDのセット
  scores: Record<string, number>; // プレイヤーIDごとのスコア
  challengeAvailable: boolean; // チャレンジ可能かどうか
  lastWild4Player: string | null; // 最後にワイルドドロー4を出したプレイヤー
  scoringRule: ScoringRule; // 得点計算ルール
  roundNumber: number; // ラウンド数
  houseRules: HouseRules; // ハウスルール
  finishedPlayers: string[]; // 上がったプレイヤーのID配列
}
