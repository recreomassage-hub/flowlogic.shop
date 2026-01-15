# ADR-001: Early Secrets Loading Pattern for OIDC Token Expiry

**Status:** Accepted  
**Date:** 2026-01-14  
**Context:** Bug a3o - OIDC Token Expiry при чтении SSM параметров

## Context

**Problem:**
- OIDC токены истекают между получением (начало workflow) и чтением SSM параметров (позже в workflow)
- OIDC токены имеют TTL 1 час, но workflow может выполняться дольше
- Quick fix (Access Keys fallback) менее безопасен и требует ручного rotation

**Decision Drivers:**
- Security: OIDC предпочтительнее Access Keys
- Reliability: Нужно предотвратить истечение токенов
- Maintainability: Решение должно быть масштабируемым
- Performance: Не должно замедлять workflow

## Decision

**Chosen Solution:** Early Secrets Loading + Caching Pattern

**Architecture:**
1. Загружать все SSM параметры на первом шаге workflow (когда OIDC токен свежий)
2. Кэшировать секреты в GitHub Actions cache
3. Использовать кэшированные значения в последующих шагах
4. Опционально: token refresh механизм для очень долгих workflows

## Consequences

### Positive
- ✅ Решает проблему истечения токенов
- ✅ Более безопасно, чем Access Keys
- ✅ Масштабируемое решение для всех workflows
- ✅ Улучшает производительность (batch read, caching)
- ✅ Предотвращает рецидивы

### Negative
- ⚠️ Требует изменения структуры workflow
- ⚠️ Нужно перечислить все SSM параметры заранее
- ⚠️ Кэш может быть не актуален (но это OK для секретов)

### Neutral
- Кэш использует GitHub Actions cache (ограничения по размеру)
- Token refresh опционален (только для workflows > 1 часа)

## Alternatives Considered

### Alternative 1: Token Refresh Before SSM Read
**Pros:** Простое решение  
**Cons:** Требует обновления токена перед каждым SSM read, не решает проблему для очень долгих workflows

### Alternative 2: Access Keys Fallback (Current Quick Fix)
**Pros:** Уже реализовано, работает  
**Cons:** Менее безопасно, требует ручного rotation, не идеально для production

### Alternative 3: Secrets Manager Instead of SSM
**Pros:** Secrets Manager лучше интегрирован с OIDC  
**Cons:** Требует миграции всех секретов, breaking change

## Implementation Notes

**Phase 1:** Design and review (Week 1-2)  
**Phase 2:** Implement in one workflow (Week 3-4)  
**Phase 3:** Migrate all workflows (Month 2)  
**Phase 4:** Optimize and monitor (Month 3-6)

**Success Criteria:**
- Zero incidents with expired tokens
- All workflows migrated
- Recurrence rate < 2%

## References

- Bug Issue: llm-os-project flowlogic.shop-a3o
- OpenSpec Proposal: early-secrets-loading-pattern
- Related ADRs: None
