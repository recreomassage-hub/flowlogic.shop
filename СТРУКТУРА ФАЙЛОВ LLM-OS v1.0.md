# 🗂️ **СТРУКТУРА ФАЙЛОВ LLM-OS v1.0**

text

llm-os-project/                          # Корень проекта
├── 📁 .cursor/                          # Правила для Cursor IDE
│   └── 📁 rules/                        # Дополнительные правила
│       ├── 📄 auto_update_date.mdc     # Автообновление даты
│       ├── 📄 check_workflow.mdc       # Проверка workflow
│       └── 📄 progress_tracker.mdc     # Трекер прогресса
├── 📁 .templates/                       # Шаблоны для быстрого создания
│   ├── 📄 stage_template.md            # Шаблон этапа
│   └── 📄 role_template.md             # Шаблон роли
├── 📁 docs/                             # Документация и артефакты проекта
│   ├── 📁 requirements/                 # Требования (ANALYST)
│   │   ├── 📄 PRD.md                   # Product Requirements Document
│   │   ├── 📄 user_stories.md          # User Stories
│   │   ├── 📄 glossary.md              # Глоссарий терминов
│   │   ├── 📄 qna.md                   # Вопросы и ответы
│   │   └── 📄 non_functional.md        # Нефункциональные требования
│   ├── 📁 architecture/                 # Архитектура (ARCHITECT)
│   │   ├── 📄 c4_diagrams.md           # C4 диаграммы (Mermaid)
│   │   ├── 📄 db_schema.md             # Схема БД (Mermaid)
│   │   ├── 📄 api_spec.yaml            # OpenAPI спецификация
│   │   ├── 📄 tech_stack.md            # Технологический стек
│   │   └── 📁 adr/                     # Architecture Decision Records
│   │       └── 📄 001-initial-architecture.md
│   ├── 📁 planning/                     # Планирование (PM)
│   │   ├── 📄 epics.md                 # Эпики проекта
│   │   ├── 📄 sprint_plan.md           # План спринтов
│   │   └── 📄 roadmap.md               # Дорожная карта
│   ├── 📁 api/                          # API документация
│   ├── 📁 decisions/                    # Решения по проекту
│   └── 📁 testing/                      # Тестовая документация
├── 📁 infra/                            # Инфраструктура (INFRA_DEVOPS)
│   ├── 📁 docker/                       # Docker конфигурации
│   ├── 📁 kubernetes/                   # K8s манифесты
│   ├── 📁 terraform/                    # Terraform конфигурации
│   └── 📁 ci-cd/                        # CI/CD пайплайны
├── 📁 reports/                          # Автоматические отчеты
│   ├── 📄 progress_20240115_103000.md  # Пример отчета
│   └── 📄 initial_report.md            # Начальный отчет
├── 📁 ROLES/                            # ИНСТРУКЦИИ ДЛЯ РОЛЕЙ
│   ├── 📄 01_analyst.md                # 🎯 ANALYST (Аналитик)
│   ├── 📄 02_architect.md              # 🏗️ ARCHITECT (Архитектор)
│   ├── 📄 03_pm.md                     # 📅 PM (Менеджер проектов)
│   ├── 📄 04_backend_dev.md            # ⚙️ BACKEND_DEV (Бэкенд)
│   ├── 📄 05_frontend_dev.md           # 🎨 FRONTEND_DEV (Фронтенд)
│   ├── 📄 06_infra_devops.md           # 🚀 INFRA_DEVOPS (DevOps)
│   ├── 📄 07_qa.md                     # 🧪 QA (Тестировщик)
│   └── 📄 08_docs.md                   # 📚 DOCS (Техписатель)
├── 📁 src/                              # Исходный код (будет создан позже)
│   ├── 📁 backend/                      # Бэкенд код (BACKEND_DEV)
│   ├── 📁 frontend/                     # Фронтенд код (FRONTEND_DEV)
│   └── 📁 shared/                       # Общий код
├── 📄 .cursorrules                     # 🧠 ЯДРО СИСТЕМЫ (поведение ИИ)
├── 📄 .gitignore                       # Git ignore файл
├── 📄 PROJECT_CONFIG.md                # 🎯 ROM (Read-Only Memory)
├── 📄 WORKFLOW_STATE.md                # 📊 RAM (Random Access Memory)
├── 📄 SYSTEM_README.md                 # 📖 Общее описание системы
├── 📄 CHANGELOG.md                     # 📝 История изменений
├── 🚀 **СКРИПТЫ УПРАВЛЕНИЯ:**
├── 📄 setup_workflow.sh                # 🛠️ Инициализация системы
├── 📄 step.sh                          # 💾 Атомарный коммит
├── 📄 monitor.sh                       # 📊 Мониторинг (Linux)
├── 📄 copy_prompt.sh                   # 📋 Копирование промпта
├── 📄 show_prompt.sh                   # 📋 Показ промпта
├── 📄 check-linux.sh                   # 🔍 Проверка системы
├── 📄 launch-llmos.sh                  # 🚀 Запуск в tmux
├── 📄 llmos-commands.sh                # 🐧 Утилита управления
├── 📄 quick_commands.sh                # ⚡ Быстрые команды
├── 📄 start_workflow.sh                # ▶️ Стартовый скрипт
├── 📄 generate_report.py               # 📈 Отчеты (Python)
├── 📄 generate_report.sh               # 📈 Отчеты (Bash)
└── 📄 test_workflow.md