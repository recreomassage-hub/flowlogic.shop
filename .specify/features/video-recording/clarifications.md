# Video Recording for Assessments - Clarifications

**Дата:** 2026-01-06  
**Статус:** Уточнения завершены

---

## CLARIFICATIONS

### 1. Audio Recording Support
**Вопрос:** Should we support audio recording?

**Ответ:** 
- **НЕТ** - Только видео, без аудио
- **Обоснование:** MediaPipe анализирует только движение (pose estimation), аудио не требуется
- **Реализация:** Запрашивать только video permission в `getUserMedia({ video: true })`
- **Будущее:** Аудио может быть добавлено позже для инструкций/комментариев (future improvement)

**Решение:** ✅ Только видео, без аудио

---

### 2. Browser Close During Upload
**Вопрос:** What happens if user closes browser during upload?

**Ответ (из PRD 4.3.7):**
- **Сценарий:** Пользователь закрывает браузер/вкладку во время загрузки видео в S3
- **Поведение:** 
  - Загрузка прерывается (ожидаемое поведение)
  - Видео не загружается в S3
  - Assessment остается в статусе "processing" или "pending"
- **UX:**
  - Показать предупреждение перед закрытием страницы, если upload в процессе
  - Использовать `beforeunload` event для предупреждения
  - После закрытия: пользователь может вернуться и попробовать снова (нужно будет создать новый assessment)
- **Backend:**
  - S3 upload либо завершится (если начался), либо не начнется
  - Если видео загружено, но обработка не началась - видео останется в S3
  - Timeout для неполных uploads обрабатывается S3 lifecycle policies

**Решение:** ✅ Показать предупреждение перед закрытием, если upload в процессе. После закрытия - пользователь может создать новый assessment.

---

### 3. Video Compression Before Upload
**Вопрос:** Should we compress video before upload?

**Ответ:**
- **ДА** - Сжимать видео перед загрузкой
- **Обоснование:** 
  - Уменьшение размера файла → быстрее upload
  - Экономия bandwidth для пользователя
  - Снижение стоимости S3 storage
- **Реализация:**
  - Использовать `MediaRecorder` с настройками качества
  - Target bitrate: ~2-3 Mbps для 720p
  - Codec: VP8/VP9 для WebM, H.264 для MP4
  - Разрешение: максимум 720p (1280x720)
- **Ограничения MVP:**
  - Базовая компрессия через MediaRecorder settings
  - Нет дополнительных библиотек для компрессии (ffmpeg.js слишком тяжелый)
  - Если размер все еще > 50MB после компрессии - показать ошибку

**Решение:** ✅ Сжимать видео через MediaRecorder settings (bitrate, resolution)

---

### 4. Maximum Retry Attempts for Upload
**Вопрос:** Maximum retry attempts for upload?

**Ответ (из PRD 4.3.7.3 и 4.3.8.1):**
- **Для Upload (клиентская сторона):**
  - **Максимум 3 попытки** для одной записи видео
  - После 3 неудачных попыток - показать ошибку и предложить записать заново
  - Каждая попытка должна иметь timeout (60 секунд)
- **Для MediaPipe Processing (backend):**
  - **Максимум 3 attempts/test/day** (из PRD 4.3.7.3)
  - Это для обработки видео, не для upload
- **Per Test Limit:**
  - **3 attempts per test per day** (из PRD 4.3.8.1)
  - Это означает, что пользователь может записать и загрузить максимум 3 видео для одного теста в день
- **Реализация:**
  - Client-side: хранить счетчик попыток upload в state
  - После 3 неудач - показать "Upload failed after 3 attempts. Please record again."
  - Backend: проверять лимиты через `/limits/status` endpoint (когда будет реализован)

**Решение:** ✅ 3 попытки upload для одной записи. 3 attempts per test per day (проверяется backend).

---

### 5. Video Preview Before Upload
**Вопрос:** Should we show video preview before upload?

**Ответ (из PRD 4.3.7.4 UX):**
- **ДА** - Показывать preview записанного видео перед upload
- **Обоснование:**
  - Пользователь может проверить качество видео
  - Возможность перезаписать если видео плохое
  - Улучшает UX (пользователь уверен что загружает правильное видео)
- **Реализация:**
  - После остановки записи → показать preview записанного видео
  - Кнопки: "Retry" (записать заново), "Upload" (загрузить это видео)
  - Preview должен показывать:
    - Записанное видео (playback)
    - Длительность записи
    - Размер файла (опционально)
- **UX Flow:**
  1. Record → Stop
  2. Show preview + "Retry" / "Upload" buttons
  3. User decides: Retry (go to step 1) or Upload (proceed to upload)

**Решение:** ✅ Показывать preview записанного видео с кнопками "Retry" и "Upload"

---

## ADDITIONAL CLARIFICATIONS FROM PRD

### 6. Max Duration (Correction)
**Вопрос:** What is the maximum video duration?

**Ответ (из PRD 4.3.7.1):**
- **Max duration: 45 seconds** (не 60 секунд как указано в spec)
- **Обоснование:** PRD явно указывает 45s для client-side validation
- **Действие:** Обновить spec.md - изменить max duration с 60s на 45s

**Решение:** ✅ Максимальная длительность: **45 секунд** (обновить spec.md)

---

### 7. Max File Size (Confirmation)
**Вопрос:** What is the maximum file size?

**Ответ (из PRD 4.3.7.1):**
- **Max size: 50MB** (подтверждено)
- **Валидация:** Проверять на клиенте перед upload
- **Ошибка:** "Video too large. Please record a shorter video."

**Решение:** ✅ Максимальный размер: **50MB** (подтверждено)

---

### 8. Motion Detection
**Вопрос:** Should we implement motion detection on client?

**Ответ (из PRD 4.3.7.1):**
- **Опционально для MVP:** Motion detection упоминается в PRD, но не критично для MVP
- **Реализация:**
  - Базовую проверку можно добавить (анализ variance между кадрами)
  - Если motion variance < threshold → предупреждение (не блокировать)
  - Полная валидация на backend (MediaPipe processing)
- **Приоритет:** P2 (можно отложить на будущее)

**Решение:** ✅ Опционально для MVP. Показывать предупреждение, но не блокировать upload.

---

## DECISIONS SUMMARY

1. ✅ **Audio:** НЕТ - только видео
2. ✅ **Browser Close:** Показать предупреждение, после закрытия - создать новый assessment
3. ✅ **Compression:** ДА - сжимать через MediaRecorder settings
4. ✅ **Retry Attempts:** 3 попытки upload, 3 attempts per test per day
5. ✅ **Video Preview:** ДА - показывать preview с кнопками Retry/Upload
6. ✅ **Max Duration:** 45 секунд (обновить spec.md)
7. ✅ **Max Size:** 50MB (подтверждено)
8. ✅ **Motion Detection:** Опционально для MVP (P2)

---

## SPEC UPDATES REQUIRED

### Изменения в spec.md:

1. **Max Duration:** Изменить с 60s на **45s**
   - Section: "Recording Constraints" → "Max Duration: 45 seconds"
   - Section: "Client-Side Validation" → "Duration ≤ 45 seconds"
   - Section: "Edge Cases" → обновить соответствующие случаи

2. **Audio Recording:** Уточнить что аудио НЕ поддерживается
   - Section: "Known Limitations" → добавить "No audio recording (video only)"

3. **Video Compression:** Добавить детали компрессии
   - Section: "Technical Constraints" → добавить "Video Compression: MediaRecorder bitrate settings"

4. **Retry Logic:** Уточнить лимиты
   - Section: "Edge Cases" → обновить "Network Failure" с деталями о 3 попытках

5. **Video Preview:** Уточнить что preview обязателен
   - Section: "User Experience" → уточнить что preview показывается после записи

---

## OPEN QUESTIONS

Нет открытых вопросов. Все неясности разрешены на основе PRD и решений.

---

**Следующий шаг:** Обновить spec.md с исправлениями, затем перейти к `/plan`



