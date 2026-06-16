# Deploy

## Локальная разработка

Запуск приложения:

```bash
npm run dev
```

Приложение будет доступно по адресу:

```text
http://localhost:5173
```

---

## Публикация фронтенда

Собрать и загрузить сайт в Object Storage:

```bash
npm run publish
```

Что происходит:

1. Выполняется `npm run build`
2. Создаётся папка `dist`
3. Файлы загружаются в бакет:

```text
notes-viewer-prod
```

После завершения сайт доступен по адресу:

```text
https://faq.myvista.ru
```

---

## Деплой Cloud Function

Обновление GitHub Proxy Function:

```bash
npm run deploy
```

или

```powershell
.\scripts\deploy.ps1
```

Используется функция:

```text
notes-viewer
```

Переменные окружения:

```text
GITHUB_TOKEN
```

берутся из локального окружения.

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

### Gateway

```text
API Gateway
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

Деплой:

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

Публикация:

```powershell
npm run publish
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
