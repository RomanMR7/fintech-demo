# Деплой на Vercel

Проект рассчитан на локальное демо с SQLite, но может запускаться на Vercel как презентационная онлайн-версия.

## Переменная окружения

В настройках проекта Vercel добавьте Environment Variable:

```text
DATABASE_URL=file:./dev.db
```

Важно: указывайте именно `file:./dev.db`, а не `file:./prisma/dev.db`. Для Prisma SQLite путь считается относительно папки `prisma`.

## Что происходит во время build

Скрипт `scripts/prepare-vercel-db.ts` автоматически:

- генерирует Prisma Client;
- применяет миграции;
- создает SQLite demo-базу;
- запускает seed-данные;
- включает `prisma/dev.db` в serverless-сборку Next.js.

## Ограничение

SQLite на Vercel подходит только для демо. Для полноценной облачной версии с надежным сохранением изменений лучше заменить SQLite на hosted Postgres, например Neon, Supabase или Vercel Postgres.
