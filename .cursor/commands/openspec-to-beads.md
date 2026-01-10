---
name: /openspec-to-beads
id: openspec-to-beads
category: OpenSpec
description: Use this command after an OpenSpec change is approved. Converts OpenSpec tasks.md into Beads issue graph.
---

## What to do

1. **Ask the user** (if not provided) which OpenSpec change ID to use.
   - Check if change ID is provided in user query
   - If not, list available changes in `openspec/changes/` and ask user to choose
   - Validate that the change directory exists

2. **Read OpenSpec files:**
   - `openspec/changes/<id>/proposal.md` - for context and feature name
   - `openspec/changes/<id>/tasks.md` - for task breakdown
   - Any `openspec/changes/<id>/specs/**/spec.md` - for technical details

3. **Validation Checklist:**
   
   Before creating tasks, verify:
   - [ ] Change directory exists at `openspec/changes/<id>/`
   - [ ] `proposal.md` exists and has title or feature name
   - [ ] `tasks.md` exists and is not empty
   - [ ] `tasks.md` has at least one `- [ ]` checkbox (uncompleted task)
   
   **If any check fails:**
   - Stop execution immediately
   - Show clear error message with what's missing
   - Suggest how to fix the issue
   - Do NOT proceed with task creation

4. **Parse tasks.md:**
   - Identify all concrete implementation steps
   - Extract task titles and descriptions
   - Identify task types (migration, infra, backend, frontend, docs, etc.)
   - Detect implicit dependencies based on task order and types

5. **Create Beads epic:**
   - Extract feature name from `proposal.md` (title or feature name field)
   - Create epic: `bd create "Implement <feature-name>" --type epic --priority 0 --description "<epic description from proposal>"`
   - Store epic ID for child task creation

6. **Create child tasks:**
   - For each concrete implementation step in `tasks.md`:
     - Determine priority: 
       - Priority 0 (P0): Critical path, blocking other tasks, migrations/infra
       - Priority 1 (P1): Important but not blocking, implementation tasks
     - Identify task type from content/keywords:
       - `infra`: migrations, database schema, infrastructure setup
       - `backend`: API endpoints, services, business logic
       - `frontend`: UI components, pages, user interactions
       - `tests`: unit tests, integration tests, E2E tests
       - `docs`: documentation updates
       - Default: `task` if type unclear
     - Create task: `bd create "<task title>" --type task --parent <epic-id> --priority <0|1> --description "<task description>"`
   - Store all created task IDs with their task titles, priorities, and types for dependency mapping

7. **Add dependencies:**
   - Analyze task order and types to build dependency graph:
     - **Migrations & Infra** → block **Backend**
     - **Backend** → block **Frontend/UI**
     - **Implementation** → block **Release/Docs**
   - Add dependencies using: `bd dep add <child-id> <parent-id>`
   - Map task titles to IDs to correctly set dependencies

8. **Verify and summarize:**
   - Run `bd ready` to check which tasks are now ready to start
   - Print summary:
     - Epic ID and name
     - All created task IDs with their titles
     - Dependency graph explanation (which tasks block which)
     - Ready tasks that can be started immediately

## Output Format

**After successful creation:**

```markdown
✅ OpenSpec change converted to Beads tasks

**Epic:** <epic-id> - <feature-name>
**Source:** openspec/changes/<change-id>/

**Created Tasks:** (<count> total)
- <task-id-1>: <task-title-1> [Priority: <0|1>] [Type: <infra|backend|frontend|tests|docs|task>]
- <task-id-2>: <task-title-2> [Priority: <0|1>] [Type: <infra|backend|frontend|tests|docs|task>]
...

**Dependency Graph:**

Visual tree format (preferred):
```
infra-task-1
  └─> backend-task-1
        └─> frontend-task-1
              └─> tests-task-1
```

Or linear list format:
- infra-task-1 → blocks → backend-task-1
- backend-task-1 → blocks → frontend-task-1
- frontend-task-1 → blocks → tests-task-1
```

**Ready to Start:**
- <task-id>: <task-title> [Type: <type>] (no dependencies)

**Next Steps:**
1. Review all tasks: `bd show <epic-id>`
2. Start first task: `bd start <task-id>`
3. Check dependencies: `bd show <task-id>`
4. See ready tasks anytime: `bd ready`
```

## Error Handling

**Before validation (step 3):**
- If change ID doesn't exist, show error and list available changes: `ls openspec/changes/`
- If `proposal.md` is missing or has no title/feature name:
  - Show error: "proposal.md is missing or has no feature name"
  - Suggest: "Add a title to proposal.md or specify feature name"
  - Use change ID as feature name fallback only if proposal.md exists but has no title

**During validation (step 3):**
- If `tasks.md` is missing: Stop and show error with instructions to create it
- If `tasks.md` is empty: Stop and show error "tasks.md is empty. Add tasks as `- [ ] Task description`"
- If `tasks.md` has no `- [ ]` checkboxes: Stop and show error "No uncompleted tasks found in tasks.md"

**After validation:**
- If Beads epic creation fails: Show error and suggest checking `bd status`
- If any task creation fails: Show which task failed and continue with remaining tasks
- If dependency addition fails: Show warning but continue (user can fix manually)

## Examples

**Example 1: Simple change**
```bash
/openspec-to-beads FL-001
```

**Example 2: Interactive (no ID provided)**
```bash
/openspec-to-beads
# Agent: Which OpenSpec change ID? Available: FL-001, FL-002, FL-003
# User: FL-001
```

## Notes

- This command should only be used **after** OpenSpec change is approved
- All tasks are created as children of the epic
- Dependencies are inferred from task order and types in `tasks.md`
- Manual dependency adjustment may be needed after creation
- Use `bd dep` commands to modify dependencies if needed


