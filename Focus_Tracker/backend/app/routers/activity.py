from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ActivityLog, SiteCategory
from ..schemas import ActivityCreate, ActivityResponse, SiteCategoryCreate, SiteCategoryResponse
from ..utils.focus_utils import extract_domain, classify_domain

router = APIRouter(prefix="/activity", tags=["activity"])


@router.post("/", response_model=ActivityResponse)
def log_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    """Log a browsing activity."""
    domain = extract_domain(activity.url)

    # Get custom categories
    custom_cats = {
        sc.domain: sc.category
        for sc in db.query(SiteCategory).all()
    }

    category = classify_domain(domain, custom_cats)

    db_activity = ActivityLog(
        user_id=activity.user_id,
        url=activity.url,
        domain=domain,
        duration=activity.duration,
        category=category,
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


@router.get("/logs", response_model=list[ActivityResponse])
def get_activity_logs(
    user_id: str = "default_user",
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get recent activity logs."""
    logs = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    return logs


@router.get("/sites", response_model=list[SiteCategoryResponse])
def get_site_categories(db: Session = Depends(get_db)):
    """Get all custom site categories."""
    return db.query(SiteCategory).all()


@router.post("/sites", response_model=SiteCategoryResponse)
def set_site_category(site: SiteCategoryCreate, db: Session = Depends(get_db)):
    """Set custom category for a site."""
    existing = db.query(SiteCategory).filter(SiteCategory.domain == site.domain).first()
    if existing:
        existing.category = site.category
        db.commit()
        db.refresh(existing)
        return existing

    new_site = SiteCategory(domain=site.domain, category=site.category, is_custom=True)
    db.add(new_site)
    db.commit()
    db.refresh(new_site)
    return new_site


@router.delete("/sites/{domain}")
def delete_site_category(domain: str, db: Session = Depends(get_db)):
    """Remove custom category for a site."""
    site = db.query(SiteCategory).filter(SiteCategory.domain == domain).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    db.delete(site)
    db.commit()
    return {"message": "Deleted successfully"}
