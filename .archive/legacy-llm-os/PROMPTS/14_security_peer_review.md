# 🛡️ SECURITY PEER-REVIEW — Кросс-проверка тестов

**Этап:** 7.3 QA Peer-Review  
**Роль:** SECURITY  
**Режим:** PEER-REVIEW  
**Время:** 10-15 минут

---

## 📋 ЗАДАЧА

Провести кросс-проверку тестов с точки зрения SECURITY:
- Покрытие безопасности
- Тесты на уязвимости
- Соответствие security требованиям

---

## 📤 ВЫХОДНОЙ АРТЕФАКТ

1. `tests/peer_review_report.md`

---

## ✅ КРИТЕРИИ ЗАВЕРШЕНИЯ

- [ ] Тесты проверены на security coverage
- [ ] Вердикт: APPROVED / NEEDS_REVISION / BLOCKED
- [ ] WORKFLOW_STATE.md обновлен

---

## 🎯 ВЕРДИКТЫ

- **APPROVED** → next_role: `SECURITY`, current_stage: `security_execute`
- **NEEDS_REVISION** → next_role: `QA`, current_stage: `qa_execute`
- **BLOCKED** → next_role: `OWNER`, current_stage: `qa_peer_review`

---

**После APPROVED:** Переходи к `15_security_execute.md`

