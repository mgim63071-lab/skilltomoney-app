// 강좌 한 개의 정보 (data/courses.js 의 각 강좌와 같은 모양)
export type Course = {
  id: number;
  name: string;
  price: number;
  seat: number; // 정원
  booked: number; // 이미 예약한 인원
  date: string; // 2026-11-07
  tags: string[];
};
