# Esil OS — Campus Platform MVP

Полное руководство по деплою: Supabase + Render/Railway + Vercel.

---

## Структура репозитория

```
esil-os/
├── backend/    # NestJS API
├── frontend/   # Next.js UI
└── .github/    # CI/CD
```

---

# ПОШАГОВОЕ РУКОВОДСТВО ПО ДЕПЛОЮ

---

## ШАГ 1 — Создать репозиторий на GitHub

1. Зайди на https://github.com → New repository
2. Название: `esil-os`
3. Visibility: **Public** (бесплатный Render работает только с публичными репо)
4. Нажми **Create repository**

Загрузи код:
```bash
cd esil-os
git init
git add .
git commit -m "Initial commit: Esil OS MVP"
git branch -M main
git remote add origin https://github.com/ВАШ_НИКНЕЙМ/esil-os.git
git push -u origin main
```

---

## ШАГ 2 — Настроить Supabase (база данных + auth)

### 2.1 Создать проект

1. Зайди на https://supabase.com → Sign in → New project
2. Заполни:
   - **Name**: `esil-os`
   - **Database Password**: придумай надёжный пароль, **СОХРАНИ ЕГО**
   - **Region**: выбери ближайший (например, Frankfurt)
3. Жди ~2 минуты пока проект создаётся

### 2.2 Получить строки подключения к БД

1. В Supabase → **Project Settings** (шестерёнка) → **Database**
2. Прокрути до **Connection string** → выбери вкладку **URI**
3. Скопируй две строки:

**DATABASE_URL** (через pgBouncer — для Prisma):
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**DIRECT_URL** (прямое подключение — для миграций):
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

> Замени `[password]` на пароль из шага 2.1

### 2.3 Получить API ключи

1. В Supabase → **Project Settings** → **API**
2. Скопируй:
   - **Project URL** → это `SUPABASE_URL`
   - **anon public** key → это `SUPABASE_KEY` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2.4 Включить Google OAuth в Supabase

1. В Supabase → **Authentication** → **Providers** → **Google**
2. Включи переключатель **Enable**
3. Тебе понадобятся Google Client ID и Secret (получи на https://console.cloud.google.com):
   - Создай новый проект → **APIs & Services** → **Credentials** → **Create OAuth Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: добавь `https://[ref].supabase.co/auth/v1/callback`
4. Вставь **Client ID** и **Client Secret** в Supabase → Save

---

## ШАГ 3 — Задеплоить Backend на Render

### 3.1 Создать Web Service

1. Зайди на https://render.com → Sign in (через GitHub)
2. **New** → **Web Service**
3. Подключи репозиторий `esil-os`
4. Настройки сервиса:
   - **Name**: `esil-os-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma migrate deploy`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: Free

### 3.2 Добавить переменные окружения

В Render → **Environment** → добавь все переменные:

| Переменная | Значение |
|---|---|
| `DATABASE_URL` | строка из Supabase (pgBouncer, порт 6543) |
| `DIRECT_URL` | строка из Supabase (прямая, порт 5432) |
| `JWT_SECRET` | любая случайная строка ≥32 символа |
| `SUPABASE_URL` | https://[ref].supabase.co |
| `SUPABASE_KEY` | anon ключ из Supabase |
| `FRONTEND_URL` | https://esil-os.vercel.app (заполни после шага 4) |
| `NODE_ENV` | production |
| `PORT` | 4000 |

### 3.3 Деплой

1. Нажми **Create Web Service**
2. Render автоматически запустит первый деплой
3. Следи за логами — должно появиться `🚀 Backend running on port 4000`
4. **Скопируй URL бэкенда** — он выглядит так: `https://esil-os-backend.onrender.com`

### 3.4 Получить Deploy Hook для GitHub Actions

1. Render → твой сервис → **Settings** → **Deploy Hooks**
2. Нажми **Create Deploy Hook**
3. Скопируй URL

В GitHub репозитории → **Settings** → **Secrets and variables** → **Actions** → **New secret**:
- Name: `RENDER_DEPLOY_HOOK_URL`
- Value: скопированный URL

---

## ШАГ 4 — Задеплоить Frontend на Vercel

### 4.1 Импортировать проект

1. Зайди на https://vercel.com → Sign in (через GitHub)
2. **Add New** → **Project**
3. Выбери репозиторий `esil-os`
4. Настройки:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (определится автоматически)

### 4.2 Добавить переменные окружения

В Vercel → **Environment Variables**:

| Переменная | Значение |
|---|---|
| `NEXT_PUBLIC_API_URL` | https://esil-os-backend.onrender.com |
| `NEXT_PUBLIC_SUPABASE_URL` | https://[ref].supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon ключ из Supabase |

### 4.3 Деплой

1. Нажми **Deploy**
2. Дождись окончания деплоя (~2-3 минуты)
3. Vercel даст тебе URL вида `https://esil-os.vercel.app`

### 4.4 Обновить FRONTEND_URL в Render

1. Вернись в Render → твой сервис → **Environment**
2. Измени `FRONTEND_URL` на `https://esil-os.vercel.app`
3. Render автоматически передеплоит бэкенд

---

## ШАГ 5 — Заполнить базу данных начальными данными

После деплоя бэкенда нужно создать тестовые данные. Открой Swagger:

```
https://esil-os-backend.onrender.com/api/docs
```

### 5.1 Создать группы

POST `/groups`:
```json
{ "name": "ИС-22", "course": 3 }
```
```json
{ "name": "ИС-23", "course": 2 }
```

> Сохрани `id` каждой группы.

### 5.2 Зарегистрировать преподавателя

POST `/auth/register`:
```json
{
  "name": "Иван Петров",
  "email": "teacher@esil.edu",
  "password": "teacher123",
  "role": "TEACHER"
}
```

### 5.3 Зарегистрировать студента

POST `/auth/register`:
```json
{
  "name": "Айгерим Сагинтаева",
  "email": "student@esil.edu",
  "password": "student123",
  "role": "STUDENT"
}
```

---

## ШАГ 6 — Привязать студента к группе вручную (через Supabase)

1. Supabase → **Table Editor** → таблица `User`
2. Найди студента → нажми на строку → измени поле `groupId` на id нужной группы
3. Сохрани

---

## ШАГ 7 — Проверить работу

Открой `https://esil-os.vercel.app` и проверь:

- [ ] Регистрация нового пользователя работает
- [ ] Вход по email/паролю работает
- [ ] Кнопка "Войти через Google" работает
- [ ] Dashboard отображается с правильными данными
- [ ] Преподаватель может создавать занятия в расписании
- [ ] Преподаватель может создавать задания
- [ ] Студент видит задания и может менять статус
- [ ] Преподаватель генерирует код посещаемости
- [ ] Студент вводит код и получает подтверждение
- [ ] Уведомления появляются при создании задания
- [ ] Студент может запросить справку
- [ ] Заглушки (Общежитие, Группы, Чаты) показывают сообщение "в разработке"

---

## Альтернатива Render: Railway

Если хочешь использовать Railway вместо Render:

1. Зайди на https://railway.app → New Project → Deploy from GitHub repo
2. Выбери репозиторий → настрой **Root Directory**: `backend`
3. Railway автоматически определит Node.js
4. В **Variables** добавь те же переменные, что и для Render
5. В **Settings** → **Deploy** → Custom Start Command: `npm run start:prod`
6. Custom Build Command: `npm install && npm run build && npx prisma migrate deploy`

---

## Локальная разработка

### Backend

```bash
cd backend
cp .env.example .env
# Заполни .env реальными значениями из Supabase

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

API доступен на: http://localhost:4000
Swagger: http://localhost:4000/api/docs

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Заполни .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:4000
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

npm install
npm run dev
```

Приложение доступно на: http://localhost:3000

---

## Переменные окружения — итоговый список

### Backend (.env)
```
DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres
JWT_SECRET=super-secret-key-minimum-32-characters
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_KEY=eyJh...
FRONTEND_URL=https://esil-os.vercel.app
NODE_ENV=production
PORT=4000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://esil-os-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

---

## Частые проблемы

**Backend не запускается на Render:**
- Проверь логи деплоя на наличие ошибок Prisma
- Убедись что `DIRECT_URL` (порт 5432) указан — он нужен для `migrate deploy`
- Render free tier засыпает через 15 мин неактивности — первый запрос может занять ~30 сек

**Google OAuth не работает:**
- Проверь что Redirect URI в Google Console содержит `https://[ref].supabase.co/auth/v1/callback`
- В Supabase Auth → URL Configuration → добавь `https://esil-os.vercel.app` в Site URL

**CORS ошибка:**
- Проверь что `FRONTEND_URL` в Render/Railway точно совпадает с URL на Vercel (без слеша в конце)

**Prisma migrate deploy падает:**
- Убедись что обе строки `DATABASE_URL` и `DIRECT_URL` заданы и валидны
- Попробуй запустить `npx prisma db push` вместо `migrate deploy` в build команде
