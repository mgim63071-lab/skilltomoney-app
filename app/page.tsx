import { courses } from "../data/courses"; // 강좌 정보는 data/courses.js 한 곳에 모아 둔다
import CourseList from "./course-list";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16">
      <header className="py-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gold sm:text-5xl">스킬투머니</h1>
        <p className="mt-2 text-muted">배운 기술이 돈이 되는 원데이 클래스</p>
      </header>

      <CourseList courses={courses} />
    </main>
  );
}
