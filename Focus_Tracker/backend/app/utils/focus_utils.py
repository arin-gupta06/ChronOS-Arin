from urllib.parse import urlparse
import re

# Default site classifications
PRODUCTIVE_DOMAINS = {
    "github.com", "gitlab.com", "bitbucket.org",
    "stackoverflow.com", "stackexchange.com",
    "developer.mozilla.org", "docs.python.org",
    "medium.com", "dev.to", "hashnode.com",
    "coursera.org", "udemy.com", "edx.org", "khanacademy.org",
    "leetcode.com", "hackerrank.com", "codewars.com",
    "notion.so", "trello.com", "jira.atlassian.com",
    "linear.app", "figma.com",
    "aws.amazon.com", "cloud.google.com", "azure.microsoft.com",
    "npmjs.com", "pypi.org", "hub.docker.com",
    "replit.com", "codesandbox.io", "codepen.io",
    "wikipedia.org", "arxiv.org",
    "openai.com", "anthropic.com",
}

PRODUCTIVE_PATTERNS = [
    r"^docs\.",
    r"^api\.",
    r"^learn\.",
    r"^academy\.",
    r"^tutorial\.",
    r"^developer\.",
]

DISTRACTING_DOMAINS = {
    "youtube.com", "youtu.be",
    "instagram.com", "facebook.com", "twitter.com", "x.com",
    "tiktok.com", "snapchat.com",
    "netflix.com", "primevideo.com", "disneyplus.com", "hulu.com",
    "twitch.tv", "reddit.com",
    "9gag.com", "buzzfeed.com",
    "pinterest.com",
    "whatsapp.com", "telegram.org",
    "gaming.com", "steampowered.com",
    "espn.com", "sports.yahoo.com",
}

NEUTRAL_DOMAINS = {
    "google.com", "bing.com", "duckduckgo.com",
    "gmail.com", "outlook.com", "yahoo.com",
    "news.google.com", "bbc.com", "cnn.com",
    "amazon.com", "ebay.com",
    "maps.google.com",
}


def extract_domain(url: str) -> str:
    """Extract clean domain from URL."""
    try:
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except Exception:
        return url


def classify_domain(domain: str, custom_categories: dict = None) -> str:
    """Classify a domain as productive, neutral, or distracting."""
    # Check custom categories first
    if custom_categories and domain in custom_categories:
        return custom_categories[domain]

    if domain in PRODUCTIVE_DOMAINS:
        return "productive"

    if domain in DISTRACTING_DOMAINS:
        return "distracting"

    if domain in NEUTRAL_DOMAINS:
        return "neutral"

    # Check patterns
    for pattern in PRODUCTIVE_PATTERNS:
        if re.match(pattern, domain):
            return "productive"

    # Default to neutral for unknown sites
    return "neutral"


def calculate_focus_score(productive_time: float, total_time: float) -> float:
    """Calculate focus score as percentage of productive time."""
    if total_time == 0:
        return 0.0
    score = (productive_time / total_time) * 100
    return round(min(score, 100.0), 1)


def generate_suggestion(
    focus_score: float,
    distracting_time: float,
    top_distracting: list,
    streak_days: int
) -> str:
    """Generate an AI-like suggestion based on activity."""
    distracting_hours = distracting_time / 3600

    if focus_score >= 80:
        if streak_days >= 3:
            return f"🔥 Amazing! You're on a {streak_days}-day focus streak. Keep it up — you're in the top tier of productivity!"
        return "🎯 Excellent focus today! You're crushing your goals. Consider taking short breaks to maintain this momentum."

    if focus_score >= 60:
        if distracting_hours > 1:
            site_note = ""
            if top_distracting:
                site_note = f" especially {top_distracting[0]}."
            return f"📈 Good progress! You spent {distracting_hours:.1f} hours on distracting sites{site_note} Try blocking them during peak work hours."
        return "👍 Decent focus score! Small improvements in cutting distractions could push you over 80."

    if focus_score >= 40:
        if distracting_hours > 2:
            return f"⚠️ You spent {distracting_hours:.1f} hours on distracting content today. Try the Pomodoro technique: 25 min focus, 5 min break."
        return "💡 Your focus needs improvement. Set specific goals for each work session to stay on track."

    if top_distracting:
        return f"🚨 Focus alert! {top_distracting[0]} alone consumed significant time. Consider using a site blocker during work hours."

    return "🎯 Start tracking your productive sites — even 30 minutes of focused work builds momentum!"
