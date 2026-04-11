import { useState } from 'react';
import { DeckOptions } from '@/types/game';

import { ScoringRule } from '@/types/game';

import { HouseRules } from '@/types/game';

interface GameSetupProps {
  onStartGame: (aiPlayerCount: number, deckOptions: DeckOptions, scoringRule: ScoringRule, houseRules: HouseRules) => void;
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const aiOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const [includeWildSwap, setIncludeWildSwap] = useState(false);
  const [includeWildShuffle, setIncludeWildShuffle] = useState(false);
  const [includeWildCustom, setIncludeWildCustom] = useState(false);
  const [scoringRule, setScoringRule] = useState<ScoringRule>('international');
  
  // ハウスルール
  const [allowDrawStacking, setAllowDrawStacking] = useState(false);
  const [allowWild4Anytime, setAllowWild4Anytime] = useState(false);
  const [allowMultipleCards, setAllowMultipleCards] = useState(false);
  const [allowSequentialNumbers, setAllowSequentialNumbers] = useState(false);
  const [forbidActionCardFinish, setForbidActionCardFinish] = useState(false);
  const [lastManStanding, setLastManStanding] = useState(false);

  const getTotalCards = () => {
    let total = 108; // 標準デッキ
    if (includeWildSwap) total += 1;
    if (includeWildShuffle) total += 1;
    if (includeWildCustom) total += 3;
    return total;
  };

  const handleStartGame = (count: number) => {
    onStartGame(count, {
      includeWildSwap,
      includeWildShuffle,
      includeWildCustom
    }, scoringRule, {
      allowDrawStacking,
      allowWild4Anytime,
      allowMultipleCards,
      allowSequentialNumbers,
      forbidActionCardFinish,
      lastManStanding
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl max-w-7xl w-full my-4">
        <h1 className="text-4xl font-bold text-white text-center mb-2">UNO</h1>
        <p className="text-white text-center mb-4 text-sm">ゲーム</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 左列 */}
          <div className="space-y-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-3 text-center">
                得点ルール
              </h2>
              
              <div className="space-y-2">
                <label className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3 cursor-pointer hover:bg-opacity-20 transition-all">
                  <div>
                    <div className="text-white font-semibold text-sm">国際ルール（500点先取）</div>
                    <div className="text-white text-xs opacity-75">敗者全員の残りカードの点数を勝者に加算</div>
                  </div>
                  <input
                    type="radio"
                    name="scoringRule"
                    checked={scoringRule === 'international'}
                    onChange={() => setScoringRule('international')}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3 cursor-pointer hover:bg-opacity-20 transition-all">
                  <div>
                    <div className="text-white font-semibold text-sm">日本ルール（5ラウンド制）</div>
                    <div className="text-white text-xs opacity-75">各敗者の点数を減算して勝者に加算</div>
                  </div>
                  <input
                    type="radio"
                    name="scoringRule"
                    checked={scoringRule === 'japanese'}
                    onChange={() => setScoringRule('japanese')}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-3 text-center">
                デッキ構成（合計: {getTotalCards()}枚）
              </h2>
              
              <div className="space-y-2">
                <label className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3 cursor-pointer hover:bg-opacity-20 transition-all">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">⇄⇄</span>
                    <div>
                      <div className="text-white font-semibold text-sm">とりかえっこワイルド</div>
                      <div className="text-white text-xs opacity-75">相手と手札を全て交換 (+1枚)</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeWildSwap}
                    onChange={(e) => setIncludeWildSwap(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                </label>

                <label className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3 cursor-pointer hover:bg-opacity-20 transition-all">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🔀</span>
                    <div>
                      <div className="text-white font-semibold text-sm">シャッフルワイルド</div>
                      <div className="text-white text-xs opacity-75">全員の手札をシャッフルして再配布 (+1枚)</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeWildShuffle}
                    onChange={(e) => setIncludeWildShuffle(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                </label>

                <label className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3 cursor-pointer hover:bg-opacity-20 transition-all">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">✏️</span>
                    <div>
                      <div className="text-white font-semibold text-sm">白いワイルド</div>
                      <div className="text-white text-xs opacity-75">カスタムルール用 (+3枚)</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeWildCustom}
                    onChange={(e) => setIncludeWildCustom(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                </label>
              </div>
            </div>
          </div>
          
          {/* 中央列 */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h2 className="text-lg font-bold text-white mb-3 text-center">
              ハウスルール（非公式）
            </h2>
            
            <div className="space-y-2">
              <label className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-2 cursor-pointer hover:bg-opacity-20 transition-all">
                <div>
                  <div className="text-white font-semibold text-xs">ドロー累積</div>
                  <div className="text-white text-xs opacity-75">ドロー2/4で回避可能</div>
                </div>
                <input
                  type="checkbox"
                  checked={allowDrawStacking}
                  onChange={(e) => setAllowDrawStacking(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-2 cursor-pointer hover:bg-opacity-20 transition-all">
                <div>
                  <div className="text-white font-semibold text-xs">ワイルド4自由</div>
                  <div className="text-white text-xs opacity-75">いつでも出せる</div>
                </div>
                <input
                  type="checkbox"
                  checked={allowWild4Anytime}
                  onChange={(e) => setAllowWild4Anytime(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-2 cursor-pointer hover:bg-opacity-20 transition-all">
                <div>
                  <div className="text-white font-semibold text-xs">複数枚出し</div>
                  <div className="text-white text-xs opacity-75">同じ数字/記号を一度に</div>
                </div>
                <input
                  type="checkbox"
                  checked={allowMultipleCards}
                  onChange={(e) => setAllowMultipleCards(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-2 cursor-pointer hover:bg-opacity-20 transition-all">
                <div>
                  <div className="text-white font-semibold text-xs">連続数字出し</div>
                  <div className="text-white text-xs opacity-75">連続3つを同時に</div>
                </div>
                <input
                  type="checkbox"
                  checked={allowSequentialNumbers}
                  onChange={(e) => setAllowSequentialNumbers(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-2 cursor-pointer hover:bg-opacity-20 transition-all">
                <div>
                  <div className="text-white font-semibold text-xs">記号上がり禁止</div>
                  <div className="text-white text-xs opacity-75">記号カードで終われない</div>
                </div>
                <input
                  type="checkbox"
                  checked={forbidActionCardFinish}
                  onChange={(e) => setForbidActionCardFinish(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-2 cursor-pointer hover:bg-opacity-20 transition-all">
                <div>
                  <div className="text-white font-semibold text-xs">最後の1人まで</div>
                  <div className="text-white text-xs opacity-75">最下位決定戦</div>
                </div>
                <input
                  type="checkbox"
                  checked={lastManStanding}
                  onChange={(e) => setLastManStanding(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
              </label>
            </div>
          </div>
          
          {/* 右列 */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h2 className="text-lg font-bold text-white mb-4 text-center">
              AIプレイヤー人数を選択
            </h2>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {aiOptions.map(count => (
                <button
                  key={count}
                  onClick={() => handleStartGame(count)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-2 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  <span className="text-xl">{count}</span>
                  <span className="ml-0.5 text-xs">人</span>
                </button>
              ))}
            </div>
            
            <div className="text-white text-xs text-center opacity-75 mt-4">
              <p>あなた + AI {aiOptions[0]}〜{aiOptions[aiOptions.length - 1]}人で対戦</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
