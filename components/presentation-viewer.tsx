"use client";

import { useMemo, useState } from "react";

type PresentationSlide = {
  number: number;
  title: string;
  imageUrl: string;
};

type PresentationViewerProps = {
  slides: PresentationSlide[];
};

export function PresentationViewer({ slides }: PresentationViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];
  const slideCount = slides.length;

  const progressLabel = useMemo(() => {
    if (!slideCount) {
      return "0 / 0";
    }

    return `${activeIndex + 1} / ${slideCount}`;
  }, [activeIndex, slideCount]);

  if (!activeSlide) {
    return (
      <div className="mt-5 rounded-[var(--radius-xl)] border border-ink/10 bg-white/50 p-6 text-center">
        <p className="text-sm font-semibold text-ink">Презентация пока не загружена</p>
        <p className="copy-sm mt-2">Добавьте слайды в публичную папку проекта, чтобы они отобразились в окне просмотра.</p>
      </div>
    );
  }

  function goToPrevious() {
    setActiveIndex((current) => (current === 0 ? slideCount - 1 : current - 1));
  }

  function goToNext() {
    setActiveIndex((current) => (current === slideCount - 1 ? 0 : current + 1));
  }

  return (
    <div className="mt-5 overflow-hidden rounded-[var(--radius-xl)] border border-ink/10 bg-white/50 shadow-insetSoft">
      <div className="flex flex-col gap-3 border-b border-ink/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Окно просмотра презентации</p>
          <p className="copy-sm mt-1">Листайте слайды прямо внутри проекта, без перехода на другую страницу.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-ink/10 bg-white/55 px-3 py-1 text-xs font-bold text-graphite/72">{progressLabel}</span>
          <button type="button" onClick={goToPrevious} className="btn btn-secondary focus-ring min-h-9 px-3 text-xs" aria-label="Предыдущий слайд">
            Назад
          </button>
          <button type="button" onClick={goToNext} className="btn btn-primary focus-ring min-h-9 px-3 text-xs" aria-label="Следующий слайд">
            Далее
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="rounded-[var(--radius-lg)] border border-ink/10 bg-white/70 p-2">
          <img
            src={activeSlide.imageUrl}
            alt={`${activeSlide.title} презентации Fintech OS`}
            className="aspect-video w-full rounded-[1.05rem] object-contain"
          />
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:max-h-[32rem] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                type="button"
                key={slide.number}
                onClick={() => setActiveIndex(index)}
                className={`focus-ring group min-w-[8.5rem] rounded-[1rem] border p-1.5 text-left transition lg:min-w-0 ${
                  isActive
                    ? "border-jade/35 bg-jade/10 text-ink"
                    : "border-ink/10 bg-white/45 text-graphite/72 hover:border-jade/25 hover:bg-white/70"
                }`}
                aria-current={isActive ? "true" : undefined}
              >
                <img src={slide.imageUrl} alt="" className="aspect-video w-full rounded-[0.75rem] object-cover" loading="lazy" />
                <span className="mt-1.5 block truncate px-1 text-[0.68rem] font-bold uppercase tracking-[0.08em]">
                  Слайд {slide.number}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
