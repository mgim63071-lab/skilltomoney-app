// 강좌 정보를 모아 둔 파일입니다. 화면 코드는 이 파일을 불러와서 카드를 그립니다.
// 강좌를 더하거나 고칠 때는 이 파일만 고치면 됩니다.
//
//   id      강좌 번호
//   name    강좌 이름
//   price   수강료(원)
//   seat    정원
//   booked  이미 예약한 인원
//   date    강좌 날짜 (년-월-일)
//   tags    카드에 작은 배지로 보여 줄 글자 목록 (개수는 강좌마다 달라도 됩니다)
export const courses = [
  { id: 1, name: "AI 자동화", price: 35000, seat: 8, booked: 8, date: "2026-11-07", tags: ["초보 환영", "2시간"] },
  { id: 2, name: "숏폼 편집", price: 45000, seat: 6, booked: 2, date: "2026-11-14", tags: ["캡컷", "3시간"] },
  { id: 3, name: "엑셀 실무", price: 30000, seat: 10, booked: 7, date: "2026-11-21", tags: ["함수 실습"] },
  { id: 4, name: "스마트스토어", price: 40000, seat: 6, booked: 5, date: "2026-11-28", tags: ["상세페이지", "창업 준비"] },
];
