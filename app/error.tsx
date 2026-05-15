"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card rounded-[2rem] p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-danger">Ошибка демо</p>
      <h1 className="mt-3 font-display text-3xl font-semibold">Что-то пошло не так</h1>
      <p className="mt-3 max-w-2xl text-sm text-graphite/75">{error.message}</p>
      <button
        onClick={reset}
        className="focus-ring mt-6 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-moss"
      >
        Повторить
      </button>
    </div>
  );
}
