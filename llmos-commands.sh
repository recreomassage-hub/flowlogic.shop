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
    "commit")
        echo "💾 Выполнение коммита..."
        ./step.sh
        ;;
    "help")
        echo "🚀 LLM-OS Команды (27 промптов система, оптимизировано):"
        echo "  ./llmos tz-full        - TZ Pipeline (полный цикл)"
        echo "  ./llmos next           - Показать следующий промпт (EXECUTE → PEER)"
        echo "  ./llmos execute [ROLE] - EXECUTE режим для роли"
        echo "  ./llmos peer [ROLE]    - PEER-REVIEW режим для роли"
        echo "  ./llmos approve        - OWNER Final Approval"
        echo "  ./llmos status         - Показать статус"
        echo "  ./llmos commit         - Сделать коммит"
        echo "  ./llmos help           - Показать эту справку"
        echo ""
        echo "Роли: ANALYST, ARCHITECT, PM, BACKEND_DEV, FRONTEND_DEV,"
        echo "      INFRA_DEVOPS, QA, SECURITY, DOCS, OWNER"
        echo ""
        echo "⚠️ SELF-REVIEW удален (0 ценность, галлюцинации агента)"
        ;;
    *)
        echo "Используйте: ./llmos [tz-full|next|execute|self|peer|approve|status|commit|help]"
        ;;
esac


