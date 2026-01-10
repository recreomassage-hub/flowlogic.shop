# Export Assessment Report - Clarifications

**Дата:** 2025-01-03  
**Статус:** Уточнения

---

## CLARIFICATIONS

### 1. PDF Generation Library
**Вопрос:** Какую библиотеку использовать для генерации PDF на backend?

**Ответ:** 
- **Рекомендация:** `pdfkit` (легковесная, хорошо работает в Lambda)
- **Альтернатива:** `puppeteer` (если нужен HTML-to-PDF, но тяжелее)
- **Решение:** Использовать `pdfkit` для простоты и производительности

### 2. PDF Content for Incomplete Assessments
**Вопрос:** Что показывать в PDF, если assessment еще processing или failed?

**Ответ:**
- **Processing:** Показать "Results are being processed. Please check back later."
- **Failed:** Показать "Assessment failed. Please try again."
- **Invalid:** Показать feedback message (если есть)
- Всегда показывать базовую информацию (test name, date, status)

### 3. User Name in PDF
**Вопрос:** Показывать ли имя пользователя в PDF?

**Ответ:**
- **Да, если доступно:** Использовать `user.name` из user profile
- **Fallback:** Использовать email (без домена для приватности)
- **Если нет:** Пропустить имя, показать только email

### 4. Recommendations Source
**Вопрос:** Откуда брать рекомендации для PDF?

**Ответ:**
- **Текущая реализация:** Рекомендации еще не реализованы (из PRD: AI Plan Generator)
- **Временное решение:** Показывать общие рекомендации на основе problem_areas
- **Будущее:** Когда AI Plan Generator будет реализован, использовать его рекомендации

### 5. PDF Styling
**Вопрос:** Нужен ли брендинг/логотип в PDF?

**Ответ:**
- **MVP:** Текстовый брендинг "Flow Logic" (логотип опционально)
- **Будущее:** Добавить логотип из S3 или assets
- **Цвета:** Использовать brand colors из Tailwind config (primary-600, etc.)

### 6. Error Handling
**Вопрос:** Как обрабатывать ошибки генерации PDF?

**Ответ:**
- **Backend ошибки:** Логировать в CloudWatch, возвращать 500 с user-friendly message
- **Frontend ошибки:** Показать toast/alert с сообщением и кнопкой "Retry"
- **Timeout:** Если генерация > 5 секунд, показать timeout error

### 7. File Download
**Вопрос:** Как реализовать скачивание PDF?

**Ответ:**
- **Backend:** Генерировать PDF в памяти, возвращать как binary response с headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="assessment-{name}-{date}.pdf"`
- **Frontend:** Использовать blob URL для скачивания:
  ```typescript
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  ```

### 8. Assessment Data Access
**Вопрос:** Нужны ли дополнительные данные из API для PDF?

**Ответ:**
- **Текущий API:** `GET /v1/assessments/:id` возвращает все нужные данные
- **Дополнительно:** Может понадобиться user profile для имени (через `/v1/users/me`)
- **Решение:** Использовать существующий assessment endpoint, при необходимости запросить user profile

---

## DECISIONS

1. ✅ Использовать `pdfkit` для генерации PDF
2. ✅ Показывать статус-сообщения для incomplete assessments
3. ✅ Использовать user.name если доступно, иначе email
4. ✅ Показывать общие рекомендации на основе problem_areas (временно)
5. ✅ Текстовый брендинг для MVP (логотип опционально)
6. ✅ Логировать ошибки в CloudWatch, показывать user-friendly messages
7. ✅ Использовать blob URL для скачивания PDF
8. ✅ Использовать существующий assessment API, при необходимости user API

---

## OPEN QUESTIONS

Нет открытых вопросов. Все неясности разрешены.

---

**Следующий шаг: /plan - создать технический план**



