#!/bin/bash
# llmos-commands.sh - Утилиты для управления LLM-OS (40 промптов система)

get_current_stage() {
    grep "current_stage" WORKFLOW_STATE.md 2>/dev/null | head -1 | cut -d':' -f2 | tr -d ' *'
}

get_current_role() {
    grep "current_role" WORKFLOW_STATE.md 2>/dev/null | head -1 | cut -d':' -f2 | tr -d ' *'
}

get_next_prompt() {
    stage=$(get_current_stage)
    role=$(get_current_role)
    
    # Маппинг этапов на промпты (оптимизированная схема: EXECUTE → PEER-REVIEW)
    case "$stage" in
        "tz_analyst"|"tz") echo "00_tz_analyst.md" ;;
        "tz_review"|"tz_reviewer") echo "00_tz_reviewer.md" ;;
        "requirements_execute"|"requirements") echo "01_analyst_execute.md" ;;
        "requirements_peer_review") echo "02_architect_peer_review.md" ;;
        "architecture_execute"|"architecture") echo "03_architect_execute.md" ;;
        "architecture_peer_review") echo "04_pm_peer_review.md" ;;
        "planning_execute"|"planning") echo "05_pm_execute.md" ;;
        "planning_peer_review") echo "06_backend_peer_review.md" ;;
        "backend_execute"|"backend") echo "07_backend_execute.md" ;;
        "backend_peer_review") echo "08_frontend_peer_review.md" ;;
        "frontend_execute"|"frontend") echo "09_frontend_execute.md" ;;
        "frontend_peer_review") echo "10_infra_peer_review.md" ;;
        "infra_execute"|"infra") echo "11_infra_execute.md" ;;
        "infra_peer_review") echo "12_qa_peer_review.md" ;;
        "qa_execute"|"qa") echo "13_qa_execute.md" ;;
        "qa_peer_review") echo "14_security_peer_review.md" ;;
        "security_execute"|"security") echo "15_security_execute.md" ;;
        "security_peer_review") echo "16_docs_peer_review.md" ;;
        "docs_execute"|"docs") echo "17_docs_execute.md" ;;
        "docs_peer_review") echo "18_owner_peer_review.md" ;;
        "owner_final_approve"|"owner") echo "19_owner_approve.md" ;;
        *) echo "" ;;
    esac
}

case "$1" in
    "tz-full")
        echo "🎯 TZ Pipeline: Запуск полного цикла TZ"
        echo "1. TZ Analyst → 2. TZ Reviewer → APPROVED"
        echo "Используй промпты: PROMPTS/00_tz_analyst.md → PROMPTS/00_tz_reviewer.md"
        ;;
    "next")
        # Проверяем сценарий и пропускаем ненужные роли
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        CURRENT_ROLE=$(get_current_role)
        
        # Проверяем, включена ли текущая роль в сценарии
        if [ -f "$SCRIPT_DIR/scripts/read_scenario.sh" ]; then
            IS_ENABLED=$("$SCRIPT_DIR/scripts/read_scenario.sh" enabled "$CURRENT_ROLE")
            SCENARIO_NAME=$("$SCRIPT_DIR/scripts/read_scenario.sh" name)
            
            if [ "$IS_ENABLED" = "false" ]; then
                echo "⏭️  Роль $CURRENT_ROLE пропущена в сценарии '$SCENARIO_NAME'"
                echo "📋 Переход к следующей включенной роли..."
                echo ""
                # TODO: Автоматический переход к следующей включенной роли
                # Пока просто показываем следующий промпт
            else
                echo "✅ Роль $CURRENT_ROLE включена в сценарии '$SCENARIO_NAME'"
                echo ""
            fi
        fi
        
        prompt=$(get_next_prompt)
        if [ -n "$prompt" ]; then
            echo "🔄 Следующий промпт: PROMPTS/$prompt"
            if [ -f "PROMPTS/$prompt" ]; then
                cat "PROMPTS/$prompt"
            else
                echo "❌ Промпт не найден: PROMPTS/$prompt"
            fi
        else
            echo "❌ Не удалось определить следующий промпт"
            echo "Текущий этап: $(get_current_stage)"
            echo "Текущая роль: $(get_current_role)"
        fi
        ;;
    "execute")
        role=${2:-$(get_current_role)}
        echo "⚙️ EXECUTE режим для $role"
        case "$role" in
            "ANALYST") cat PROMPTS/01_analyst_execute.md ;;
            "ARCHITECT") cat PROMPTS/03_architect_execute.md ;;
            "PM") cat PROMPTS/05_pm_execute.md ;;
            "BACKEND_DEV") cat PROMPTS/07_backend_execute.md ;;
            "FRONTEND_DEV") cat PROMPTS/09_frontend_execute.md ;;
            "INFRA_DEVOPS") cat PROMPTS/11_infra_execute.md ;;
            "QA") cat PROMPTS/13_qa_execute.md ;;
            "SECURITY") cat PROMPTS/15_security_execute.md ;;
            "DOCS") cat PROMPTS/17_docs_execute.md ;;
            *) echo "❌ Неизвестная роль: $role" ;;
        esac
        ;;
    "self")
        echo "⚠️ SELF-REVIEW удален из системы (0 ценность, галлюцинации агента)"
        echo "Используйте: ./llmos peer ROLE для peer-review"
        ;;
    "peer")
        role=${2:-$(get_current_role)}
        echo "👥 PEER-REVIEW для $role"
        case "$role" in
            "ANALYST") cat PROMPTS/02_architect_peer_review.md ;;
            "ARCHITECT") cat PROMPTS/04_pm_peer_review.md ;;
            "PM") cat PROMPTS/06_backend_peer_review.md ;;
            "BACKEND_DEV") cat PROMPTS/08_frontend_peer_review.md ;;
            "FRONTEND_DEV") cat PROMPTS/10_infra_peer_review.md ;;
            "INFRA_DEVOPS") cat PROMPTS/12_qa_peer_review.md ;;
            "QA") cat PROMPTS/14_security_peer_review.md ;;
            "SECURITY") cat PROMPTS/16_docs_peer_review.md ;;
            "DOCS") cat PROMPTS/18_owner_peer_review.md ;;
            *) echo "❌ Неизвестная роль: $role" ;;
        esac
        ;;
    "approve")
        echo "👑 OWNER Final Approval"
        cat PROMPTS/19_owner_approve.md
        ;;
    "status")
        echo "📊 Статус системы:"
        echo "  Этап: $(get_current_stage)"
        echo "  Роль: $(get_current_role)"
        echo "  Следующий промпт: $(get_next_prompt)"
        grep "выполнено:" WORKFLOW_STATE.md 2>/dev/null | head -1 || echo "  Прогресс: не найден"
        ;;
    "commit"|"step")
        echo "💾 Выполнение коммита..."
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        "$SCRIPT_DIR/step.sh"
        ;;
    "monitor")
        # Определяем корень проекта (где находится monitor.sh)
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        MONITOR_SCRIPT="$SCRIPT_DIR/monitor.sh"
        
        if [ -f "$MONITOR_SCRIPT" ]; then
            "$MONITOR_SCRIPT"
        else
            echo "❌ monitor.sh не найден в $SCRIPT_DIR"
            exit 1
        fi
        ;;
    "check-ssm"|"ssm")
        # Определяем корень проекта (где находится scripts/check_ssm_params.sh)
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        SSM_SCRIPT="$SCRIPT_DIR/scripts/check_ssm_params.sh"
        
        if [ -f "$SSM_SCRIPT" ]; then
            "$SSM_SCRIPT"
        else
            echo "❌ scripts/check_ssm_params.sh не найден в $SCRIPT_DIR"
            exit 1
        fi
        ;;
    "deploy")
        echo "🚀 LLM-OS: Production Deployment"
        echo "================================"
        echo ""
        
        # Проверяем статус проекта
        STATUS=$(grep "overall_status" WORKFLOW_STATE.md 2>/dev/null | head -1 | cut -d':' -f2 | tr -d ' *')
        if [ "$STATUS" != "PRODUCTION_READY" ]; then
            echo "⚠️  Внимание: Проект не готов к production"
            echo "   Текущий статус: $STATUS"
            echo "   Требуется: PRODUCTION_READY"
            echo ""
            read -p "Продолжить деплой? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "❌ Деплой отменен"
                exit 1
            fi
        fi
        
        # Получаем версию из WORKFLOW_STATE.md или используем 1.0.0
        VERSION=$(grep -i "version" WORKFLOW_STATE.md 2>/dev/null | head -1 | sed 's/.*version[^:]*:[[:space:]]*//' | sed 's/[[:space:]]*$//' | tr -d '*')
        if [ -z "$VERSION" ] || [ "$VERSION" = "" ]; then
            VERSION="1.0.0"
        fi
        TAG="v${VERSION}"
        
        echo "📦 Создание git tag: $TAG"
        if git tag -a "$TAG" -m "Release $TAG - Production deployment" 2>/dev/null; then
            echo "✅ Tag создан: $TAG"
        else
            if git rev-parse "$TAG" >/dev/null 2>&1; then
                echo "⚠️  Tag $TAG уже существует"
                read -p "Перезаписать? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    git tag -d "$TAG" 2>/dev/null
                    git tag -a "$TAG" -m "Release $TAG - Production deployment"
                    echo "✅ Tag перезаписан: $TAG"
                fi
            else
                echo "❌ Ошибка создания tag"
                exit 1
            fi
        fi
        
        echo ""
        echo "📤 Push tags в remote..."
        REMOTE=$(git remote get-url flowlogic 2>/dev/null || git remote get-url origin 2>/dev/null || echo "origin")
        if git push "$REMOTE" "$TAG" 2>/dev/null; then
            echo "✅ Tags отправлены в $REMOTE"
        else
            echo "⚠️  Не удалось отправить tags (возможно, нет прав или нет сети)"
        fi
        
        echo ""
        echo "🚀 Инструкции для деплоя:"
        echo ""
        echo "1. Frontend (Vercel):"
        echo "   cd src/frontend"
        echo "   vercel deploy --prod"
        echo "   # или через GitHub Actions (автоматически при push в main)"
        echo ""
        echo "2. Backend (AWS Serverless):"
        echo "   cd infra/serverless"
        echo "   serverless deploy --stage production"
        echo "   # Требуется: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
        echo ""
        echo "3. Проверка деплоя:"
        echo "   - Frontend: https://flowlogic.shop (или ваш Vercel URL)"
        echo "   - Backend: Проверить API Gateway endpoint"
        echo "   - Smoke tests: npm run test:smoke -- --env=production"
        echo ""
        echo "📚 Подробнее: docs/deployment_guide.md"
        echo ""
        echo "✅ Tag $TAG создан и отправлен. Готово к деплою!"
        ;;
    "feature")
        case "$2" in
            "new")
                FEATURE_NAME="${3}"
                DESCRIPTION="${4:-}"
                if [ -z "$FEATURE_NAME" ]; then
                    echo "❌ Укажите название фичи"
                    echo "Использование: ./llmos feature new <feature_name> [description]"
                    exit 1
                fi
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                "$SCRIPT_DIR/scripts/feature_new.sh" "$FEATURE_NAME" "$DESCRIPTION"
                ;;
            "impact")
                FEATURE_SLUG="${3}"
                if [ -z "$FEATURE_SLUG" ]; then
                    echo "❌ Укажите slug фичи"
                    echo "Использование: ./llmos feature impact <feature_slug>"
                    exit 1
                fi
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                "$SCRIPT_DIR/scripts/feature_impact.sh" "$FEATURE_SLUG"
                ;;
            "check-flag"|"flag")
                FEATURE_SLUG="${3}"
                if [ -z "$FEATURE_SLUG" ]; then
                    echo "❌ Укажите slug фичи"
                    echo "Использование: ./llmos feature check-flag <feature_slug>"
                    exit 1
                fi
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                "$SCRIPT_DIR/scripts/feature_check_flag.sh" "$FEATURE_SLUG"
                ;;
            "retro")
                FEATURE_SLUG="${3}"
                if [ -z "$FEATURE_SLUG" ]; then
                    echo "❌ Укажите slug фичи"
                    echo "Использование: ./llmos feature retro <feature_slug>"
                    exit 1
                fi
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                "$SCRIPT_DIR/scripts/feature_retro.sh" "$FEATURE_SLUG"
                ;;
            "list")
                echo "📋 Список фич:"
                if [ -d "docs/features" ]; then
                    for dir in docs/features/*/; do
                        if [ -d "$dir" ]; then
                            SLUG=$(basename "$dir")
                            NAME=$(grep -E "^# Feature:" "${dir}feature_brief.md" 2>/dev/null | sed 's/# Feature: //' || echo "$SLUG")
                            STATUS=$(grep -E "^\\*\\*Статус:\\*\\*" "${dir}feature_brief.md" 2>/dev/null | sed 's/\*\*Статус:\*\* //' || echo "UNKNOWN")
                            echo "  • $SLUG - $NAME ($STATUS)"
                        fi
                    done
                else
                    echo "  Нет фич"
                fi
                ;;
            *)
                echo "🚀 Feature Workflow Commands:"
                echo "  ./llmos feature new <name> [desc]     - Создать новую фичу"
                echo "  ./llmos feature impact <slug>        - Анализ влияния"
                echo "  ./llmos feature check-flag <slug>      - Проверить feature flag"
                echo "  ./llmos feature retro <slug>          - Ретроспектива"
                echo "  ./llmos feature list                   - Список фич"
                echo ""
                echo "См. также: docs/features/feature_workflow.md"
                ;;
        esac
        ;;
    "run")
        # 🎛️ SCENARIO ENGINE - Автоматическое выполнение сценария
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        "$SCRIPT_DIR/scripts/scenario_engine.sh" run
        ;;
    "execute")
        # 🎛️ SCENARIO ENGINE - Выполнить автодействия и перейти к следующей фазе
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        "$SCRIPT_DIR/scripts/scenario_engine.sh" execute
        ;;
    "scenario"|"sc")
        # Управление сценариями
        case "$2" in
            "list")
                # 📋 SCENARIO LIST - Показать доступные сценарии
                echo "📋 Доступные сценарии:"
                echo ""
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                SCENARIOS_DIR="$SCRIPT_DIR/SCENARIOS"
                
                if [ -d "$SCENARIOS_DIR" ]; then
                    for file in "$SCENARIOS_DIR"/*.yml; do
                        if [ -f "$file" ]; then
                            SCENARIO_NAME=$(basename "$file" .yml)
                            NAME=$(grep "^name:" "$file" 2>/dev/null | cut -d: -f2 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || echo "$SCENARIO_NAME")
                            DESC=$(grep "^description:" "$file" 2>/dev/null | cut -d: -f2 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sed 's/"//g' || echo "No description")
                            
                            # Проверяем, выбран ли этот сценарий
                            CURRENT=$(grep -E "^\\*\\*Выбранный сценарий:\\*\\*" "$SCRIPT_DIR/PROJECT_CONFIG.md" 2>/dev/null | sed 's/\*\*Выбранный сценарий:\*\* //' | sed 's/`//g' | sed 's/ (.*//' || echo "")
                            if [ "$SCENARIO_NAME" = "$CURRENT" ]; then
                                echo "  ✅ $SCENARIO_NAME - $NAME (текущий)"
                            else
                                echo "  • $SCENARIO_NAME - $NAME"
                            fi
                            echo "     $DESC"
                            echo ""
                        fi
                    done
                else
                    echo "  ❌ Папка SCENARIOS/ не найдена"
                fi
                
                # Показываем также FSM сценарии
                echo "📋 FSM Сценарии (scenarios/):"
                if [ -d "$SCRIPT_DIR/scenarios" ]; then
                    for file in "$SCRIPT_DIR/scenarios"/*.yml; do
                        if [ -f "$file" ]; then
                            SCENARIO_NAME=$(basename "$file" .yml)
                            echo "  • $SCENARIO_NAME (FSM сценарий)"
                        fi
                    done
                fi
                ;;
            "start")
                # 🚀 SCENARIO START - Выбрать сценарий
                SCENARIO_NAME="${3}"
                if [ -z "$SCENARIO_NAME" ]; then
                    echo "❌ Укажите название сценария"
                    echo "Использование: ./llmos scenario start <scenario_name>"
                    echo ""
                    echo "Доступные сценарии:"
                    echo "  ./llmos scenario list"
                    exit 1
                fi
                
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                SCENARIO_FILE="$SCRIPT_DIR/SCENARIOS/${SCENARIO_NAME}.yml"
                
                if [ ! -f "$SCENARIO_FILE" ]; then
                    echo "❌ Сценарий не найден: $SCENARIO_FILE"
                    echo "Доступные сценарии:"
                    echo "  ./llmos scenario list"
                    exit 1
                fi
                
                # Обновляем PROJECT_CONFIG.md
                if grep -q "\\*\\*Выбранный сценарий:\\*\\*" "$SCRIPT_DIR/PROJECT_CONFIG.md" 2>/dev/null; then
                    sed -i "s|\\*\\*Выбранный сценарий:\\*\\* \`[^\`]*\`|\\*\\*Выбранный сценарий:\\*\\* \`${SCENARIO_NAME}\`|" "$SCRIPT_DIR/PROJECT_CONFIG.md"
                    sed -i "s|\\*\\*Файл сценария:\\*\\* \`[^\`]*\`|\\*\\*Файл сценария:\\*\\* \`SCENARIOS/${SCENARIO_NAME}.yml\`|" "$SCRIPT_DIR/PROJECT_CONFIG.md"
                else
                    # Добавляем секцию, если её нет
                    sed -i "/^## 🎬 СЦЕНАРИЙ ПРОЕКТА/a\\
**Выбранный сценарий:** \`${SCENARIO_NAME}\`\\
\\
**Файл сценария:** \`SCENARIOS/${SCENARIO_NAME}.yml\`\\
" "$SCRIPT_DIR/PROJECT_CONFIG.md"
                fi
                
                NAME=$(grep "^name:" "$SCENARIO_FILE" 2>/dev/null | cut -d: -f2 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || echo "$SCENARIO_NAME")
                echo "✅ Сценарий выбран: $SCENARIO_NAME - $NAME"
                echo "📋 PROJECT_CONFIG.md обновлен"
                echo ""
                echo "Следующий шаг: ./llmos next (проверит сценарий и пропустит ненужные роли)"
                ;;
            "run")
                # ▶ SCENARIO RUN - Выполнить автодействия текущей фазы
                echo "▶ SCENARIO RUN"
                echo ""
                
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                "$SCRIPT_DIR/scripts/scenario_engine.sh" execute
                ;;
            "status")
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                "$SCRIPT_DIR/scripts/scenario_engine.sh" status
                ;;
            "set")
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                "$SCRIPT_DIR/scripts/scenario_engine.sh" set "$3" "$4"
                ;;
            "next")
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                "$SCRIPT_DIR/scripts/scenario_engine.sh" next-phase
                ;;
            *)
                echo "🎛️ Управление сценариями:"
                echo "  ./llmos scenario list         - Показать доступные сценарии"
                echo "  ./llmos scenario start <name> - Выбрать сценарий (записывает в PROJECT_CONFIG.md)"
                echo "  ./llmos scenario run         - Выполнить автодействия текущей фазы"
                echo "  ./llmos scenario status      - Показать статус сценария"
                echo "  ./llmos scenario set <S> [P]  - Установить сценарий (системные события)"
                echo "  ./llmos scenario next        - Перейти к следующей фазе"
                echo ""
                echo "📋 Сценарии маршрутов (SCENARIOS/): saas_mvp, docs_only, refactor"
                echo "📋 FSM Сценарии (scenarios/): PROJECT_BOOTSTRAP, FEATURE_DEVELOPMENT, DEPLOYMENT,"
                echo "          INCIDENT_RECOVERY, QUALITY_GATE, ROLLBACK, MAINTENANCE"
                ;;
        esac
        ;;
    "branch"|"br")
        # Управление Git ветками
        case "$2" in
            "create"|"new")
                STAGE="${3}"
                if [ -z "$STAGE" ]; then
                    echo "❌ Укажите название этапа"
                    echo "Использование: ./llmos branch create <stage>"
                    echo ""
                    echo "Примеры:"
                    echo "  ./llmos branch create requirements"
                    echo "  ./llmos branch create architecture"
                    exit 1
                fi
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                "$SCRIPT_DIR/scripts/create_feature_branch.sh" "$STAGE"
                ;;
            "merge")
                SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
                "$SCRIPT_DIR/scripts/merge_to_develop.sh"
                ;;
            "status")
                CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
                echo "🌿 Текущая ветка: $CURRENT_BRANCH"
                echo ""
                echo "📋 Ветки:"
                git branch -a 2>/dev/null | head -10 || echo "  (не удалось получить список веток)"
                ;;
            *)
                echo "🌿 Управление Git ветками:"
                echo "  ./llmos branch create <stage>  - Создать feature ветку для этапа"
                echo "  ./llmos branch merge           - Merge текущей feature ветки в develop"
                echo "  ./llmos branch status          - Показать статус веток"
                echo ""
                echo "📚 См. также: docs/git_workflow.md"
                ;;
        esac
        ;;
    "plan")
        # 🎯 PLAN режим - Создание плана для сложной задачи
        TASK_NAME="${2}"
        if [ -z "$TASK_NAME" ]; then
            echo "❌ Укажите название задачи"
            echo "Использование: ./llmos plan <task_name>"
            echo ""
            echo "Примеры:"
            echo "  ./llmos plan backend_refactor"
            echo "  ./llmos plan frontend-ui-redesign"
            echo "  ./llmos plan auth-migration"
            exit 1
        fi
        
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        OUTPUT_DIR="$SCRIPT_DIR/artifacts"
        mkdir -p "$OUTPUT_DIR"
        
        # Определяем тип задачи и собираем контекст
        if [[ "$TASK_NAME" == *"backend"* ]] || [[ "$TASK_NAME" == *"auth"* ]]; then
            echo "🔍 Сбор контекста для backend..."
            "$SCRIPT_DIR/scripts/collect/backend-auth.sh" > "$OUTPUT_DIR/PLAN_${TASK_NAME}.md" 2>&1 || true
        elif [[ "$TASK_NAME" == *"frontend"* ]] || [[ "$TASK_NAME" == *"ui"* ]]; then
            echo "🔍 Сбор контекста для frontend..."
            "$SCRIPT_DIR/scripts/collect/frontend-ui.sh" > "$OUTPUT_DIR/PLAN_${TASK_NAME}.md" 2>&1 || true
        else
            echo "🔍 Сбор контекста по ключевым словам..."
            "$SCRIPT_DIR/scripts/collect/smart.sh" $TASK_NAME > "$OUTPUT_DIR/PLAN_${TASK_NAME}.md" 2>&1 || true
        fi
        
        PLAN_FILE="$OUTPUT_DIR/PLAN_${TASK_NAME}.md"
        echo ""
        echo "✅ Контекст собран: $PLAN_FILE"
        echo ""
        echo "📋 Следующий шаг:"
        echo "  1. Прочитай $PLAN_FILE"
        echo "  2. Создай план: фазы, чек-лист, правила стиля"
        echo "  3. Запиши план в artifacts/PLAN_${TASK_NAME}_plan.md"
        echo ""
        echo "   Затем: ./llmos build $TASK_NAME phase-1"
        ;;
    "build")
        # 🔨 BUILD режим - Реализация по плану
        TASK_NAME="${2}"
        PHASE="${3:-phase-1}"
        
        if [ -z "$TASK_NAME" ]; then
            echo "❌ Укажите название задачи"
            echo "Использование: ./llmos build <task_name> [phase]"
            echo ""
            echo "Примеры:"
            echo "  ./llmos build backend_refactor phase-1"
            echo "  ./llmos build frontend-ui-redesign phase-2"
            exit 1
        fi
        
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        PLAN_FILE="$SCRIPT_DIR/artifacts/PLAN_${TASK_NAME}_plan.md"
        CONTEXT_FILE="$SCRIPT_DIR/artifacts/PLAN_${TASK_NAME}.md"
        
        if [ ! -f "$PLAN_FILE" ]; then
            echo "⚠️  План не найден: $PLAN_FILE"
            echo "   Сначала создай план: ./llmos plan $TASK_NAME"
            exit 1
        fi
        
        echo "🔨 BUILD режим: $TASK_NAME ($PHASE)"
        echo ""
        echo "📋 План: $PLAN_FILE"
        if [ -f "$CONTEXT_FILE" ]; then
            echo "📄 Контекст: $CONTEXT_FILE"
        fi
        echo ""
        echo "✅ Реализуй только фазу: $PHASE"
        echo "   Следуй строго плану из $PLAN_FILE"
        echo "   Используй контекст из $CONTEXT_FILE"
        ;;
    "collect")
        # 🔍 COLLECT - Сбор контекста
        TYPE="${2}"
        ARGS="${@:3}"
        
        if [ -z "$TYPE" ]; then
            echo "🔍 Сбор контекста:"
            echo "  ./llmos collect backend-auth     - Backend authentication"
            echo "  ./llmos collect frontend-ui      - Frontend UI"
            echo "  ./llmos collect smart <keywords>  - Умный поиск по ключевым словам"
            exit 1
        fi
        
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        
        case "$TYPE" in
            "backend-auth")
                "$SCRIPT_DIR/scripts/collect/backend-auth.sh"
                ;;
            "frontend-ui")
                "$SCRIPT_DIR/scripts/collect/frontend-ui.sh"
                ;;
            "smart")
                if [ -z "$ARGS" ]; then
                    echo "❌ Укажите ключевые слова"
                    echo "Использование: ./llmos collect smart keyword1 keyword2 ..."
                    exit 1
                fi
                "$SCRIPT_DIR/scripts/collect/smart.sh" $ARGS
                ;;
            *)
                echo "❌ Неизвестный тип: $TYPE"
                echo "Доступные: backend-auth, frontend-ui, smart"
                exit 1
                ;;
        esac
        ;;
    "help")
        echo "🚀 LLM-OS Команды (27 промптов система + сценарный режим):"
        echo ""
        echo "🎯 PLAN/BUILD РЕЖИМ (NEW):"
        echo "  ./llmos plan <task>           - Собрать контекст и создать план"
        echo "  ./llmos build <task> [phase]   - Реализовать фазу по плану"
        echo "  ./llmos collect <type>        - Сбор контекста (backend-auth, frontend-ui, smart)"
        echo ""
        echo "🎛️ СЦЕНАРНЫЙ РЕЖИМ (NEW):"
        echo "  ./llmos run              - Показать информацию о текущей фазе"
        echo "  ./llmos execute          - Выполнить автодействия и перейти к следующей фазе"
        echo "  ./llmos scenario run     - Выполнить автодействия текущей фазы (АВТОМАТИЧЕСКИ)"
        echo "  ./llmos scenario status  - Показать статус сценария"
        echo "  ./llmos scenario set <S> [P] - Установить сценарий (системные события)"
        echo "  ./llmos scenario next    - Перейти к следующей фазе"
        echo ""
        echo "🌿 GIT WORKFLOW (NEW):"
        echo "  ./llmos branch create <stage>  - Создать feature ветку для этапа"
        echo "  ./llmos branch merge           - Merge feature ветки в develop"
        echo "  ./llmos branch status          - Показать статус веток"
        echo ""
        echo "📋 КЛАССИЧЕСКИЕ КОМАНДЫ:"
        echo "  ./llmos tz-full        - TZ Pipeline (полный цикл)"
        echo "  ./llmos next           - Показать следующий промпт (EXECUTE → PEER)"
        echo "  ./llmos execute [ROLE] - EXECUTE режим для роли"
        echo "  ./llmos peer [ROLE]    - PEER-REVIEW режим для роли"
        echo "  ./llmos approve        - OWNER Final Approval"
        echo "  ./llmos status         - Показать статус (WORKFLOW_STATE)"
        echo "  ./llmos commit|step    - Сделать коммит (атомарный)"
        echo "  ./llmos monitor        - Запустить мониторинг"
        echo "  ./llmos check-ssm|ssm  - Проверить SSM параметры (все окружения)"
        echo "  ./llmos deploy         - Production deployment (tag + инструкции)"
        echo ""
        echo "🚀 FEATURE WORKFLOW:"
        echo "  ./llmos feature new <name> [desc]     - Создать новую фичу"
        echo "  ./llmos feature impact <slug>        - Анализ влияния"
        echo "  ./llmos feature check-flag <slug>    - Проверить feature flag"
        echo "  ./llmos feature retro <slug>         - Ретроспектива"
        echo "  ./llmos feature list                - Список фич"
        echo ""
        echo "📚 Документация:"
        echo "  docs/scenarios/scenarios_reference.md - Справочник сценариев"
        echo "  docs/git_workflow.md                   - Git workflow"
        echo "  SCENARIO_STATE.yml                     - Текущее состояние"
        echo ""
        echo "Роли: ANALYST, ARCHITECT, PM, BACKEND_DEV, FRONTEND_DEV,"
        echo "      INFRA_DEVOPS, QA, SECURITY, DOCS, OWNER"
        echo ""
        echo "⚠️ SELF-REVIEW удален (0 ценность, галлюцинации агента)"
        ;;
    *)
        echo "Используйте: ./llmos [run|scenario|tz-full|next|execute|self|peer|approve|status|commit|step|monitor|check-ssm|ssm|deploy|feature|help]"
        echo ""
        echo "Для справки: ./llmos help"
        ;;
esac


