# 🚀 Features Directory

**Назначение:** Хранилище всех фич проекта

---

## 📁 Структура

Каждая фича имеет свою директорию:

```
docs/features/
├── <feature-slug>/
│   ├── feature_brief.md      # Обязательно перед стартом
│   ├── impact_analysis.md    # Анализ влияния
│   ├── design/
│   │   ├── api.md
│   │   ├── ux.md
│   │   └── data.md
│   ├── qa.md                 # Тестирование
│   ├── retro.md              # Ретроспектива
│   └── README.md
└── feature_workflow.md       # Процесс разработки фич
```

---

## 🚀 Быстрый старт

### 1. Создать новую фичу
```bash
./llmos feature new "Smart Task Prioritization" "Help users see important tasks first"
```

### 2. Анализ влияния
```bash
./llmos feature impact smart-task-prioritization
```

### 3. Проверить feature flag
```bash
./llmos feature check-flag smart-task-prioritization
```

### 4. Ретроспектива
```bash
./llmos feature retro smart-task-prioritization
```

---

## 📋 Workflow

1. ✅ **Feature Brief** (PM) - `./llmos feature new`
2. ✅ **Impact Analysis** (ARCHITECT) - `./llmos feature impact`
3. ✅ **Design** (DEV) - Design templates
4. ✅ **Implementation** (DEV) - Micro-commits (`./step.sh`)
5. ✅ **QA** (QA) - QA template
6. ✅ **Release** (PM) - Feature flag + `./llmos feature check-flag`
7. ✅ **Retro** (OWNER) - `./llmos feature retro`

---

## 📚 Документация

- **Процесс:** `feature_workflow.md` - Полное описание
- **Команды:** `./llmos feature help` - Справка по командам

---

**Последнее обновление:** 2025-12-26

