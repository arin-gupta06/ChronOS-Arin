# Git Workflow & Commands

## Daily Workflow

```bash
git status                        # Check status
git add .                         # Stage all changes
git add -p                        # Interactive staging
git commit -m "feat: add login"   # Commit
git push origin main              # Push
```

## Branching Strategy

```bash
# Create feature branch
git checkout -b feature/user-auth

# Sync with main
git fetch origin
git rebase origin/main

# Merge with squash
git checkout main
git merge --squash feature/user-auth
git commit -m "feat: user authentication"

# Delete branch
git branch -d feature/user-auth
git push origin --delete feature/user-auth
```

## Undoing Things

```bash
git reset --soft HEAD~1      # Undo last commit, keep changes staged
git reset --hard HEAD~1      # Undo last commit, discard changes
git restore file.py          # Discard unstaged changes
git stash                    # Stash current work
git stash pop                # Restore stash
```

## Git Log & Inspection

```bash
git log --oneline --graph --all   # Pretty tree log
git diff HEAD~1                   # Changes since last commit
git blame file.py                 # Who changed what
git bisect start                  # Binary search for bugs
```

## Conventional Commits

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code restructure
- `test:` Tests
- `chore:` Build/tooling
