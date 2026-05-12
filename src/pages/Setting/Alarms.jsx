import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { getNotification, patchReadAll } from '@/api/notification';
import AlarmBar from '@/components/Setting/AlarmBar';
import BackButtonIcon from '@/components/common/BackButtonIcon';

export default function Alarms() {
  const navigate = useNavigate();
  const { setIsLoading, showToast } = useOutletContext();
  const [notiData, setNotiData] = useState([]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const res = await getNotification();
        setNotiData(Array.isArray(res) ? res : []);
      } catch (error) {
        console.log('알림 조회 실패', error);
        showToast();
      }
      try {
        await patchReadAll();
      } catch (error) {
        console.log('알림 읽음 처리 실패', error);
        showToast();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="px-6 pt-7 pb-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="p-1">
          <BackButtonIcon color="#1D1B1A" />
        </button>
      </div>

      <div className="px-6 pt-3 pb-3.5">
        <h1 className="text-[18px] font-semibold tracking-[-0.45px] text-[#1D1B1A]">알림</h1>
      </div>

      <div className="h-3.75 w-full bg-[#FAF7F2]" />

      <ul className="flex flex-col">
        {notiData.map((alarm) => (
          <AlarmBar key={alarm.id} message={alarm.message} timeText={alarm.timeAgo} />
        ))}
      </ul>
    </div>
  );
}
