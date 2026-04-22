from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from collections import defaultdict
from ..database import get_db
from ..models import ActivityLog, UserStreak
from ..schemas import FocusScoreResponse
from ..utils.focus_utils import calculate_focus_score, generate_suggestion

router = APIRouter(prefix="/focus-score", tags=["focus-score"])


def update_streak(db: Session, user_id: str, today_score: float) -> int:
    streak = db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
    today_str = str(date.today())
    yesterday_str = str(date.today() - timedelta(days=1))

    if not streak:
        streak = UserStreak(user_id=user_id, streak_days=0, last_focus_date=None)
        db.add(streak)

    if today_score >= 70:
        if streak.last_focus_date == today_str:
            pass  # Already counted today
        elif streak.last_focus_date == yesterday_str:
            streak.streak_days += 1
            streak.last_focus_date = today_str
        else:
            streak.streak_days = 1
            streak.last_focus_date = today_str
    else:
        if streak.last_focus_date != today_str:
            pass  # Not maintaining streak today

    db.commit()
    return streak.streak_days


@router.get("/", response_model=FocusScoreResponse)
def get_focus_score(
    user_id: str = "default_user",
    db: Session = Depends(get_db)
):
    """Get today's focus score with suggestions."""
    today = date.today()

    logs = (
        db.query(ActivityLog)
        .filter(
            ActivityLog.user_id == user_id,
            func.date(ActivityLog.timestamp) == today
        )
        .all()
    )

    productive = sum(l.duration for l in logs if l.category == "productive")
    distracting = sum(l.duration for l in logs if l.category == "distracting")
    neutral = sum(l.duration for l in logs if l.category == "neutral")
    total = productive + neutral + distracting

    score = calculate_focus_score(productive, total)

    # Top distracting sites
    distracting_sites = defaultdict(float)
    for log in logs:
        if log.category == "distracting":
            distracting_sites[log.domain] += log.duration

    top_distracting = sorted(distracting_sites.keys(), key=lambda d: distracting_sites[d], reverse=True)

    streak_days = update_streak(db, user_id, score)
    suggestion = generate_suggestion(score, distracting, top_distracting, streak_days)

    return FocusScoreResponse(
        focus_score=score,
        productive_time=productive,
        neutral_time=neutral,
        distracting_time=distracting,
        total_time=total,
        streak_days=streak_days,
        suggestion=suggestion,
    )
