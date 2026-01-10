# Export Assessment Report - Testing Plan

**Дата создания:** 2025-01-03  
**Статус:** План тестирования  
**Задача:** Task 7 из tasks.md

---

## 📋 ОБЗОР ТЕСТИРОВАНИЯ

### Цели тестирования
1. Убедиться, что PDF генерируется корректно
2. Убедиться, что все данные отображаются правильно
3. Убедиться, что ошибки обрабатываются корректно
4. Убедиться, что функциональность работает на всех браузерах

### Типы тестирования
1. **Unit Tests** - Тестирование PDF service изолированно
2. **Integration Tests** - Тестирование полного flow (API → PDF → Download)
3. **Manual Testing** - Ручное тестирование на разных браузерах

---

## 🧪 UNIT TESTS - PDF Service

### Файл для создания
`src/backend/tests/services/pdfService.test.ts`

### Тестовые сценарии

#### Test 1: Generate PDF with complete assessment data
**Описание:** PDF генерируется с полными данными assessment

**Тестовые данные:**
```typescript
const mockAssessment: Assessment = {
  user_id: 'user-123',
  assessment_id: 'assessment-456',
  test_id: 1,
  test_name: 'Overhead Squat',
  video_url: 's3://bucket/video.mp4',
  status: 'completed',
  attempt_number: 1,
  quality_score: 0.85,
  confidence_avg: 0.92,
  motion_variance: 0.15,
  result: {
    score: 'limited',
    confidence: 0.88,
    problem_areas: ['Shoulder mobility', 'Hip flexibility'],
  },
  created_at: '2025-01-03T10:00:00Z',
  completed_at: '2025-01-03T10:05:00Z',
  month_key: '2025-01',
};

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
};
```

**Проверки:**
- [ ] PDF Buffer создается (не null, не empty)
- [ ] PDF содержит заголовок "Flow Logic"
- [ ] PDF содержит "Assessment Report"
- [ ] PDF содержит test name "Overhead Squat"
- [ ] PDF содержит дату в правильном формате
- [ ] PDF содержит имя пользователя "John Doe"
- [ ] PDF содержит статус "COMPLETED"
- [ ] PDF содержит score "LIMITED"
- [ ] PDF содержит confidence "88%"
- [ ] PDF содержит quality score "85%"
- [ ] PDF содержит problem areas список
- [ ] PDF содержит recommendations section
- [ ] PDF содержит disclaimer в footer

**Код теста:**
```typescript
import { generateAssessmentPDF } from '../../services/pdfService';
import { Assessment } from '../../db/models/Assessment';

describe('PDF Service', () => {
  it('should generate PDF with complete assessment data', async () => {
    const pdfBuffer = await generateAssessmentPDF(mockAssessment, mockUser);
    
    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(0);
    expect(pdfBuffer instanceof Buffer).toBe(true);
    
    // Check PDF header (PDF files start with %PDF)
    const pdfString = pdfBuffer.toString('utf-8', 0, 10);
    expect(pdfString).toContain('%PDF');
    
    // Check content (basic checks)
    const fullPdfString = pdfBuffer.toString('utf-8');
    expect(fullPdfString).toContain('Flow Logic');
    expect(fullPdfString).toContain('Overhead Squat');
    expect(fullPdfString).toContain('John Doe');
    expect(fullPdfString).toContain('LIMITED');
    expect(fullPdfString).toContain('88%');
  });
});
```

---

#### Test 2: Generate PDF without user name
**Описание:** PDF генерируется без имени пользователя (только email)

**Тестовые данные:**
```typescript
const mockUserEmailOnly = {
  email: 'john@example.com',
};
```

**Проверки:**
- [ ] PDF создается успешно
- [ ] PDF содержит email (скрытый формат: `john@***`)
- [ ] PDF не содержит "User: undefined"

---

#### Test 3: Generate PDF for processing assessment
**Описание:** PDF для assessment со статусом "processing"

**Тестовые данные:**
```typescript
const processingAssessment: Assessment = {
  ...mockAssessment,
  status: 'processing',
  result: undefined,
};
```

**Проверки:**
- [ ] PDF создается успешно
- [ ] PDF содержит статус "PROCESSING"
- [ ] PDF содержит сообщение "Results are being processed"
- [ ] PDF не содержит results section

---

#### Test 4: Generate PDF for failed assessment
**Описание:** PDF для assessment со статусом "failed"

**Тестовые данные:**
```typescript
const failedAssessment: Assessment = {
  ...mockAssessment,
  status: 'failed',
  result: undefined,
};
```

**Проверки:**
- [ ] PDF создается успешно
- [ ] PDF содержит статус "FAILED"
- [ ] PDF содержит сообщение "Assessment failed"

---

#### Test 5: Generate PDF for invalid assessment
**Описание:** PDF для assessment со статусом "invalid" с feedback

**Тестовые данные:**
```typescript
const invalidAssessment: Assessment = {
  ...mockAssessment,
  status: 'invalid',
  feedback: 'Video quality too low',
  result: undefined,
};
```

**Проверки:**
- [ ] PDF создается успешно
- [ ] PDF содержит статус "INVALID"
- [ ] PDF содержит feedback message "Video quality too low"

---

#### Test 6: Generate PDF without problem areas
**Описание:** PDF для assessment с результатом, но без problem areas

**Тестовые данные:**
```typescript
const assessmentWithoutProblemAreas: Assessment = {
  ...mockAssessment,
  result: {
    score: 'pass',
    confidence: 0.95,
    problem_areas: undefined,
  },
};
```

**Проверки:**
- [ ] PDF создается успешно
- [ ] PDF не содержит "Problem Areas" section
- [ ] PDF содержит recommendations для "pass" score

---

#### Test 7: Error handling
**Описание:** Обработка ошибок при генерации PDF

**Проверки:**
- [ ] Ошибка выбрасывается при invalid data
- [ ] Ошибка выбрасывается при null assessment
- [ ] Promise reject при ошибке в PDF generation

---

### Шаги выполнения Unit Tests

1. **Создать тестовый файл**
   ```bash
   cd src/backend
   touch tests/services/pdfService.test.ts
   ```

2. **Написать тесты**
   - Использовать Jest (уже настроен)
   - Следовать структуре выше
   - Использовать моки для данных

3. **Запустить тесты**
   ```bash
   npm test -- pdfService.test.ts
   ```

4. **Проверить покрытие**
   ```bash
   npm run test:coverage -- pdfService.test.ts
   ```

5. **Цель покрытия:** 80%+ для pdfService.ts

---

## 🔗 INTEGRATION TESTS - Export Endpoint

### Файл для создания/обновления
`src/backend/tests/integration/assessmentExport.test.ts`

### Тестовые сценарии

#### Test 1: Successful PDF export
**Описание:** Полный flow от запроса до скачивания PDF

**Шаги:**
1. Создать тестового пользователя в DynamoDB
2. Создать тестовый assessment в DynamoDB
3. Аутентифицироваться (получить JWT token)
4. Вызвать `GET /v1/assessments/:id/export`
5. Проверить ответ

**Проверки:**
- [ ] Статус ответа: 200 OK
- [ ] Content-Type: `application/pdf`
- [ ] Content-Disposition: `attachment; filename="..."`
- [ ] Body содержит PDF data (Buffer)
- [ ] PDF валидный (начинается с %PDF)
- [ ] PDF содержит правильные данные assessment

**Код теста:**
```typescript
import request from 'supertest';
import app from '../../index'; // или ваш Express app
import { AssessmentModel } from '../../db/models/Assessment';
import { UserModel } from '../../db/models/User';

describe('Assessment Export Integration', () => {
  let authToken: string;
  let userId: string;
  let assessmentId: string;

  beforeAll(async () => {
    // Setup: Create test user and assessment
    // Get auth token
  });

  afterAll(async () => {
    // Cleanup: Delete test data
  });

  it('should export assessment as PDF', async () => {
    const response = await request(app)
      .get(`/v1/assessments/${assessmentId}/export`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect('Content-Type', /application\/pdf/);

    expect(response.headers['content-disposition']).toContain('attachment');
    expect(response.headers['content-disposition']).toContain('.pdf');
    expect(response.body).toBeInstanceOf(Buffer);
    
    // Check PDF header
    const pdfHeader = response.body.toString('utf-8', 0, 10);
    expect(pdfHeader).toContain('%PDF');
  });
});
```

---

#### Test 2: Export with invalid assessment ID
**Описание:** Попытка экспорта несуществующего assessment

**Проверки:**
- [ ] Статус ответа: 404 Not Found
- [ ] Error message: "Assessment not found"

---

#### Test 3: Export without authentication
**Описание:** Попытка экспорта без токена

**Проверки:**
- [ ] Статус ответа: 401 Unauthorized
- [ ] Error message: "Unauthorized"

---

#### Test 4: Export other user's assessment
**Описание:** Попытка экспорта чужого assessment

**Проверки:**
- [ ] Статус ответа: 404 Not Found (или 403 Forbidden)
- [ ] Error message указывает на отсутствие доступа

---

#### Test 5: Export with different assessment statuses
**Описание:** Экспорт assessments с разными статусами

**Проверки:**
- [ ] Processing assessment → PDF с "processing" message
- [ ] Completed assessment → PDF с результатами
- [ ] Failed assessment → PDF с "failed" message
- [ ] Invalid assessment → PDF с feedback

---

### Шаги выполнения Integration Tests

1. **Настроить тестовое окружение**
   - Использовать LocalStack или тестовый DynamoDB
   - Или использовать реальный dev environment

2. **Создать тестовые данные**
   - Helper функции для создания users и assessments
   - Cleanup после тестов

3. **Написать тесты**
   - Использовать supertest для HTTP запросов
   - Тестировать полный flow

4. **Запустить тесты**
   ```bash
   npm test -- assessmentExport.test.ts
   ```

5. **Проверить результаты**
   - Все тесты должны проходить
   - Проверить логи на ошибки

---

## 🖱️ MANUAL TESTING - Браузеры

### Чек-лист для ручного тестирования

#### Подготовка
- [ ] Backend запущен (dev или staging)
- [ ] Frontend запущен (npm run dev)
- [ ] Создан тестовый пользователь
- [ ] Создан хотя бы один assessment с результатами
- [ ] Создан assessment со статусом "processing"
- [ ] Создан assessment со статусом "failed"

---

### Chrome (Desktop)

#### Test Case 1: Export completed assessment
**Шаги:**
1. Открыть `http://localhost:3000/assessments/{id}` (completed assessment)
2. Нажать кнопку "Export PDF"
3. Дождаться скачивания PDF

**Ожидаемый результат:**
- [ ] Кнопка видна и доступна
- [ ] При нажатии показывается "Exporting..."
- [ ] Кнопка disabled во время экспорта
- [ ] PDF скачивается автоматически
- [ ] Имя файла: `assessment-{test-name}-{date}.pdf`
- [ ] PDF открывается корректно
- [ ] PDF содержит все данные assessment

**Проверка содержимого PDF:**
- [ ] Заголовок "Flow Logic" присутствует
- [ ] Test name правильный
- [ ] Дата правильная
- [ ] User name присутствует (если есть)
- [ ] Status правильный
- [ ] Results section присутствует
- [ ] Score отображается
- [ ] Confidence отображается
- [ ] Problem areas отображаются (если есть)
- [ ] Recommendations присутствуют
- [ ] Disclaimer в footer присутствует

---

#### Test Case 2: Export processing assessment
**Шаги:**
1. Открыть assessment со статусом "processing"
2. Нажать "Export PDF"

**Ожидаемый результат:**
- [ ] PDF скачивается
- [ ] PDF содержит "Results are being processed"
- [ ] PDF не содержит results section

---

#### Test Case 3: Export failed assessment
**Шаги:**
1. Открыть assessment со статусом "failed"
2. Нажать "Export PDF"

**Ожидаемый результат:**
- [ ] PDF скачивается
- [ ] PDF содержит "Assessment failed"
- [ ] PDF не содержит results section

---

#### Test Case 4: Error handling
**Шаги:**
1. Открыть несуществующий assessment (404)
2. Попробовать экспорт

**Ожидаемый результат:**
- [ ] Показывается ошибка (404 или другое сообщение)
- [ ] Пользователь видит понятное сообщение об ошибке

---

#### Test Case 5: Network error simulation
**Шаги:**
1. Отключить интернет
2. Нажать "Export PDF"
3. Включить интернет
4. Попробовать снова

**Ожидаемый результат:**
- [ ] Показывается ошибка сети
- [ ] Можно повторить попытку
- [ ] После восстановления связи экспорт работает

---

### Firefox (Desktop)

**Повторить все тесты из Chrome:**
- [ ] Test Case 1: Export completed assessment
- [ ] Test Case 2: Export processing assessment
- [ ] Test Case 3: Export failed assessment
- [ ] Test Case 4: Error handling
- [ ] Test Case 5: Network error

**Дополнительные проверки:**
- [ ] PDF открывается в Firefox PDF viewer
- [ ] Скачивание работает корректно
- [ ] Нет визуальных проблем

---

### Safari (Desktop)

**Повторить все тесты из Chrome:**
- [ ] Test Case 1: Export completed assessment
- [ ] Test Case 2: Export processing assessment
- [ ] Test Case 3: Export failed assessment
- [ ] Test Case 4: Error handling
- [ ] Test Case 5: Network error

**Дополнительные проверки:**
- [ ] PDF открывается в Safari
- [ ] Скачивание работает (Safari может показывать preview)
- [ ] Нет визуальных проблем

---

### Mobile Browsers

#### iOS Safari

**Тесты:**
- [ ] Export completed assessment
- [ ] PDF скачивается или открывается в preview
- [ ] Кнопка доступна и работает
- [ ] Нет проблем с touch events

#### Chrome Mobile (Android)

**Тесты:**
- [ ] Export completed assessment
- [ ] PDF скачивается
- [ ] Кнопка доступна и работает
- [ ] Нет проблем с touch events

---

## 📊 TESTING CHECKLIST

### Unit Tests
- [ ] Test 1: Complete assessment data ✅
- [ ] Test 2: Without user name ✅
- [ ] Test 3: Processing assessment ✅
- [ ] Test 4: Failed assessment ✅
- [ ] Test 5: Invalid assessment ✅
- [ ] Test 6: Without problem areas ✅
- [ ] Test 7: Error handling ✅
- [ ] Coverage: 80%+ ✅

### Integration Tests
- [ ] Test 1: Successful export ✅
- [ ] Test 2: Invalid assessment ID ✅
- [ ] Test 3: Without authentication ✅
- [ ] Test 4: Other user's assessment ✅
- [ ] Test 5: Different statuses ✅

### Manual Testing
- [ ] Chrome Desktop: All test cases ✅
- [ ] Firefox Desktop: All test cases ✅
- [ ] Safari Desktop: All test cases ✅
- [ ] iOS Safari: Basic tests ✅
- [ ] Chrome Mobile: Basic tests ✅

---

## 🐛 KNOWN ISSUES / EDGE CASES

### Issues to Test
1. **Very long test names:** PDF layout не ломается
2. **Many problem areas:** PDF не переполняется
3. **Special characters:** Имя файла корректно экранируется
4. **Concurrent exports:** Несколько экспортов одновременно
5. **Large PDFs:** Производительность при больших данных

---

## 📝 TESTING REPORT TEMPLATE

После выполнения тестов заполнить:

```markdown
# Testing Report - Export Assessment Report

**Дата:** 2025-01-03
**Тестировщик:** [Имя]

## Unit Tests
- Результат: [PASS/FAIL]
- Покрытие: [X]%
- Проблемы: [если есть]

## Integration Tests
- Результат: [PASS/FAIL]
- Проблемы: [если есть]

## Manual Testing
- Chrome: [PASS/FAIL]
- Firefox: [PASS/FAIL]
- Safari: [PASS/FAIL]
- Mobile: [PASS/FAIL]
- Проблемы: [если есть]

## Общий вердикт
[APPROVED/NEEDS_FIXES]
```

---

## ⏱️ ОЦЕНКА ВРЕМЕНИ

- **Unit Tests:** 1-2 часа
- **Integration Tests:** 1-2 часа
- **Manual Testing:** 1-2 часа

**Общее время:** 3-6 часов

---

## ✅ КРИТЕРИИ ЗАВЕРШЕНИЯ

Task 7 считается завершенным когда:
- [ ] Все unit tests написаны и проходят
- [ ] Все integration tests написаны и проходят
- [ ] Manual testing выполнено на всех браузерах
- [ ] Все найденные баги исправлены
- [ ] Testing report заполнен
- [ ] tasks.md обновлен (Task 7 отмечен как completed)

---

**Следующий шаг:** Начать с Unit Tests (Test 1)**



