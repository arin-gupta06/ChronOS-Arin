"""
CivicFix - Complaint Text Generator
Generates formatted complaint text from report data
"""
from datetime import datetime, timezone


def generate_complaint_text(
    issue_type: str,
    description: str,
    address: str,
    latitude: float,
    longitude: float,
    report_date: datetime | None = None,
) -> str:
    """Generate a formatted complaint text for a report."""
    if report_date is None:
        report_date = datetime.now(timezone.utc)

    date_str = report_date.strftime("%d %b %Y")
    maps_link = f"https://maps.google.com/?q={latitude},{longitude}"

    complaint = (
        f"🚨 Civic Issue Report\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"📋 Issue Type: {issue_type}\n"
        f"📝 Description: {description}\n"
        f"📍 Location: {address}\n"
        f"🗺️ Coordinates: {latitude},{longitude}\n"
        f"🔗 Map: {maps_link}\n"
        f"📅 Date: {date_str}\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"Reported via CivicFix"
    )
    return complaint


def generate_tweet_text(
    issue_type: str,
    description: str,
    address: str,
    latitude: float,
    longitude: float,
) -> str:
    """Generate a tweet-length complaint text (max 280 chars)."""
    maps_link = f"https://maps.google.com/?q={latitude},{longitude}"

    # Truncate description to fit tweet limit
    max_desc_len = 100
    short_desc = description[:max_desc_len] + "..." if len(description) > max_desc_len else description

    tweet = (
        f"🚨 {issue_type} reported!\n"
        f"{short_desc}\n"
        f"📍 {address[:80]}\n"
        f"🔗 {maps_link}\n"
        f"#CivicFix #CitizenReport"
    )

    # Ensure tweet fits limit
    if len(tweet) > 280:
        tweet = tweet[:277] + "..."

    return tweet
