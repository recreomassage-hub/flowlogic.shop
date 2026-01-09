#!/bin/bash
# Beads CLI - Simple Issue Tracker
# Usage: ./scripts/bd.sh {command} [args...]

set -e

BEADS_DIR=".beads"
ISSUES_FILE="$BEADS_DIR/issues.jsonl"
STATUS_FILE="$BEADS_DIR/status.json"

# Ensure directories exist
mkdir -p "$BEADS_DIR"

# Generate unique ID
generate_id() {
  local prefix="${1:-TASK}"
  local timestamp=$(date +%s)
  local random=$(shuf -i 1000-9999 -n 1)
  echo "${prefix}-${timestamp}-${random}"
}

# Read all issues as JSON array
read_issues_json() {
  if [ ! -f "$ISSUES_FILE" ]; then
    echo "[]"
    return
  fi
  cat "$ISSUES_FILE" | jq -s . 2>/dev/null || echo "[]"
}

# Read all issues line by line (for compatibility)
read_issues() {
  if [ ! -f "$ISSUES_FILE" ]; then
    touch "$ISSUES_FILE"
  fi
  cat "$ISSUES_FILE" | while IFS= read -r line; do
    if [ -n "$line" ]; then
      echo "$line"
    fi
  done
}

# Write issue to JSONL
write_issue() {
  echo "$1" >> "$ISSUES_FILE"
}

# Update issue status
update_issue() {
  local id="$1"
  local field="$2"
  local value="$3"
  
  local temp_file=$(mktemp)
  read_issues | while IFS= read -r line; do
    if echo "$line" | jq -e ".id == \"$id\"" > /dev/null 2>&1; then
      echo "$line" | jq ".$field = $value"
    else
      echo "$line"
    fi
  done > "$temp_file"
  mv "$temp_file" "$ISSUES_FILE"
}

# Check if issue has blockers
has_blockers() {
  local issue="$1"
  local blocked_by=$(echo "$issue" | jq -r '.blocked_by[]? // empty' 2>/dev/null || echo "")
  [ -n "$blocked_by" ]
}

# Main commands
case "$1" in
  create)
    title="$2"
    if [ -z "$title" ]; then
      echo "Usage: bd create \"Title\" [--epic EPIC] [--priority N] [--estimated-time TIME]"
      exit 1
    fi
    
    # Parse options
    epic=""
    priority=1
    estimated_time=""
    blocks="[]"
    blocked_by="[]"
    
    shift 2
    while [ $# -gt 0 ]; do
      case "$1" in
        --epic) epic="$2"; shift 2 ;;
        --priority) priority="$2"; shift 2 ;;
        --estimated-time) estimated_time="$2"; shift 2 ;;
        --blocks) blocks="[\"$2\"]"; shift 2 ;;
        --blocked-by) blocked_by="[\"$2\"]"; shift 2 ;;
        *) shift ;;
      esac
    done
    
    id=$(generate_id)
    issue=$(jq -n \
      --arg id "$id" \
      --arg title "$title" \
      --arg epic "$epic" \
      --argjson priority "$priority" \
      --arg estimated_time "$estimated_time" \
      --argjson blocks "$blocks" \
      --argjson blocked_by "$blocked_by" \
      '{
        id: $id,
        title: $title,
        status: "ready",
        priority: $priority,
        epic: $epic,
        estimated_time: $estimated_time,
        blocks: $blocks,
        blocked_by: $blocked_by,
        created: now | todateiso8601,
        updated: now | todateiso8601
      }')
    
    write_issue "$issue"
    echo "✅ Created issue: $id"
    echo "$issue" | jq .
    ;;
    
  ready)
    format="${2:-text}"
    
    if [ ! -f "$ISSUES_FILE" ]; then
      if [ "$format" = "json" ]; then
        echo "[]"
      fi
      exit 0
    fi
    
    # Read all issues as JSON array for dependency checking
    all_issues=$(read_issues_json)
    
    if [ -z "$all_issues" ] || [ "$all_issues" = "null" ] || [ "$all_issues" = "[]" ]; then
      if [ "$format" = "json" ]; then
        echo "[]"
      fi
      exit 0
    fi
    
    # Use bash to filter ready issues with dependency checking
    # Issue is ready if: status=ready AND (no blockers OR all blockers are done)
    ready_issues=$(echo "$all_issues" | jq -c '.[] | select(.status == "ready")' | while IFS= read -r line; do
        if [ -n "$line" ]; then
          blocked_by_count=$(echo "$line" | jq -r '(.blocked_by // []) | length' 2>/dev/null || echo "0")
          
          # Ensure blocked_by_count is a number
          if ! echo "$blocked_by_count" | grep -qE '^[0-9]+$'; then
            blocked_by_count=0
          fi
          
          if [ "$blocked_by_count" -eq 0 ]; then
            # No blockers, issue is ready
            echo "$line"
          else
            # Check if all blockers are done
            all_done=true
            for blocker_id in $(echo "$line" | jq -r '.blocked_by[]?' 2>/dev/null); do
              if [ -n "$blocker_id" ]; then
                blocker_status=$(echo "$all_issues" | jq -r ".[] | select(.id == \"$blocker_id\") | .status // \"unknown\"" 2>/dev/null)
                if [ "$blocker_status" != "done" ]; then
                  all_done=false
                  break
                fi
              fi
            done
            
            if [ "$all_done" = true ]; then
              echo "$line"
            fi
          fi
        fi
      done)
    
    if [ "$format" = "json" ]; then
      echo "$ready_issues" | jq -s .
    else
      echo "$ready_issues" | while IFS= read -r line; do
        if [ -n "$line" ]; then
          id=$(echo "$line" | jq -r '.id')
          title=$(echo "$line" | jq -r '.title')
          priority=$(echo "$line" | jq -r '.priority // 1')
          estimated=$(echo "$line" | jq -r '.estimated_time // "?"')
          echo "[$priority] $id: $title (est: $estimated)"
        fi
      done | sort -t'[' -k2 -n
    fi
    ;;
    
  start)
    id="$2"
    if [ -z "$id" ]; then
      echo "Usage: bd start {issue-id}"
      exit 1
    fi
    
    # Check if issue exists first
    issue=$(jq -r -s ".[] | select(.id == \"$id\")" "$ISSUES_FILE" 2>/dev/null | head -1)
    if [ -z "$issue" ] || [ "$issue" = "null" ]; then
      echo "❌ Issue not found: $id"
      exit 1
    fi
    
    # Update status to in_progress
    temp_file=$(mktemp)
    read_issues | while IFS= read -r line; do
      if echo "$line" | jq -e ".id == \"$id\"" > /dev/null 2>&1; then
        echo "$line" | jq '.status = "in_progress" | .updated = (now | todateiso8601)'
      else
        echo "$line"
      fi
    done > "$temp_file"
    
    mv "$temp_file" "$ISSUES_FILE"
    echo "✅ Started: $id"
    ;;
    
  complete)
    id="$2"
    if [ -z "$id" ]; then
      echo "Usage: bd complete {issue-id}"
      exit 1
    fi
    
    # Check if issue exists first
    issue=$(jq -r -s ".[] | select(.id == \"$id\")" "$ISSUES_FILE" 2>/dev/null | head -1)
    if [ -z "$issue" ] || [ "$issue" = "null" ]; then
      echo "❌ Issue not found: $id"
      exit 1
    fi
    
    temp_file=$(mktemp)
    read_issues | while IFS= read -r line; do
      if echo "$line" | jq -e ".id == \"$id\"" > /dev/null 2>&1; then
        echo "$line" | jq '.status = "done" | .updated = (now | todateiso8601)'
      else
        echo "$line"
      fi
    done > "$temp_file"
    
    mv "$temp_file" "$ISSUES_FILE"
    echo "✅ Completed: $id"
    ;;
    
  show)
    id="$2"
    if [ -z "$id" ]; then
      echo "Usage: bd show {issue-id}"
      exit 1
    fi
    
    if [ ! -f "$ISSUES_FILE" ]; then
      echo "❌ Issue not found: $id"
      exit 1
    fi
    
    # Use jq to read JSONL file and find the issue
    issue=$(jq -r -s ".[] | select(.id == \"$id\")" "$ISSUES_FILE" 2>/dev/null)
    
    if [ -z "$issue" ] || [ "$issue" = "null" ]; then
      echo "❌ Issue not found: $id"
      exit 1
    fi
    
    echo "$issue" | jq .
    ;;
    
  discover)
    description="$2"
    from_id="$4"
    
    if [ -z "$description" ] || [ "$3" != "--from" ] || [ -z "$from_id" ]; then
      echo "Usage: bd discover \"Description\" --from {issue-id}"
      exit 1
    fi
    
    id=$(generate_id "DISCOVERED")
    issue=$(jq -n \
      --arg id "$id" \
      --arg title "$description" \
      --arg from "$from_id" \
      '{
        id: $id,
        title: $title,
        status: "ready",
        priority: 2,
        epic: "",
        estimated_time: "",
        blocks: [],
        blocked_by: [],
        discovered_from: $from,
        created: now | todateiso8601,
        updated: now | todateiso8601
      }')
    
    write_issue "$issue"
    echo "✅ Discovered issue: $id (from $from_id)"
    echo "$issue" | jq .
    ;;
    
  status)
    # Generate status report
    all_issues=$(read_issues_json)
    
    current_epic=$(echo "$all_issues" | jq -r '[.[] | select(.status == "in_progress")] | .[0].epic // "none"')
    active_issues=$(echo "$all_issues" | jq -r '[.[] | select(.status == "in_progress") | .id]')
    completed_today=$(echo "$all_issues" | jq -r --arg today "$(date +%Y-%m-%d)" '[.[] | select(.status == "done" and (.updated | split("T")[0]) == $today) | .id]')
    discovered_issues=$(echo "$all_issues" | jq -r '[.[] | select(.discovered_from != null) | .id]')
    
    # Get ready issues (with dependency check)
    next_ready=$(./scripts/bd.sh ready --json | jq -r '.[] | .id' | head -5 | jq -R -s -c 'split("\n") | map(select(. != ""))')
    
    blocked_count=$(echo "$all_issues" | jq -r '[.[] | select(.blocked_by != null and (.blocked_by | length > 0))] | length')
    
    status=$(jq -n \
      --arg epic "$current_epic" \
      --argjson active "$active_issues" \
      --argjson completed "$completed_today" \
      --argjson discovered "$discovered_issues" \
      --argjson next "$next_ready" \
      --argjson blocked "$blocked_count" \
      '{
        current_epic: $epic,
        active_issues: $active,
        completed_today: $completed,
        discovered_issues: $discovered,
        next_ready: $next,
        blocked_count: $blocked,
        updated: now | todateiso8601
      }')
    
    echo "$status" | jq . > "$STATUS_FILE"
    echo "$status" | jq .
    ;;
    
  *)
    echo "Beads CLI - Simple Issue Tracker"
    echo ""
    echo "Usage: bd {command} [args...]"
    echo ""
    echo "Commands:"
    echo "  create \"Title\" [--epic EPIC] [--priority N] [--estimated-time TIME]"
    echo "  ready [--json]              Show ready issues"
    echo "  start {issue-id}            Start working on issue"
    echo "  complete {issue-id}         Mark issue as done"
    echo "  show {issue-id}            Show issue details"
    echo "  discover \"Desc\" --from {id}  Create discovered issue"
    echo "  status                      Generate status report"
    echo ""
    echo "Examples:"
    echo "  bd create \"Fix bug\" --priority 1 --estimated-time \"30min\""
    echo "  bd ready"
    echo "  bd start TASK-1234567890-1234"
    echo "  bd complete TASK-1234567890-1234"
    echo "  bd discover \"Need to add validation\" --from TASK-1234567890-1234"
    ;;
esac
