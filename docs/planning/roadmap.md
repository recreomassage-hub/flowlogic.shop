# 🗺️ Roadmap — Flow Logic

**Версия:** 1.0  
**Дата:** 2025-12-22  
**Горизонт планирования:** 6 месяцев (Q1-Q2 2025)

---

## 📊 Обзор Roadmap

```
Q1 2025 (Months 1-3): MVP Development
Q2 2025 (Months 4-6): MVP+ Features & Optimization
```

---

## 🎯 Q1 2025: MVP Development (Months 1-3)

**Цель:** Запустить MVP с core функциональностью

### Month 1 (Weeks 1-4): Foundation

**Milestone 1.1: Infrastructure Ready** (Week 2)
- ✅ AWS infrastructure настроена
- ✅ CI/CD pipeline работает
- ✅ Monitoring & observability настроены

**Milestone 1.2: Database Ready** (Week 4)
- ✅ DynamoDB tables созданы
- ✅ Migrations framework работает
- ✅ Access patterns реализованы

**Deliverables:**
- Infrastructure setup
- Database setup
- CI/CD pipeline

---

### Month 2 (Weeks 5-8): Core Backend

**Milestone 2.1: Authentication Ready** (Week 6)
- ✅ Registration & Login работают
- ✅ User management работает
- ✅ Frontend auth UI готов

**Milestone 2.2: Subscriptions Ready** (Week 8)
- ✅ Stripe интеграция работает
- ✅ Tier management работает
- ✅ Subscription flow работает

**Deliverables:**
- Authentication system
- Subscription system
- Basic frontend (auth, tiers)

---

### Month 3 (Weeks 9-12): Video Processing

**Milestone 3.1: Video Upload Ready** (Week 10)
- ✅ Video upload в S3 работает
- ✅ Frontend video recording готов

**Milestone 3.2: MediaPipe Processing Ready** (Week 14)
- ✅ MediaPipe интеграция работает
- ✅ Results processing работает
- ✅ Assessment management работает

**Deliverables:**
- Video upload system
- MediaPipe processing
- Assessment results

---

### Month 3 (Weeks 13-18): MVP Completion

**Milestone 3.3: MVP Ready** (Week 18)
- ✅ Frontend полностью интегрирован
- ✅ All core features работают
- ✅ Testing завершен
- ✅ MVP готов к релизу

**Deliverables:**
- Complete MVP
- Testing coverage (80%+)
- Production-ready deployment

---

## 🎯 Q2 2025: MVP+ Features (Months 4-6)

**Цель:** Добавить MVP+ функции (Basic+ features)

### Month 4 (Weeks 19-20): AI Plan Generator

**Milestone 4.1: Plan Generator Ready** (Week 20)
- ✅ Rule-based plan generator работает
- ✅ Plan endpoints работают
- ✅ Plan display готов

**Deliverables:**
- AI Plan Generator (rule-based)
- Plan management

---

### Month 5 (Weeks 21-22): Smart Calendar

**Milestone 5.1: Calendar Ready** (Week 22)
- ✅ Calendar endpoints работают
- ✅ Calendar frontend готов
- ✅ Streak tracking работает

**Deliverables:**
- Smart Calendar
- Task management
- Streak tracking

---

### Month 6 (Weeks 23-24): Progress Dashboard

**Milestone 6.1: Progress Dashboard Ready** (Week 24)
- ✅ Progress endpoints работают
- ✅ Charts визуализация готова
- ✅ Stats отображаются

**Deliverables:**
- Progress Dashboard
- Charts & Analytics
- Stats tracking

---

## 📈 Post-MVP: Future Features (Months 7+)

### Retention Improvements (Pro+)
- Micro-reflection & micro-coaching
- Badges & thresholds
- Auto-adaptation & share card

### Optimization & Scale
- Performance optimization
- Cost optimization
- Scaling improvements

### Additional Features
- Multi-language support (i18n)
- Advanced analytics
- Social features

---

## 🎯 Key Milestones

| Milestone | Дата | Статус | Описание |
|-----------|------|--------|----------|
| M1.1: Infrastructure Ready | Week 2 | NOT_STARTED | AWS setup, CI/CD |
| M1.2: Database Ready | Week 4 | NOT_STARTED | DynamoDB tables, migrations |
| M2.1: Authentication Ready | Week 6 | NOT_STARTED | Auth system, user management |
| M2.2: Subscriptions Ready | Week 8 | NOT_STARTED | Stripe integration, tier management |
| M3.1: Video Upload Ready | Week 10 | NOT_STARTED | S3 upload, video recording |
| M3.2: MediaPipe Ready | Week 14 | NOT_STARTED | Video processing, results |
| **M3.3: MVP Ready** | **Week 18** | **NOT_STARTED** | **Complete MVP, production-ready** |
| M4.1: Plan Generator Ready | Week 20 | NOT_STARTED | AI plan generator |
| M5.1: Calendar Ready | Week 22 | NOT_STARTED | Smart calendar |
| M6.1: Progress Dashboard Ready | Week 24 | NOT_STARTED | Progress dashboard |

---

## 📊 Timeline Visualization

```
Month 1: Foundation
├── Week 1-2: Infrastructure (M1.1)
└── Week 3-4: Database (M1.2)

Month 2: Core Backend
├── Week 5-6: Authentication (M2.1)
└── Week 7-8: Subscriptions (M2.2)

Month 3: Video Processing
├── Week 9-10: Video Upload (M3.1)
├── Week 11-14: MediaPipe (M3.2)
└── Week 15-18: MVP Completion (M3.3) 🎉

Month 4: Plan Generator
└── Week 19-20: AI Plan Generator (M4.1)

Month 5: Calendar
└── Week 21-22: Smart Calendar (M5.1)

Month 6: Progress Dashboard
└── Week 23-24: Progress Dashboard (M6.1)
```

---

## 🎯 Success Metrics

### MVP (Week 18)
- ✅ All core features работают
- ✅ Testing coverage ≥ 80%
- ✅ Cost ≤ $50/мес
- ✅ Performance: API latency p95 < 500ms
- ✅ Reliability: Uptime > 99.9%

### MVP+ (Week 24)
- ✅ All MVP+ features работают
- ✅ User engagement metrics улучшены
- ✅ Cost ≤ $100/мес (100-1000 users)
- ✅ Retention rate > 65%

---

## ⚠️ Risks & Mitigation

### Technical Risks
1. **MediaPipe на Lambda**
   - **Risk:** Performance issues
   - **Mitigation:** Early testing, provisioned concurrency, ARM64
   - **Timeline Impact:** +1-2 weeks buffer

2. **Cost превышение**
   - **Risk:** > $50/мес для MVP
   - **Mitigation:** Cost monitoring, optimization
   - **Timeline Impact:** None (monitoring)

3. **AI Plan Generator**
   - **Risk:** Complexity недооценена
   - **Mitigation:** Start with rule-based, optional LLM
   - **Timeline Impact:** +1 week buffer

### Business Risks
1. **Market timing**
   - **Risk:** Competition или market changes
   - **Mitigation:** Regular market research
   - **Timeline Impact:** None

2. **User adoption**
   - **Risk:** Low activation rate
   - **Mitigation:** User testing, feedback loops
   - **Timeline Impact:** None (post-MVP)

---

## 📅 Review Schedule

- **Weekly:** Sprint review & planning
- **Bi-weekly:** Milestone review
- **Monthly:** Roadmap review & adjustment
- **Quarterly:** Strategic review

---

**Last Updated:** 2025-12-22  
**Next Review:** 2026-01-22






