import { useCallback, useEffect, useState } from 'react';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';

import { getDistirctSearch } from '@/api/district';
import { getHospital } from '@/api/hospital';
import { postPredictDong } from '@/api/predict';
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
const INITIAL_DONG = '서소문동';
const INITIAL_RADIUS = 1000;
const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

async function fetchDongFromCoords(lat, lng) {
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
      { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } }
    );
    const data = await res.json();
    return data?.documents?.[0]?.address?.region_3depth_name ?? null;
  } catch (error) {
    console.log('역지오코딩 실패', error);
    return null;
  }
}

const WEEKDAY_LABELS = [
  ['mon', '월'],
  ['tue', '화'],
  ['wed', '수'],
  ['thu', '목'],
  ['fri', '금'],
  ['sat', '토'],
  ['sun', '일'],
];

function adaptHospital(h) {
  return {
    ...h,
    region: [h.gu, h.dong].filter(Boolean).join(' '),
    phone: h.tel ?? '',
    hours: h.todayHours ?? '',
    weekly: h.weeklyHours
      ? WEEKDAY_LABELS.map(([key, label]) => ({ day: label, hours: h.weeklyHours[key] }))
      : undefined,
  };
}

function getIsDay(date = new Date()) {
  const h = date.getHours();
  return h >= 5 && h < 17;
}

export default function SearchHospital() {
  const [keyword, setKeyword] = useState('');
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSnap, setDrawerSnap] = useState(0.45);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isDay, setIsDay] = useState(() => getIsDay());
  const [hospitals, setHospitals] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [searchLocation, setSearchLocation] = useState({
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    dong: INITIAL_DONG,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await postPredictDong({ dong: searchLocation.dong });
        if (alive) {
          setPrediction(data);
          setDrawerOpen(true);
        }
      } catch (error) {
        console.log('동 혼잡도 예측 실패', error);
      }
    })();
    return () => {
      alive = false;
    };
  }, [searchLocation]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getHospital({
          lat: searchLocation.lat,
          lng: searchLocation.lng,
          radius: INITIAL_RADIUS,
          nightOnly: !isDay,
        });
        if (alive) setHospitals(Array.isArray(data) ? data.map(adaptHospital) : []);
      } catch (error) {
        console.log('병원 조회 실패', error);
      }
    })();
    return () => {
      alive = false;
    };
  }, [searchLocation, isDay]);

  useEffect(() => {
    if (!searchFocused) return undefined;
    const trimmed = keyword.trim();
    if (!trimmed) return undefined;
    if (selectedDistrict && selectedDistrict.displayName === keyword) return undefined;
    let alive = true;
    const handle = setTimeout(async () => {
      try {
        const data = await getDistirctSearch({ keyword: trimmed });
        if (alive) setSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log('지역 검색 실패', error);
        if (alive) setSuggestions([]);
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [keyword, searchFocused, selectedDistrict]);

  const toggleDayNight = useCallback(() => {
    setIsDay((prev) => !prev);
  }, []);

  const handleKeywordChange = useCallback(
    (e) => {
      const value = e.target.value;
      setKeyword(value);
      if (selectedDistrict && selectedDistrict.displayName !== value) {
        setSelectedDistrict(null);
      }
      if (!value.trim()) {
        setSuggestions([]);
      }
    },
    [selectedDistrict]
  );

  const handleSelectSuggestion = useCallback((suggestion) => {
    setKeyword(suggestion.displayName);
    setSelectedDistrict(suggestion);
    setSuggestions([]);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (!selectedDistrict) return;
    const { dong } = selectedDistrict;
    const lat = selectedDistrict.lat ?? selectedDistrict.latitude;
    const lng = selectedDistrict.lng ?? selectedDistrict.longitude;
    if (lat != null && lng != null) {
      setCenter({ lat, lng });
      setSearchLocation({ lat, lng, dong });
    } else {
      setSearchLocation((prev) => ({ ...prev, dong }));
    }
    setSearchFocused(false);
  }, [selectedDistrict]);

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
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCenter({ lat, lng });
        const dong = await fetchDongFromCoords(lat, lng);
        setSearchLocation((prev) => ({ ...prev, lat, lng, dong: dong ?? prev.dong }));
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
        {hospitals.map((h) => (
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
            onChange={handleKeywordChange}
            onSubmit={handleSearchSubmit}
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
          {suggestions.map((s) => (
            <SimilarWord
              key={`${s.gu}-${s.dong}`}
              word={s.displayName}
              onClick={() => handleSelectSuggestion(s)}
            />
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
        location={
          prediction ? [prediction.gu, prediction.dong].filter(Boolean).join(' ') : undefined
        }
        level={prediction?.congestionLevel}
      />

      <HospitalDetailDrawer hospital={selectedHospital} onClose={closeHospitalDrawer} />
    </div>
  );
}
