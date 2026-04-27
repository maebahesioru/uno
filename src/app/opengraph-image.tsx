import { ImageResponse } from 'next/og';

export const alt = 'UNO ゲーム';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #dc2626 0%, #f59e0b 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
          UNO ゲーム
        </div>
        <div style={{ fontSize: 36, color: '#fef3c7', textAlign: 'center' }}>
          AIと対戦できるUNOゲーム
        </div>
      </div>
    ),
    { ...size }
  );
}
