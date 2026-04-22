from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ActivityCreate(BaseModel):
    user_id: Optional[str] = "default_user"
    url: str
    duration: float  # seconds


class ActivityResponse(BaseModel):
    id: int
    user_id: str
    url: str
    domain: str
    duration: float
    category: str
    timestamp: datetime

    class Config:
        from_attributes = True


class SiteCategoryCreate(BaseModel):
    domain: str
    category: str  # productive, neutral, distracting


class SiteCategoryResponse(BaseModel):
    id: int
    domain: str
    category: str
    is_custom: bool

    class Config:
        from_attributes = True


class FocusScoreResponse(BaseModel):
    focus_score: float
    productive_time: float
    neutral_time: float
    distracting_time: float
    total_time: float
    streak_days: int
    suggestion: str


class DomainStat(BaseModel):
    domain: str
    total_time: float
    category: str
    percentage: float


class DailyReportResponse(BaseModel):
    date: str
    focus_score: float
    total_time: float
    productive_time: float
    distracting_time: float
    neutral_time: float
    top_sites: list[DomainStat]
    hourly_activity: dict


class WeeklyReportResponse(BaseModel):
    week_start: str
    week_end: str
    average_focus_score: float
    total_time: float
    daily_scores: dict
    top_distracting_sites: list[DomainStat]
    top_productive_sites: list[DomainStat]
