'use client';

import { useState } from 'react';
import GameBoard from '@/components/GameBoard';
import GameSetup from '@/components/GameSetup';
import { DeckOptions, ScoringRule, HouseRules } from '@/types/game';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiPlayerCount, setAiPlayerCount] = useState(3);
  const [deckOptions, setDeckOptions] = useState<DeckOptions>({
    includeWildSwap: false,
    includeWildShuffle: false,
    includeWildCustom: false
  });
  const [scoringRule, setScoringRule] = useState<ScoringRule>('international');
  const [houseRules, setHouseRules] = useState<HouseRules>({
    allowDrawStacking: false,
    allowWild4Anytime: false,
    allowMultipleCards: false,
    allowSequentialNumbers: false,
    forbidActionCardFinish: false,
    lastManStanding: false
  });

  const handleStartGame = (count: number, options: DeckOptions, rule: ScoringRule, rules: HouseRules) => {
    setAiPlayerCount(count);
    setDeckOptions(options);
    setScoringRule(rule);
    setHouseRules(rules);
    setGameStarted(true);
  };

  const handleBackToSetup = () => {
    setGameStarted(false);
  };

  if (!gameStarted) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  return <GameBoard aiPlayerCount={aiPlayerCount} deckOptions={deckOptions} scoringRule={scoringRule} houseRules={houseRules} onBackToSetup={handleBackToSetup} />;
}
