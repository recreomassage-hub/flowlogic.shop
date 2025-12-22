#!/usr/bin/env python3
# generate_report.py - Анализ прогресса из WORKFLOW_STATE.md

import re
from datetime import datetime

def parse_workflow_state():
    try:
        with open('WORKFLOW_STATE.md', 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print("❌ WORKFLOW_STATE.md не найден")
        return None
    
    # Парсим этапы
    stages = re.findall(r'###.*?\n(.*?)(?=###|$)', content, re.DOTALL)
    
    report = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'stages': []
    }
    
    for stage in stages:
        # Извлекаем данные
        name_match = re.search(r'### (.*?)\n', stage)
        status_match = re.search(r'\*\*статус\*\*: `(.*?)`', stage)
        progress_match = re.search(r'\*\*выполнено\*\*: (\d+)/(\d+) задач', stage)
        
        if name_match and status_match:
            stage_data = {
                'name': name_match.group(1).strip(),
                'status': status_match.group(1),
                'progress': None
            }
            
            if progress_match:
                done = int(progress_match.group(1))
                total = int(progress_match.group(2))
                stage_data['progress'] = {
                    'done': done,
                    'total': total,
                    'percentage': int(done / total * 100) if total > 0 else 0
                }
            
            report['stages'].append(stage_data)
    
    return report

def print_report(report):
    if not report:
        return
        
    print(f"📊 Отчет о прогрессе ({report['timestamp']})")
    print("=" * 50)
    
    for stage in report['stages']:
        status_emoji = {
            'NOT_STARTED': '⏳',
            'IN_PROGRESS': '🚧',
            'DONE': '✅',
            'BLOCKED': '⛔',
            'READY_FOR_REVIEW': '👀',
            'APPROVED': '👍'
        }.get(stage['status'], '❓')
        
        print(f"\n{status_emoji} {stage['name']}")
        print(f"   Статус: {stage['status']}")
        
        if stage['progress']:
            bars = '█' * (stage['progress']['percentage'] // 10)
            spaces = '░' * (10 - len(bars))
            print(f"   Прогресс: [{bars}{spaces}] {stage['progress']['percentage']}%")
            print(f"   Задачи: {stage['progress']['done']}/{stage['progress']['total']}")

if __name__ == '__main__':
    report = parse_workflow_state()
    print_report(report)


