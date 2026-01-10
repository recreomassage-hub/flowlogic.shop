# Команда: /specify

Создает спецификацию для новой фичи в формате Spec-Driven Development.

## Использование

```
/specify

Feature: {название фичи}

REQUIREMENTS:
{детальные требования}

SUCCESS CRITERIA:
{критерии успеха}

EDGE CASES:
{граничные случаи}

INTEGRATION POINTS:
{точки интеграции с существующей системой}
```

## Процесс

1. AI читает `.specify/constitution.md` для понимания стандартов
2. AI создает `.specify/features/{feature-name}/spec.md`
3. Спецификация включает:
   - Overview (краткое описание)
   - Requirements (детальные требования)
   - Success Criteria (критерии успеха)
   - Edge Cases (граничные случаи)
   - Integration Points (точки интеграции)
   - Technical Constraints (если есть)

## Пример

```
/specify

Feature: Video Recording for Assessments

REQUIREMENTS:
- User can record video directly in browser (WebRTC)
- Video max duration: 60 seconds
- Video format: WebM (fallback to MP4)
- Upload to S3 using presigned URL from backend
- Show recording progress
- Allow retry if upload fails
- Store video URL in assessment record

SUCCESS CRITERIA:
- Recording starts within 1 second
- Upload completes within 5 seconds for 60s video
- Error handling for camera permissions
- Mobile responsive
- Works in Chrome, Firefox, Safari
```

## После создания

1. Проверьте spec.md вручную
2. Используйте `/clarify` для уточнения неясных моментов
3. Используйте `/plan` для создания технического плана



