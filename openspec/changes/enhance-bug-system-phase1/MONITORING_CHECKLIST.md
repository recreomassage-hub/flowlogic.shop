# Monitoring Checklist - Phase 1 Deployment

**Deployment Date:** 2026-01-15  
**Commit:** `d2a951f`

---

## ✅ Immediate Checks (First 24 hours)

### GitHub Actions Workflow

- [ ] Проверить, что workflow file синтаксически корректен
- [ ] Убедиться, что новый код доступен в workflow
- [ ] Проверить, что скрипты имеют правильные права (executable)

**Check:**
```bash
# Проверить workflow file
cat .github/workflows/bug-hunter.yml | grep -A 5 "Solution Rate"

# Проверить скрипты
ls -la scripts/openspec-rules-parser.sh
ls -la scripts/calculate-solution-rate.sh
```

### First Workflow Run

**Способы запуска:**
1. **Manual trigger** (рекомендуется для теста):
   ```bash
   gh workflow run bug-hunter.yml
   ```
   
2. **Scheduled** (2:00 UTC):
   - Следующий run будет в 2:00 UTC завтра
   - Проверить на следующее утро

**Что проверить в первом run:**
- [ ] OpenSpec rules parser запускается без ошибок
- [ ] Solution Rate calculation работает
- [ ] Alerts срабатывают корректно
- [ ] Dashboard обновляется

---

## 📊 Workflow Steps Verification

### Step 1: Install jq and bc

**Ожидаемый результат:**
```
✅ jq installed
✅ bc installed
```

**Если ошибка:**
- Проверить права sudo
- Проверить доступность apt-get

### Step 2: Calculate Solution Rate

**Ожидаемый результат:**
```json
{
  "total_reported": <number>,
  "total_fixed": <number>,
  "solution_rate": <percentage>,
  "false_positive_rate": <percentage>
}
```

**Если ошибка:**
- Проверить наличие `.beads/issues.jsonl`
- Проверить формат Beads issues
- Проверить установку jq и bc

### Step 3: Check Alerts

**Ожидаемый результат:**
- Alerts только если thresholds превышены
- Summary с правильными статусами

**Если ошибка:**
- Проверить логику сравнения thresholds
- Проверить формат чисел

### Step 4: Update Dashboard

**Ожидаемый результат:**
- `docs/metrics/solution-rate-dashboard.md` обновлен
- Метрики корректны

**Если ошибка:**
- Проверить права на запись
- Проверить путь к файлу

---

## 🔍 OpenSpec Integration Checks

### Phase 3: OpenSpec Rules Checking

**Проверить:**
- [ ] OpenSpec rules parser запускается
- [ ] Правила извлекаются из `openspec/project.md`
- [ ] Метаданные парсятся из specs
- [ ] Нарушения обнаруживаются (если есть)

**Тест локально:**
```bash
# Парсинг правил
./scripts/openspec-rules-parser.sh --force-refresh

# Проверка в Bug Hunter
./scripts/bug-hunter.sh --mode deep | grep -i openspec
```

---

## 📈 Metrics Monitoring

### Day 1-2

- [ ] Проверить Solution Rate (ожидаемо: 0% или низкий, если нет данных)
- [ ] Проверить False Positive Rate
- [ ] Убедиться, что метрики обновляются

### Day 3-7

- [ ] Собрать baseline метрики
- [ ] Калибровать thresholds при необходимости
- [ ] Проверить тренды

### Week 2

- [ ] Сравнить метрики с baseline
- [ ] Оценить эффективность
- [ ] Подготовить отчет

---

## ⚠️ Common Issues & Solutions

### Issue: Scripts not found

**Симптомы:**
```
./scripts/openspec-rules-parser.sh: No such file or directory
```

**Решение:**
- Проверить, что файлы добавлены в git
- Проверить, что файлы executable (`chmod +x`)

### Issue: jq not found

**Симптомы:**
```
jq: command not found
```

**Решение:**
- Проверить, что step "Install jq" выполняется
- Проверить права sudo в workflow

### Issue: Beads issues not found

**Симптомы:**
```
Beads issues file not found: .beads/issues.jsonl
```

**Решение:**
- Это нормально, если нет багов
- Solution Rate будет 0%
- Workflow не должен падать

### Issue: OpenSpec rules empty

**Симптомы:**
```
OpenSpec rules: []
```

**Решение:**
- Проверить, что `openspec/project.md` существует
- Проверить формат правил в парсере
- Проверить кэш файл

---

## 📋 Daily Checklist

### Morning (Check Previous Night's Run)

- [ ] Открыть GitHub Actions
- [ ] Проверить последний nightly run
- [ ] Проверить Solution Rate metrics
- [ ] Проверить alerts
- [ ] Проверить dashboard update

### Afternoon (Review Metrics)

- [ ] Проверить тренды метрик
- [ ] Проверить false positives
- [ ] Калибровать правила при необходимости

---

## 🎯 Success Criteria

**Week 1:**
- ✅ Workflow runs без ошибок
- ✅ Solution Rate calculation работает
- ✅ OpenSpec rules parsing работает
- ✅ Dashboard обновляется

**Week 2:**
- ✅ Solution Rate > 60% (если есть баги)
- ✅ False Positive Rate < 20%
- ✅ OpenSpec rules находят нарушения (если есть)
- ✅ Alerts работают корректно

---

## 🔗 Resources

- **Workflow:** https://github.com/recreomassage-hub/flowlogic.shop/actions/workflows/bug-hunter.yml
- **Dashboard:** `docs/metrics/solution-rate-dashboard.md`
- **Deployment Plan:** `STAGING_DEPLOYMENT.md`
- **Implementation Status:** `IMPLEMENTATION_STATUS.md`

---

**Next Review:** Check first workflow run after push
