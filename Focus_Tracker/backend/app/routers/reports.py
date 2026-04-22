from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date, timedelta, datetime
from collections import defaultdict
from ..database import get_db
from ..models import ActivityLog, SiteCategory
from ..schemas import DailyReportResponse, WeeklyReportResponse, DomainStat
from ..utils.focus_utils import calculate_focus_score, classify_domain

router = APIRouter(prefix="/report", tags=["reports"])


def get_custom_categories(db: Session) -> dict:
    return {sc.domain: sc.category for sc in db.query(SiteCategory).all()}


@router.get("/daily", response_model=DailyReportResponse)
def get_daily_report(
    target_date: str = Query(default=None),
    user_id: str = "default_user",
    db: Session = Depends(get_db)
):
    """Get daily activity report."""
    if target_date:
        report_date = datetime.strptime(target_date, "%Y-%m-%d").date()
    else:
        report_date = date.today()

    logs = (
        db.query(ActivityLog)
        .filter(
            ActivityLog.user_id == user_id,
            func.date(ActivityLog.timestamp) == report_date
        )
        .all()
    )

    productive = sum(l.duration for l in logs if l.category == "productive")
    distracting = sum(l.duration for l in logs if l.category == "distracting")
    neutral = sum(l.duration for l in logs if l.category == "neutral")
    total = productive + neutral + distracting

    # Domain stats
    domain_time = defaultdict(float)
    domain_cat = {}
    for log in logs:
        domain_time[log.domain] += log.duration
        domain_cat[log.domain] = log.category

    top_sites = sorted(
        [
            DomainStat(
                domain=d,
                total_time=t,
                category=domain_cat[d],
                percentage=round((t / total * 100) if total else 0, 1)
            )
            for d, t in domain_time.items()
        ],
        key=lambda x: x.total_time,
        reverse=True
    )[:10]

    # Hourly breakdown
    hourly = defaultdict(float)
    for log in logs:
        hour = log.timestamp.hour
        hourly[str(hour)] += log.duration

    return DailyReportResponse(
        date=str(report_date),
        focus_score=calculate_focus_score(productive, total),
        total_time=total,
        productive_time=productive,
        distracting_time=distracting,
        neutral_time=neutral,
        top_sites=top_sites,
        hourly_activity=dict(hourly),
    )


@router.get("/weekly", response_model=WeeklyReportResponse)
def get_weekly_report(
    user_id: str = "default_user",
    db: Session = Depends(get_db)
):
    """Get weekly activity report."""
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    logs = (
        db.query(ActivityLog)
        .filter(
            ActivityLog.user_id == user_id,
            func.date(ActivityLog.timestamp) >= week_start,
            func.date(ActivityLog.timestamp) <= week_end
        )
        .all()
    )

    # Daily scores
    daily_data = defaultdict(lambda: {"productive": 0, "total": 0})
    for log in logs:
        day_str = str(log.timestamp.date())
        daily_data[day_str]["total"] += log.duration
        if log.category == "productive":
            daily_data[day_str]["productive"] += log.duration

    daily_scores = {
        day: calculate_focus_score(d["productive"], d["total"])
        for day, d in daily_data.items()
    }

    # Weekly totals
    total = sum(l.duration for l in logs)
    productive = sum(l.duration for l in logs if l.category == "productive")
    avg_score = sum(daily_scores.values()) / len(daily_scores) if daily_scores else 0

    # Top sites
    domain_time = defaultdict(float)
    domain_cat = {}
    for log in logs:
        domain_time[log.domain] += log.duration
        domain_cat[log.domain] = log.category

    all_sites = sorted(
        [
            DomainStat(
                domain=d,
                total_time=t,
                category=domain_cat[d],
                percentage=round((t / total * 100) if total else 0, 1)
            )
            for d, t in domain_time.items()
        ],
        key=lambda x: x.total_time,
        reverse=True
    )

    return WeeklyReportResponse(
        week_start=str(week_start),
        week_end=str(week_end),
        average_focus_score=round(avg_score, 1),
        total_time=total,
        daily_scores=daily_scores,
        top_distracting_sites=[s for s in all_sites if s.category == "distracting"][:5],
        top_productive_sites=[s for s in all_sites if s.category == "productive"][:5],
    )
