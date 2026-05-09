import { Map as KakaoMap } from 'react-kakao-maps-sdk';

export default function Map({ center, level = 4, onClick, children }) {
  return (
    <KakaoMap
      center={center}
      level={level}
      style={{ width: '100%', height: '100%' }}
      onClick={onClick}
    >
      {children}
    </KakaoMap>
  );
}
