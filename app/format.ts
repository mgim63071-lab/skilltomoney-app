const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// "2026-11-07" → "11월 7일 (토)"
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${m}월 ${d}일 (${WEEKDAYS[new Date(y, m - 1, d).getDay()]})`;
}
