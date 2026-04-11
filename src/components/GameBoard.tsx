'use client';

import { useState, useEffect } from 'react';
import { GameState, CardColor } from '@/types/game';
import { initializeGame, playCard, drawCard, canPlayCard, declareUno, checkUnoViolation, challengeWild4 } from '@/utils/gameLogic';
import { getAIMove } from '@/utils/aiPlayer';
import Card from './Card';
import PlayerHand from './PlayerHand';
import ColorPicker from './ColorPicker';

import { DeckOptions, ScoringRule, HouseRules } from '@/types/game';

interface GameBoardProps {
  aiPlayerCount: number;
  deckOptions: DeckOptions;
  scoringRule: ScoringRule;
  houseRules: HouseRules;
  onBackToSetup: () => void;
}

interface FlyingCard {
  card: any;
  startX: number;
  startY: number;
  playerId: string;
}

export default function GameBoard({ aiPlayerCount, deckOptions, scoringRule, houseRules, onBackToSetup }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [flyingCard, setFlyingCard] = useState<FlyingCard | null>(null);
  const [showUnoButton, setShowUnoButton] = useState(false);

  useEffect(() => {
    setGameState(initializeGame(aiPlayerCount, deckOptions, scoringRule, houseRules));
  }, [aiPlayerCount, deckOptions, scoringRule, houseRules]);

  useEffect(() => {
    if (!gameState) return;
    const player = gameState.players[0];
    setShowUnoButton(player.hand.length === 1 && !gameState.unoDeclarations.has(player.id));
  }, [gameState]);

  useEffect(() => {
    if (!gameState || gameState.gameOver) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (currentPlayer.isAI) {
      const timer = setTimeout(() => {
        if (currentPlayer.hand.length === 1 && !gameState.unoDeclarations.has(currentPlayer.id)) {
          const shouldDeclare = Math.random() < 0.7;
          if (shouldDeclare) {
            const newState = declareUno(gameState, currentPlayer.id);
            setGameState(newState);
            setMessage(`${currentPlayer.name}が「UNO!」と宣言しました`);
            return;
          }
        }
        
        const { cardId, color } = getAIMove(gameState);
        
        if (cardId) {
          const card = currentPlayer.hand.find(c => c.id === cardId);
          if (card) {
            const aiElement = document.getElementById(`ai-player-${currentPlayer.id}`);
            if (aiElement) {
              const rect = aiElement.getBoundingClientRect();
              setFlyingCard({
                card,
                startX: rect.left + rect.width / 2,
                startY: rect.top + rect.height / 2,
                playerId: currentPlayer.id
              });
            }
          }
          
          setMessage(`${currentPlayer.name}がカードを出しました`);
          
          setTimeout(() => {
            const newState = playCard(gameState, currentPlayer.id, cardId, color);
            setGameState(newState);
            setFlyingCard(null);
          }, 600);
        } else {
          setMessage(`${currentPlayer.name}がカードを引きました`);
          const newState = drawCard(gameState, currentPlayer.id);
          newState.currentPlayerIndex = (newState.currentPlayerIndex + newState.direction + newState.players.length) % newState.players.length;
          setGameState(newState);
        }
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setMessage('あなたのターンです');
    }
  }, [gameState]);

  const handleCardClick = (cardId: string) => {
    if (!gameState) return;
    
    const player = gameState.players[0];
    const card = player.hand.find(c => c.id === cardId);
    
    if (!card) return;
    
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (!canPlayCard(card, topCard, gameState.currentColor)) {
      setMessage('このカードは出せません');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    
    const cardElement = document.getElementById(`card-${cardId}`);
    if (cardElement) {
      const rect = cardElement.getBoundingClientRect();
      setFlyingCard({
        card,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        playerId: player.id
      });
    }
    
    if (card.value === 'wild' || card.value === 'wild4' || card.value === 'wildSwap' || card.value === 'wildShuffle' || card.value === 'wildCustom') {
      setPendingCardId(cardId);
      setShowColorPicker(true);
    } else {
      setTimeout(() => {
        const newState = playCard(gameState, player.id, cardId);
        setGameState(newState);
        setMessage('');
        setFlyingCard(null);
      }, 600);
    }
  };

  const handleColorSelect = (color: CardColor) => {
    if (!gameState || !pendingCardId) return;
    
    setShowColorPicker(false);
    
    setTimeout(() => {
      const player = gameState.players[0];
      const newState = playCard(gameState, player.id, pendingCardId, color);
      setGameState(newState);
      setPendingCardId(null);
      setMessage('');
      setFlyingCard(null);
    }, 600);
  };

  const handleDrawCard = () => {
    if (!gameState) return;
    
    const player = gameState.players[0];
    let newState = drawCard(gameState, player.id);
    newState.currentPlayerIndex = (newState.currentPlayerIndex + newState.direction + newState.players.length) % newState.players.length;
    setGameState(newState);
    setMessage('カードを引きました');
  };

  const handleDeclareUno = () => {
    if (!gameState) return;
    const newState = declareUno(gameState, 'player');
    setGameState(newState);
    setMessage('UNO！');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleCheckUnoViolation = (playerId: string) => {
    if (!gameState) return;
    const player = gameState.players.find(p => p.id === playerId);
    if (player && player.hand.length === 1 && !gameState.unoDeclarations.has(playerId)) {
      const newState = checkUnoViolation(gameState, playerId);
      setGameState(newState);
      setMessage(`${player.name}がUNO宣言を忘れました！ペナルティ2枚`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleChallenge = () => {
    if (!gameState || !gameState.challengeAvailable) return;
    
    const { success, newState } = challengeWild4(gameState, 'player');
    setGameState(newState);
    
    if (success) {
      setMessage('チャレンジ成功！相手が4枚引きました');
    } else {
      setMessage('チャレンジ失敗！あなたが6枚引きました');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleNewGame = () => {
    setGameState(initializeGame(aiPlayerCount, deckOptions, scoringRule, houseRules));
    setMessage('');
  };

  if (!gameState) return <div className="text-white text-center">読み込み中...</div>;

  const player = gameState.players[0];
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const isPlayerTurn = gameState.currentPlayerIndex === 0;

  const aiPlayers = gameState.players.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col p-2 sm:p-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={onBackToSetup}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors text-xs sm:text-sm"
        >
          ← 設定
        </button>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">UNO</h1>
          <p className="text-white text-xs opacity-75">
            {gameState.scoringRule === 'international' ? '国際ルール' : '日本ルール'} - R{gameState.roundNumber}
          </p>
        </div>
        <div className="w-16 sm:w-20"></div>
      </div>

      {/* ゲームオーバー */}
      {gameState.gameOver && (
        <div className="bg-yellow-400 text-black p-3 sm:p-4 rounded-lg mb-2 text-center animate-bounce">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">🎉 {gameState.winner} の勝利！ 🎉</h2>
          <div className="text-sm mb-2">
            {gameState.players.map(p => (
              <p key={p.id}>{p.name}: {gameState.scores[p.id]}点</p>
            ))}
          </div>
          <div className="flex gap-2 justify-center">
            <button onClick={handleNewGame} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-blue-700">
              もう一度
            </button>
            <button onClick={onBackToSetup} className="bg-gray-600 text-white px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-gray-700">
              設定
            </button>
          </div>
        </div>
      )}

      {/* AIプレイヤーエリア */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2 mb-2">
        {aiPlayers.map((p, idx) => {
          const hasUnoViolation = p.hand.length === 1 && !gameState.unoDeclarations.has(p.id);
          return (
            <div
              key={p.id}
              id={`ai-player-${p.id}`}
              className={`bg-white bg-opacity-10 p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                gameState.currentPlayerIndex === idx + 1 ? 'ring-2 ring-yellow-400 scale-105' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-white font-bold text-xs sm:text-sm truncate">{p.name}</h3>
                {hasUnoViolation && (
                  <button
                    onClick={() => handleCheckUnoViolation(p.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                  >
                    指摘
                  </button>
                )}
              </div>
              <div className="flex gap-0.5 flex-wrap">
                {p.hand.slice(0, 8).map((_, i) => (
                  <div key={i} className="w-4 sm:w-5">
                    <Card card={{ id: '', color: 'wild', value: 'wild' }} isBack />
                  </div>
                ))}
                {p.hand.length > 8 && (
                  <span className="text-white text-xs">+{p.hand.length - 8}</span>
                )}
              </div>
              <p className="text-white text-xs mt-0.5">{p.hand.length}枚 | {gameState.scores[p.id]}点</p>
            </div>
          );
        })}
      </div>

      {/* 中央エリア（山札・捨て札） */}
      <div className="bg-white bg-opacity-10 p-2 sm:p-4 rounded-lg mb-2">
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <div className="text-center">
            <p className="text-white text-xs sm:text-sm mb-1">山札</p>
            <Card
              card={{ id: '', color: 'wild', value: 'wild' }}
              isBack
              onClick={isPlayerTurn && !gameState.gameOver ? handleDrawCard : undefined}
              disabled={!isPlayerTurn || gameState.gameOver}
            />
            <p className="text-white text-xs mt-1">{gameState.deck.length}枚</p>
          </div>
          
          <div id="discard-pile" className="text-center">
            <p className="text-white text-xs sm:text-sm mb-1">捨て札</p>
            <Card card={topCard} />
            <p className="text-white text-xs mt-1">{gameState.currentColor}</p>
          </div>
        </div>
        
        {message && (
          <p className="text-yellow-300 text-center mt-2 text-sm sm:text-lg font-bold animate-pulse">{message}</p>
        )}
      </div>

      {/* プレイヤー手札エリア */}
      <div className={`bg-white bg-opacity-10 p-2 sm:p-3 rounded-lg flex-1 ${isPlayerTurn && !gameState.gameOver ? 'ring-2 ring-yellow-400' : ''}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white font-bold text-sm sm:text-base">
            あなたの手札 ({player.hand.length}枚) | {gameState.scores['player']}点
          </h3>
          <div className="flex gap-1.5 sm:gap-2">
            {showUnoButton && (
              <button
                onClick={handleDeclareUno}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-bold text-sm animate-pulse"
              >
                UNO!
              </button>
            )}
            {gameState.challengeAvailable && isPlayerTurn && (
              <button
                onClick={handleChallenge}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-bold text-sm"
              >
                チャレンジ
              </button>
            )}
          </div>
        </div>
        <PlayerHand
          cards={player.hand}
          onCardClick={handleCardClick}
          canPlay={(card) => canPlayCard(card, topCard, gameState.currentColor)}
          isCurrentPlayer={isPlayerTurn && !gameState.gameOver}
        />
      </div>

      {showColorPicker && <ColorPicker onColorSelect={handleColorSelect} />}
      
      {flyingCard && (
        <FlyingCardAnimation
          card={flyingCard.card}
          startX={flyingCard.startX}
          startY={flyingCard.startY}
        />
      )}
    </div>
  );
}

function FlyingCardAnimation({ card, startX, startY }: { card: any; startX: number; startY: number }) {
  const discardPile = document.getElementById('discard-pile');
  const endX = discardPile ? discardPile.getBoundingClientRect().left + discardPile.getBoundingClientRect().width / 2 : window.innerWidth / 2;
  const endY = discardPile ? discardPile.getBoundingClientRect().top + discardPile.getBoundingClientRect().height / 2 : window.innerHeight / 2;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-500 ease-in-out"
      style={{
        left: `${startX}px`,
        top: `${startY}px`,
        transform: 'translate(-50%, -50%)',
        animation: `flyToDiscard 0.6s ease-in-out forwards`,
        '--end-x': `${endX - startX}px`,
        '--end-y': `${endY - startY}px`,
      } as any}
    >
      <div className="w-14 h-20 sm:w-20 sm:h-28">
        <Card card={card} />
      </div>
    </div>
  );
}
