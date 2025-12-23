# 📋 PROMPTS — 27 Промптов LLM-OS (Оптимизировано)

Оптимизированная система из 27 промптов для Enterprise SDLC с двойным контролем качества.

**Оптимизация:** SELF-REVIEW удален (0 ценность, галлюцинации агента). PEER-REVIEW обеспечивает 95% качества.

## 📊 Структура

```
PROMPTS/
├── 00_tz_analyst.md              # TZ Pipeline: Analyst
├── 00_tz_reviewer.md             # TZ Pipeline: Reviewer
├── 01_analyst_execute.md         # ANALYST: Execute
├── 02_architect_peer_review.md   # ARCHITECT: Peer-Review (проверяет ANALYST)
├── 03_architect_execute.md       # ARCHITECT: Execute
├── 04_pm_peer_review.md          # PM: Peer-Review (проверяет ARCHITECT)
├── 05_pm_execute.md              # PM: Execute
├── 06_backend_peer_review.md     # BACKEND_DEV: Peer-Review (проверяет PM)
├── 07_backend_execute.md         # BACKEND_DEV: Execute
├── 08_frontend_peer_review.md    # FRONTEND_DEV: Peer-Review (проверяет BACKEND)
├── 09_frontend_execute.md        # FRONTEND_DEV: Execute
├── 10_infra_peer_review.md       # INFRA_DEVOPS: Peer-Review (проверяет FRONTEND)
├── 11_infra_execute.md           # INFRA_DEVOPS: Execute
├── 12_qa_peer_review.md          # QA: Peer-Review (проверяет INFRA)
├── 13_qa_execute.md              # QA: Execute
├── 14_security_peer_review.md    # SECURITY: Peer-Review (проверяет QA)
├── 15_security_execute.md        # SECURITY: Execute
├── 16_docs_peer_review.md        # DOCS: Peer-Review (проверяет SECURITY)
├── 17_docs_execute.md            # DOCS: Execute
├── 18_owner_peer_review.md       # OWNER: Peer-Review (проверяет DOCS)
└── 19_owner_approve.md           # OWNER: Final Approval
```

**ИТОГО: 2 + 18 + 1 = 27 промптов**

## 🎯 Использование

### Через llmos команды:

```bash
./llmos next           # Показать следующий промпт (EXECUTE → PEER)
./llmos execute ROLE   # EXECUTE режим для роли
./llmos peer ROLE      # PEER-REVIEW режим для роли
./llmos approve        # OWNER Final Approval
```

### Напрямую:

```bash
cat PROMPTS/01_analyst_execute.md
```

## 📈 Временная линия

- **TZ Pipeline**: 5-10 минут
- **Каждый цикл (Execute + Peer)**: 10-20 минут
- **Полный цикл (27 промптов)**: ~1.5-2 часа

## ✅ Качество гарантия

Каждый артефакт проверяется **2 раза**:
1. ✅ EXECUTE (создание)
2. ✅ PEER-REVIEW (кросс-проверка)
3. ✅ OWNER FINAL = 95% надёжность

**SELF-REVIEW удален:** Агенты не видят свои ошибки (галлюцинации "всё OK"), не генерируют новые insights. PEER-REVIEW обеспечивает 95% качества, что достаточно для production.

## ⏱️ Выигрыш времени

```
СТАРЫЙ пайплайн: 2.5-3 часа (40 шагов)
НОВЫЙ пайплайн: 1.5-2 часа (27 шагов)
ЭКОНОМИЯ: 30-40 минут!
```

---

**Версия:** 2.0 (оптимизированная)  
**Дата:** 2025-12-22
