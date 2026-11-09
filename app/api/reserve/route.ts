import { courses } from "../../../data/courses";

// 예약 신청을 받아 구글 시트(.env 의 SHEET_URL)에 한 행으로 저장한다.
// 이 코드는 서버에서만 실행되므로 시트 주소(SHEET_URL)는 브라우저에 보이지 않는다.

function fail(status: number, message: string) {
  return Response.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  const sheetUrl = process.env.SHEET_URL;
  if (!sheetUrl) {
    console.error(
      "[reserve] SHEET_URL 이 없습니다. 내 컴퓨터: .env 파일을 만들고 npm run dev 를 다시 실행 / Vercel: Settings → Environment Variables 에 등록하고 Redeploy",
    );
    return fail(500, "서버 설정이 끝나지 않아 지금은 신청을 받을 수 없습니다.");
  }

  // ── 받은 내용 읽기 (너무 큰 요청은 거절)
  const text = await request.text();
  if (text.length > 4000) return fail(413, "요청이 너무 큽니다.");
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return fail(400, "요청 형식이 올바르지 않습니다.");
  }

  // ── 강좌: 화면이 보낸 이름·날짜·금액이 아니라 강좌 번호로 서버의 강좌 데이터를 찾는다
  const course = courses.find((c) => c.id === body.courseId);
  if (!course) return fail(400, "강좌를 찾을 수 없습니다.");
  const left = course.seat - course.booked;
  if (left <= 0) return fail(409, "마감된 강좌입니다.");

  // ── 입력 검사 (화면의 검사를 우회해서 보내는 요청도 막는다)
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 50) return fail(400, "이름을 1~50자로 입력해 주세요.");

  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (phone.length > 20 || !/^[0-9+\-() ]*$/.test(phone)) {
    return fail(400, "연락처는 숫자와 하이픈(-)으로 입력해 주세요.");
  }

  const people = body.people;
  if (typeof people !== "number" || !Number.isInteger(people) || people < 1) {
    return fail(400, "인원은 1명 이상의 숫자로 입력해 주세요.");
  }
  if (people > left) return fail(409, `남은 자리는 ${left}석입니다.`);

  // ── 결제 금액은 서버가 계산한다: 수강료 × 인원
  const total = course.price * people;
  const row = { date: course.date, course: course.name, name, phone, people, total };

  // ── 구글 시트로 보내기
  try {
    const response = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const answer: unknown = await response.json().catch(() => null);
    const saved = response.ok && typeof answer === "object" && answer !== null && (answer as { result?: unknown }).result === "ok";
    if (!saved) {
      console.error("[reserve] 시트가 저장하지 못했습니다. 상태:", response.status, "응답:", JSON.stringify(answer));
      return fail(502, "예약 내용을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  } catch (error) {
    console.error("[reserve] 시트에 연결하지 못했습니다:", error instanceof Error ? error.name : error);
    return fail(502, "예약 내용을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  return Response.json({ ok: true });
}
