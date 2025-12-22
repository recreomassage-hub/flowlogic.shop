# 🏗️ ARCHITECT EXECUTE — Создание архитектуры

**Этап:** 2.1 Architecture Execute  
**Роль:** ARCHITECT  
**Режим:** EXECUTE  
**Время:** 45-90 минут

---

## 🔄 ЦИКЛ ИСПОЛНЕНИЯ

1. **FETCH:** Прочитай PROJECT_CONFIG.md + WORKFLOW_STATE.md + ROLES/02_architect.md + docs/requirements/
2. **DECODE:** Определи текущий этап (architecture_execute)
3. **EXECUTE:** Создай архитектурные артефакты
4. **WRITEBACK:** Обнови WORKFLOW_STATE.md

---

## 📋 ЗАДАЧА

Создать полную архитектуру системы:
- C4 диаграммы (Context, Containers, Components)
- Схема БД
- API спецификация
- Tech Stack
- ADR (Architecture Decision Records)

---

## 📤 ВЫХОДНЫЕ АРТЕФАКТЫ

1. `docs/architecture/c4_diagrams.md` (с Mermaid)
2. `docs/architecture/db_schema.md` (с Mermaid)
3. `docs/architecture/api_spec.yaml`
4. `docs/architecture/tech_stack.md`
5. `docs/architecture/adr/001-initial-architecture.md`

---

## ✅ КРИТЕРИИ ЗАВЕРШЕНИЯ

- [ ] C4 диаграммы готовы (Context, Containers)
- [ ] Схема БД включает все сущности
- [ ] API спецификация покрывает endpoints
- [ ] Выбран стек технологий
- [ ] Минимум 1 ADR документирован
- [ ] WORKFLOW_STATE.md обновлен: статус `DONE`, next_role: `PM` (для peer-review)

---

**После завершения:** Переходи к `04_pm_peer_review.md`

