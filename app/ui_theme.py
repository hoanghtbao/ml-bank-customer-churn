"""
UI/UX Theme and Enterprise Component Library for EuroVanguard Bank DSS.
Provides modern CSS injection, custom HTML cards, branded badges, and Plotly styling.
"""

import streamlit as st
import plotly.graph_objects as go

# Central CSS for EuroVanguard Enterprise Theme
CUSTOM_CSS = """
<style>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Background & Main container padding */
.main .block-container {
    padding-top: 1.8rem;
    padding-bottom: 3.5rem;
    max-width: 1350px;
}

/* Sidebar Styling */
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0a192f 0%, #0d213f 100%);
    color: #e2e8f0;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
}

[data-testid="stSidebar"] hr {
    border-color: rgba(255, 255, 255, 0.12);
}

[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p {
    color: #cbd5e1;
}

/* Sleek Modern Header Container */
.euro-header {
    background: linear-gradient(135deg, #0a192f 0%, #1e3a8a 50%, #0f172a 100%);
    padding: 24px 28px;
    border-radius: 16px;
    color: white;
    margin-bottom: 24px;
    box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25), 0 8px 10px -6px rgba(15, 23, 42, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
}

.euro-header::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0) 70%);
    border-radius: 50%;
    pointer-events: none;
}

.euro-header h1 {
    font-size: 1.85rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 12px;
}

.euro-header p {
    margin: 6px 0 0 0;
    font-size: 0.95rem;
    color: #cbd5e1;
    font-weight: 400;
}

.euro-header-badge {
    display: inline-block;
    padding: 4px 12px;
    background: rgba(59, 130, 246, 0.25);
    border: 1px solid rgba(96, 165, 250, 0.4);
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 600;
    color: #93c5fd;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Metric Cards - Premium FinTech Style */
.stat-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 18px 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
    height: 100%;
}

.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 20px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04);
    border-color: #cbd5e1;
}

.stat-card-title {
    font-size: 0.82rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-card-value {
    font-size: 1.75rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin-bottom: 4px;
}

.stat-card-delta {
    font-size: 0.82rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
}

.delta-danger { color: #dc2626; }
.delta-success { color: #16a34a; }
.delta-info { color: #2563eb; }
.delta-neutral { color: #64748b; }

/* Custom Pill Badges */
.badge-pill {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    gap: 6px;
}

.badge-danger {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
}

.badge-warning {
    background-color: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
}

.badge-success {
    background-color: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
}

.badge-info {
    background-color: #dbeafe;
    color: #1e40af;
    border: 1px solid #bfdbfe;
}

/* Call Script Box - Tele-banking CRM */
.call-script-box {
    background: #f8fafc;
    border-left: 4px solid #2563eb;
    border-radius: 0 12px 12px 0;
    padding: 16px 20px;
    margin: 16px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.call-script-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: #1e3a8a;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.call-script-dialog {
    font-style: italic;
    color: #334155;
    font-size: 0.92rem;
    line-height: 1.6;
    background: #ffffff;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px dashed #cbd5e1;
}

/* Highlight Action Box */
.action-box {
    background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
    border: 1px solid #bfdbfe;
    border-radius: 12px;
    padding: 16px 20px;
    margin: 14px 0;
}

/* Clean Form & Input enhancements */
div[data-testid="stForm"] {
    background: #ffffff;
    padding: 24px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

/* Custom Tabs Styling */
.stTabs [data-baseweb="tab-list"] {
    gap: 8px;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 4px;
}

.stTabs [data-baseweb="tab"] {
    height: 42px;
    border-radius: 8px 8px 0 0;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0 18px;
    color: #64748b;
    border: none;
}

.stTabs [aria-selected="true"] {
    color: #1e40af !important;
    background-color: rgba(37, 99, 235, 0.08) !important;
    border-bottom: 3px solid #2563eb !important;
}

/* Button Elevation */
.stButton > button {
    border-radius: 10px;
    font-weight: 600;
    padding: 8px 20px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.stButton > button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

/* Pulse Animation for Critical Alerts */
@keyframes pulseGlow {
    0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5); }
    70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
    100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
}

.critical-pulse {
    animation: pulseGlow 2s infinite;
    border: 1px solid #dc2626 !important;
}
</style>
"""


def apply_theme():
    """Injects central enterprise theme CSS."""
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


def render_sidebar_brand():
    """Renders sleek EuroVanguard Bank branding on sidebar."""
    st.sidebar.markdown("""
    <div style="padding: 12px 4px 20px 4px; text-align: left;">
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);">
                🏛️
            </div>
            <div>
                <div style="font-weight: 800; font-size: 1.1rem; color: #ffffff; letter-spacing: -0.01em; line-height: 1.1;">EUROVANGUARD</div>
                <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;">Bank Decision Support</div>
            </div>
        </div>
        <div style="margin-top: 14px; display: flex; gap: 6px; align-items: center;">
            <span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981;"></span>
            <span style="font-size: 0.75rem; color: #cbd5e1; font-weight: 600;">System Live (Production v2.4)</span>
        </div>
    </div>
    """, unsafe_allow_html=True)


def render_page_header(title: str, subtitle: str, badge: str = "Enterprise Banking DSS"):
    """Renders a polished, glassmorphic hero banner for pages."""
    st.markdown(f"""
    <div class="euro-header">
        <div class="euro-header-badge">🏛️ {badge}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
    </div>
    """, unsafe_allow_html=True)


def render_stat_card(
    title: str,
    value: str,
    delta: str = None,
    delta_type: str = "neutral",
    icon: str = "📊",
    tooltip: str = ""
):
    """
    Renders an enterprise KPI card with hover elevation.
    delta_type: 'danger' | 'success' | 'info' | 'neutral'
    """
    delta_html = ""
    if delta:
        delta_class = f"delta-{delta_type}"
        delta_html = f'<div class="stat-card-delta {delta_class}">{delta}</div>'

    html = f"""
    <div class="stat-card" title="{tooltip}">
        <div class="stat-card-title">
            <span>{title}</span>
            <span style="font-size: 1.1rem;">{icon}</span>
        </div>
        <div class="stat-card-value">{value}</div>
        {delta_html}
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)


def get_plotly_theme():
    """Returns a unified clean plotly layout matching EuroVanguard theme."""
    layout = go.Layout(
        font=dict(family="Plus Jakarta Sans, sans-serif", color="#334155", size=12),
        title_font=dict(family="Plus Jakarta Sans, sans-serif", size=15, color="#0f172a"),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=40, r=30, t=50, b=40),
        xaxis=dict(
            gridcolor="#f1f5f9",
            linecolor="#cbd5e1",
            tickfont=dict(size=11, color="#64748b")
        ),
        yaxis=dict(
            gridcolor="#f1f5f9",
            linecolor="#cbd5e1",
            tickfont=dict(size=11, color="#64748b")
        ),
        colorway=["#2563eb", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"]
    )
    return layout
