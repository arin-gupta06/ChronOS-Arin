from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
from .database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, default="default_user")
    url = Column(String, nullable=False)
    domain = Column(String, nullable=False)
    duration = Column(Float, nullable=False)  # in seconds
    category = Column(String, nullable=False)  # productive, neutral, distracting
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class SiteCategory(Base):
    __tablename__ = "site_categories"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)  # productive, neutral, distracting
    is_custom = Column(Boolean, default=True)


class UserStreak(Base):
    __tablename__ = "user_streaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, default="default_user")
    streak_days = Column(Integer, default=0)
    last_focus_date = Column(String)  # date string YYYY-MM-DD
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
