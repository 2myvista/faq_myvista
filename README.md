# Deploy

## Локальная разработка

Запуск приложения:

```bash
npm run dev
```

Приложение будет доступно по адресу:

```text
http://localhost:6573
```

---

## Полный деплой

Запуск:

```bash
npm run deploy
```

или

```powershell
.\scripts\deploy.ps1
```

### Что делает deploy

1. Проверяет значение `VITE_USE_MOCKS`
2. Если `VITE_USE_MOCKS=true`, запрашивает подтверждение
3. Деплоит Cloud Function `notes-viewer`
4. Деплоит Cloud Function `notes-basic-auth`
5. Обновляет API Gateway `notes-gateway`
6. Выполняет `npm run build`
7. Очищает бакет Object Storage
8. Загружает `index.html`
9. Загружает содержимое папки `assets`

После завершения сайт доступен по адресу:

```text
https://faq.myvista.ru
```

---

## Конфигурация

Используется локальный файл `.env`:

```env
# Frontend
VITE_GITHUB_OWNER=2myvista
VITE_GITHUB_REPO=faq
VITE_API_URL=https://functions.yandexcloud.net/d4edimpv64rdl91o5pd3
VITE_USE_MOCKS=false

# Cloud Function: notes-viewer
GITHUB_TOKEN=github_token

# Cloud Function: notes-basic-auth
BASIC_USER=myvista
BASIC_PASSWORD=password
```

Для репозитория рекомендуется хранить шаблон:

```text
.env.example
```

а реальный `.env` добавить в `.gitignore`.

---

## Инфраструктура

### Frontend

```text
Vue 3
Vite
Pinia
```

### Hosting

```text
Object Storage
Bucket: notes-viewer-prod
```

### Domain

```text
faq.myvista.ru
```

### HTTPS

```text
Certificate Manager
Certificate: faq-myvista
```

### API Gateway

```text
notes-gateway
```

Используется Basic Auth через функцию:

```text
notes-basic-auth
```

---

## Авторизация

Логин и пароль хранятся в переменных окружения функции:

```text
BASIC_USER
BASIC_PASSWORD
```

Функция:

```text
notes-basic-auth
```

---

## Serverless

### Cloud Functions

#### GitHub Proxy

Функция:

```text
notes-viewer
```

Назначение:

```text
GitHub → Cloud Function → Frontend
```

Используется для получения:

* структуры каталогов;
* содержимого markdown-файлов;
* скрытия GitHub Token от браузера.

Переменные окружения:

```text
GITHUB_TOKEN
```

Деплой выполняется общим скриптом:

```powershell
npm run deploy
```

---

#### Basic Auth

Функция:

```text
notes-basic-auth
```

Назначение:

```text
HTTP Basic Authentication
```

Используется API Gateway для проверки логина и пароля перед доступом к сайту.

Переменные окружения:

```text
BASIC_USER
BASIC_PASSWORD
```

Деплой выполняется общим скриптом:

```powershell
npm run deploy
```

---

### API Gateway

Назначение:

```text
faq.myvista.ru
```

Маршрутизация:

```text
Browser
  ↓
API Gateway
  ↓
Basic Auth
  ↓
Object Storage
```

Используемые ресурсы:

```text
Domain: faq.myvista.ru
Certificate: faq-myvista
Bucket: notes-viewer-prod
```

---

### Object Storage

Бакет:

```text
notes-viewer-prod
```

Содержимое:

```text
index.html
assets/
favicon.ico
```

---

### Структура проекта

```text
cloud/
├── notes-basic-auth/
│   └── index.js
├── notes-gateway/
│   └── openapi.yaml
└── notes-viewer/
    └── index.js

scripts/
└── deploy.ps1

.env
.env.example
```

---

### Схема работы

```text
Browser
  ↓
faq.myvista.ru
  ↓
API Gateway
  ↓
notes-basic-auth
  ↓
Object Storage
  ↓
Vue Application
  ↓
notes-viewer
  ↓
GitHub
```

---

## Полезные команды

Проверить CLI:

```bash
yc --version
```

Проверить текущий профиль:

```bash
yc config list
```

Список функций:

```bash
yc serverless function list
```

Список бакетов:

```bash
yc storage bucket list
```

Список API Gateway:

```bash
yc serverless api-gateway list
```
