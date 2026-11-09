"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatDate } from "./format";
import type { Course } from "./types";

const fieldClass =
  "min-h-12 w-full rounded-lg border border-white/30 bg-navy-800 px-3 text-base text-white placeholder:text-white/40 read-only:border-white/15 read-only:text-muted";

/** 예약 신청 창(모달). course 가 있으면 열리고, 없으면 닫힌다. */
export default function ReserveModal({ course, onClose }: { course: Course | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (course && !dialog.open) {
      dialog.showModal();
      // 읽기 전용 칸(강좌·날짜)이 아니라 이름 칸에서 바로 입력을 시작하게 한다
      dialog.querySelector<HTMLInputElement>("input:not([readonly])")?.focus();
    }
    if (!course && dialog.open) dialog.close();
  }, [course]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose} // Esc 키로 닫혀도 상태를 맞춘다
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose(); // 바깥(어두운 부분)을 누르면 닫기
      }}
      aria-labelledby="reserve-title"
      className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-gold/40 bg-navy-700 p-0 text-white shadow-2xl backdrop:bg-black/70"
    >
      {/* key: 강좌가 바뀌면 입력 칸을 새로 시작한다 */}
      {course && <ReserveForm key={course.id} course={course} onClose={onClose} />}
    </dialog>
  );
}

function ReserveForm({ course, onClose }: { course: Course; onClose: () => void }) {
  const left = course.seat - course.booked;
  const uid = useId();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState("1");
  const [phase, setPhase] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase !== "idle") return;
    setError("");

    // 입력 검사: 틀리면 보내지 않고 안내만 보여 준다
    const count = Number(people);
    if (name.trim() === "") {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (!Number.isInteger(count) || count < 1) {
      setError("인원은 1명 이상의 숫자로 입력해 주세요.");
      return;
    }
    if (count > left) {
      setError(`남은 자리는 ${left}석입니다.`);
      return;
    }

    setPhase("saving"); // 버튼이 "저장 중..."으로 바뀐다
    try {
      // 강좌 이름·날짜·결제 금액은 서버가 강좌 데이터로 직접 정한다 (화면이 보낸 값은 믿지 않는다)
      const response = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, name: name.trim(), phone: phone.trim(), people: count }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.ok) {
        setPhase("done");
      } else {
        setError(data?.message ?? "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setPhase("idle");
      }
    } catch {
      setError("서버에 연결하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.");
      setPhase("idle");
    }
  }

  const locked = phase !== "idle";

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 p-6">
      <h2 id="reserve-title" className="text-xl font-bold text-gold">
        예약 신청
      </h2>

      {/* 강좌 이름과 날짜는 카드에서 자동으로 채워진다 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
          <label htmlFor={`${uid}-course`} className="text-sm font-semibold text-muted">
            강좌
          </label>
          <input id={`${uid}-course`} className={fieldClass} value={course.name} readOnly />
        </div>
        <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
          <label htmlFor={`${uid}-date`} className="text-sm font-semibold text-muted">
            날짜
          </label>
          <input id={`${uid}-date`} className={fieldClass} value={formatDate(course.date)} readOnly />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-name`} className="text-sm font-semibold">
          이름
        </label>
        <input
          id={`${uid}-name`}
          className={fieldClass}
          value={name}
          onChange={(event) => setName(event.target.value)}
          readOnly={locked}
          autoComplete="name"
          maxLength={50}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-phone`} className="text-sm font-semibold">
          연락처
        </label>
        <input
          id={`${uid}-phone`}
          className={fieldClass}
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          readOnly={locked}
          placeholder="010-0000-0000"
          autoComplete="tel"
          maxLength={20}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-people`} className="text-sm font-semibold">
          인원 <span className="font-normal text-muted">(남은 자리 {left}석)</span>
        </label>
        <input
          id={`${uid}-people`}
          className={fieldClass}
          type="number"
          inputMode="numeric"
          min={1}
          max={left}
          step={1}
          value={people}
          onChange={(event) => setPeople(event.target.value)}
          readOnly={locked}
        />
      </div>

      {/* 안내 문구 */}
      <div className="min-h-6" aria-live="polite">
        {error && (
          <p role="alert" className="font-bold text-[#ff8a8a]">
            {error}
          </p>
        )}
        {phase === "done" && (
          <p role="status" className="font-bold text-[#6ee7a0]">
            예약 신청이 완료되었습니다
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="submit"
          disabled={locked}
          className="min-h-12 cursor-pointer rounded-xl bg-gold font-extrabold text-navy-900 transition hover:bg-[#f7d078] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-gold"
        >
          {phase === "saving" ? "저장 중..." : "신청"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 cursor-pointer rounded-xl border border-white/40 font-bold text-white transition hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          닫기
        </button>
      </div>
    </form>
  );
}
