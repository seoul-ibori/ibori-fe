import { useCallback, useState } from 'react';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';

import MyLocationIcon from '@/assets/icons/searchHospital/my_location_icon.svg?react';
import RobotSmallIcon from '@/assets/icons/searchHospital/robot_small_icon.svg?react';
import CongestionDrawer from '@/components/SearchHospital/CongestionDrawer';
import HospitalDetailDrawer from '@/components/SearchHospital/HospitalDetailDrawer';
import LocationPin from '@/components/SearchHospital/LocationPin';
import Map from '@/components/SearchHospital/Map';
import NightButton from '@/components/SearchHospital/NightButton';
import SearchBar from '@/components/SearchHospital/SearchBar';
import SimilarWord from '@/components/SearchHospital/SimilarWord';

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

const SAMPLE_HOSPITALS = [
  {
    id: 1,
    name: '서울시청 부속의원',
    region: '서울시 중구 서소문동',
    type: '상급종합병원',
    phone: '02-2133-1832',
    hours: '오전 10:30 ~ 오후 10:30',
    lat: 37.5675,
    lng: 126.9782,
  },
  {
    id: 2,
    name: '서소문 소아과',
    region: '서울시 중구 서소문동',
    type: '의원',
    phone: '02-1234-5678',
    hours: '오전 09:00 ~ 오후 06:00',
    lat: 37.5658,
    lng: 126.9755,
  },
  {
    id: 3,
    name: '광화문 어린이병원',
    region: '서울시 중구 정동',
    type: '병원',
    phone: '02-2222-3333',
    hours: '오전 09:30 ~ 오후 07:00',
    lat: 37.5662,
    lng: 126.9805,
  },
  {
    id: 4,
    name: '정동 키즈클리닉',
    region: '서울시 중구 정동',
    type: '의원',
    phone: '02-9876-5432',
    hours: '오전 10:00 ~ 오후 09:00',
    lat: 37.5648,
    lng: 126.9795,
  },
];

const SAMPLE_SUGGESTIONS = [
  '서울시 중구 소곡동',
  '서울시 중구 회현동',
  '서울시 중구 명동',
  '서울시 중구 필동',
  '서울시 중구 장충동',
  '서울시 중구 광희동',
  '서울시 성북구 성북동',
];

function getIsDay(date = new Date()) {
  const h = date.getHours();
  return h >= 5 && h < 17;
}

export default function SearchHospital() {
  const [keyword, setKeyword] = useState('');
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerSnap, setDrawerSnap] = useState(0.45);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isDay, setIsDay] = useState(() => getIsDay());

  const toggleDayNight = useCallback(() => {
    setIsDay((prev) => !prev);
  }, []);

  const handleSelectSuggestion = useCallback((word) => {
    setKeyword(word);
    setSearchFocused(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    setSelectedHospital(null);
    setDrawerOpen((prev) => {
      if (!prev) setDrawerSnap(0.45);
      return !prev;
    });
  }, []);

  const closeAllDrawers = useCallback(() => {
    setDrawerOpen(false);
    setSelectedHospital(null);
  }, []);

  const handlePinClick = useCallback((hospital) => {
    setDrawerOpen(false);
    setSelectedHospital(hospital);
  }, []);

  const closeHospitalDrawer = useCallback(() => {
    setSelectedHospital(null);
  }, []);

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 사용할 수 없습니다.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('위치 정보를 가져올 수 없습니다:', error);
        alert('위치 권한을 허용해 주세요.');
      }
    );
  };

  return (
    <div className="relative h-full w-full">
      <Map center={center} level={4}>
        {SAMPLE_HOSPITALS.map((h) => (
          <CustomOverlayMap key={h.id} position={{ lat: h.lat, lng: h.lng }} yAnchor={1}>
            <LocationPin isDay={isDay} onClick={() => handlePinClick(h)} />
          </CustomOverlayMap>
        ))}
      </Map>

      {searchFocused && <div className="absolute inset-0 z-15 bg-white" />}

      <div className="pointer-events-none absolute inset-x-6.25 top-4.5 z-20 flex flex-col gap-3">
        <div
          className="pointer-events-auto flex items-center gap-3 pr-14"
          onClick={closeAllDrawers}
        >
          <SearchBar
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSubmit={() => {}}
            focused={searchFocused}
            onFocusChange={setSearchFocused}
          />
          <NightButton isDay={isDay} onClick={toggleDayNight} />
        </div>
        {!searchFocused && (
          <button
            type="button"
            onClick={toggleDrawer}
            aria-expanded={drawerOpen}
            className={`pointer-events-auto flex items-center gap-1.25 self-start rounded-md px-2.5 py-1.75 shadow-[0_0_8px_rgba(0,0,0,0.15)] transition-colors ${
              drawerOpen ? 'bg-[#e28702]' : 'bg-[#ffc721]'
            }`}
          >
            <RobotSmallIcon className="size-3" />
            <span
              className={`text-[12px] font-semibold transition-colors ${
                drawerOpen ? 'text-[#f5df7a]' : 'text-[#fffcf9]'
              }`}
            >
              우리동네 소아과 혼잡도 예측
            </span>
          </button>
        )}
      </div>

      {searchFocused && (
        <div className="absolute inset-x-0 top-21 bottom-0 z-15 overflow-y-auto pt-3">
          {SAMPLE_SUGGESTIONS.map((word) => (
            <SimilarWord key={word} word={word} onClick={handleSelectSuggestion} />
          ))}
        </div>
      )}

      {!searchFocused && (
        <button
          type="button"
          onClick={handleMyLocation}
          aria-label="현재 위치"
          className="absolute right-6 bottom-8 z-10 flex size-13.75 items-center justify-center rounded-full bg-[#ffc721] shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
        >
          <MyLocationIcon className="size-8.25" />
        </button>
      )}

      <CongestionDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        snap={drawerSnap}
        onSnapChange={setDrawerSnap}
      />

      <HospitalDetailDrawer hospital={selectedHospital} onClose={closeHospitalDrawer} />
    </div>
  );
}
