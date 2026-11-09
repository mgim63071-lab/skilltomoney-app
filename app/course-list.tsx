"use client";

import { useState } from "react";
import { formatDate } from "./format";
import ReserveModal from "./reserve-modal";
import type { Course } from "./types";

export default function CourseList({ courses }: { courses: Course[] }) {
  // 체크 상자 상태: 체크하면 남은 자리가 있는 강좌만 보여 준다
  const [onlyOpen, setOnlyOpen] = useState(false);
  // 예약 신청 창에 보여 줄 강좌 (없으면 창이 닫혀 있다)
  const [selected, setSelected] = useState<Course | null>(null);

  const shown = onlyOpen ? courses.filter((course) => course.seat - course.booked > 0) : courses;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">원데이 강좌 목록</h2>
        <label className="flex min-h-12 w-fit cursor-pointer items-center gap-3 rounded-xl border border-white/25 bg-navy-800 px-4 font-semibold">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(event) => setOnlyOpen(event.target.checked)}
            className="size-5 cursor-pointer accent-gold"
          />
          예약 가능한 강좌만 보기
        </label>
      </div>

      {shown.length === 0 && (
        <p className="rounded-2xl bg-navy-700 p-6 text-center text-muted" role="status">
          지금 예약할 수 있는 강좌가 없습니다.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 강좌 데이터를 하나씩 꺼내 카드를 반복해서 그린다 */}
        {shown.map((course) => {
          const left = course.seat - course.booked; // 남은 좌석 = 정원 - 예약
          const closed = left === 0; // 0이면 마감
          const almostClosed = left >= 1 && left <= 2; // 1~2석이면 마감 임박

          return (
            <li
              key={course.id}
              className="flex flex-col rounded-2xl border border-gold/30 bg-navy-700 p-5 shadow-lg shadow-black/30"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-bold">{course.name}</h3>
                {closed && (
                  <span className="shrink-0 rounded-full bg-gray-500 px-3 py-0.5 text-sm font-bold text-white">
                    마감
                  </span>
                )}
                {almostClosed && (
                  <span className="shrink-0 py-0.5 text-sm font-bold text-[#ff6b6b]">마감 임박</span>
                )}
              </div>

              {/* 태그 배지: 개수가 강좌마다 달라도 반복해서 그린다 */}
              <ul className="mt-2 flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-gold/55 bg-gold/10 px-2.5 py-0.5 text-xs font-bold text-gold"
                  >
                    {tag}
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-sm text-muted">{formatDate(course.date)}</p>
              <p className="mt-1 text-2xl font-extrabold text-gold">{course.price.toLocaleString("ko-KR")}원</p>
              <p className="mt-1 text-sm text-muted">
                남은 좌석 {left}석 / 정원 {course.seat}명
              </p>

              <button
                type="button"
                disabled={closed}
                onClick={() => setSelected(course)}
                className="mt-5 min-h-12 w-full cursor-pointer rounded-xl bg-white font-bold text-navy-900 transition hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-white disabled:hover:bg-gray-500"
              >
                {closed ? "예약 마감" : "예약하기"}
              </button>
            </li>
          );
        })}
      </ul>

      <ReserveModal course={selected} onClose={() => setSelected(null)} />
    </>
  );
}
