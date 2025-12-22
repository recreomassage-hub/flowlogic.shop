#!/bin/bash
echo "🔍 ДИАГНОСТИКА LLM-OS"
echo "===================="

echo "1. Текущая папка:"
pwd

echo ""
echo "2. Файлы и права:"
ls -la *.sh

echo ""
echo "3. Проверка step.sh:"
if [ -f "step.sh" ]; then
    echo "✅ step.sh существует"
    echo "   Права: $(ls -la step.sh | awk '{print $1}')"
    echo "   Shebang: $(head -1 step.sh)"
else
    echo "❌ step.sh не найден"
fi

echo ""
echo "4. Проверка запуска:"
./step.sh 2>&1 || echo "   Ошибка при запуске"

echo ""
echo "5. Проверка через bash:"
bash step.sh 2>&1 || echo "   Ошибка bash"

echo ""
echo "6. Переменная PATH:"
echo $PATH
