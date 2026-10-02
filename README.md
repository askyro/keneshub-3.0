# KenesHub 3.0

**Repository**: [github.com/askyro/keneshub-3.0](https://github.com/askyro/keneshub-3.0)

Localized and rebranded KenesHub platform, built with [Next.js](https://nextjs.org).

## 🚀 Важное примечание по развертыванию (Vercel)

Для production задайте переменные `AUTH_SECRET`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` и `GEMINI_API_KEY` в окружении деплоя. SQLite подходит для локальной разработки; для нескольких production-инстансов потребуется PostgreSQL.

## 🛠 Технологии

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Database**: SQLite (Local Dev) / Подготовлено к переходу на Postgres (Neon)
- **Localization**: 100% русский язык

## Что уже работает

- **100% Localization**: Полный перевод всех разделов интерфейса.
- **Rebranding**: Переход от "manus" к "KenesHub" (включая CSS классы).
- **Architecture**: Оптимизированная мобильная версия схемы экосистемы.
- **Сессии и роли**: заёмщик, кредитор, коллектор, юрист и омбудсмен.
- **Дела**: защищённый API списка и создания задолженностей.
- **Переговоры**: реальные диалоги и сообщения в SQLite с проверкой участников.
- **Админка**: статистика и списки пользователей/дел с отдельной сессией.
- **AI**: анализ ситуации и чат через Gemini при наличии ключа.

## Getting Started

```bash
npm install
npm run dev
```

Для production-проверки:

```bash
npm run build
npm run start
```
