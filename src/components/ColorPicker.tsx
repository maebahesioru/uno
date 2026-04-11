import { CardColor } from '@/types/game';

interface ColorPickerProps {
  onColorSelect: (color: CardColor) => void;
}

export default function ColorPicker({ onColorSelect }: ColorPickerProps) {
  const colors: { color: CardColor; bg: string; name: string }[] = [
    { color: 'red', bg: 'bg-red-600', name: '赤' },
    { color: 'blue', bg: 'bg-blue-600', name: '青' },
    { color: 'green', bg: 'bg-green-600', name: '緑' },
    { color: 'yellow', bg: 'bg-yellow-500', name: '黄' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-8 shadow-2xl animate-scaleIn">
        <h2 className="text-2xl font-bold mb-6 text-center">色を選んでください</h2>
        <div className="grid grid-cols-2 gap-4">
          {colors.map(({ color, bg, name }) => (
            <button
              key={color}
              onClick={() => onColorSelect(color)}
              className={`${bg} text-white font-bold py-6 px-8 rounded-lg hover:opacity-80 hover:scale-110 transition-all text-xl transform`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
