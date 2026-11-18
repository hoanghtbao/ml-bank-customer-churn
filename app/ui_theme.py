"""
UI/UX Theme and Enterprise Component Library for EuroVanguard Bank DSS.
Roleplay: EuroVanguard Bank (France, Germany, Spain).
Design System: Modern Enterprise FinTech (Stripe/Linear/TailwindUI inspired).
"""

import os
import streamlit as st
import plotly.graph_objects as go

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(CURRENT_DIR, 'assets')
LOGO_PATH = os.path.join(ASSETS_DIR, 'eurovanguard_logo.png')
ICON_PATH = os.path.join(ASSETS_DIR, 'eurovanguard_icon.png')

# Central Modern FinTech Design System
CUSTOM_CSS = """
<style>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

/* App Background: Clean modern Slate 50 instead of harsh blinding white */
.stApp {
    background-color: #f8fafc !important;
    color: #0f172a !important;
}

/* Hide Streamlit top header banner ("Deploy", "Made with Streamlit") */
header[data-testid="stHeader"] {
    display: none !important;
}

/* Main Container: Compact, clean padding */
.main .block-container {
    padding-top: 1.5rem !important;
    padding-bottom: 3rem !important;
    padding-left: 2.5rem !important;
    padding-right: 2.5rem !important;
    max-width: 1400px !important;
}

/* =========================================================================
   SIDEBAR: MODERN DEEP SAPPHIRE & SLATE FINTECH
   ========================================================================= */

[data-testid="stSidebar"] {
    background: #091426 !important;
    border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* Top Sidebar Brand Container */
.sidebar-brand-box {
    padding: 18px 16px 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 12px;
}

.sidebar-brand-title {
    font-size: 1.15rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    gap: 10px;
}

.sidebar-brand-sub {
    font-size: 0.72rem;
    font-weight: 600;
    color: #60a5fa;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 2px;
}

/* Multipage Nav Links */
[data-testid="stSidebarNav"] {
    padding: 6px 12px 14px 12px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

[data-testid="stSidebarNav"] ul {
    gap: 4px !important;
}

[data-testid="stSidebarNav"] li a {
    padding: 9px 14px !important;
    border-radius: 8px !important;
    transition: all 0.2s ease !important;
    color: #94a3b8 !important;
    font-weight: 500 !important;
    font-size: 0.88rem !important;
}

[data-testid="stSidebarNav"] li a:hover {
    background: rgba(255, 255, 255, 0.06) !important;
    color: #ffffff !important;
}

[data-testid="stSidebarNav"] li a[aria-current="page"] {
    background: #1e3a8a !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4) !important;
}

[data-testid="stSidebarNav"] li a[aria-current="page"] span {
    color: #ffffff !important;
}

/* Collapse Button Inside Sidebar */
[data-testid="stSidebarCollapseButton"] button {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: #ffffff !important;
    border-radius: 8px !important;
    padding: 6px !important;
}

[data-testid="stSidebarCollapseButton"] button:hover {
    background: #2563eb !important;
    border-color: #60a5fa !important;
}

[data-testid="stSidebarCollapseButton"] svg {
    fill: #ffffff !important;
    stroke: #ffffff !important;
}

/* Floating Re-Open Button when Sidebar is Collapsed */
[data-testid="collapsedControl"],
[data-testid="stSidebarCollapsedControl"],
button[data-testid="baseButton-headerNoPadding"] {
    position: fixed !important;
    top: 14px !important;
    left: 14px !important;
    z-index: 999999 !important;
    background: #091426 !important;
    border: 1px solid #2563eb !important;
    color: #ffffff !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2) !important;
    padding: 8px 10px !important;
}

[data-testid="collapsedControl"] svg {
    fill: #ffffff !important;
}

/* Sidebar Operator Card at Bottom */
.sidebar-footer-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 12px 14px;
    margin-top: 18px;
}

.operator-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.operator-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.78rem;
    font-weight: 700;
    color: white;
}

/* =========================================================================
   PAGE HERO: MODERN STREAMLINED SAAS HEADER
   ========================================================================= */

.page-header-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 22px 28px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.04);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}

.page-breadcrumb {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #2563eb;
    margin-bottom: 4px;
}

.page-title {
    font-size: 1.65rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin: 0;
    line-height: 1.25;
}

.page-desc {
    font-size: 0.92rem;
    color: #64748b;
    margin: 4px 0 0 0;
    line-height: 1.4;
}

.page-badge-pill {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 9999px;
    padding: 6px 14px;
    font-size: 0.78rem;
    font-weight: 600;
    color: #334155;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
}

/* =========================================================================
   STAT CARDS: METRIC CARDS WITH SOFT SHADOWS
   ========================================================================= */

.stat-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 18px 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    transition: all 0.2s ease;
    height: 100%;
}

.stat-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.06);
    transform: translateY(-2px);
}

.stat-card-title {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #64748b;
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-card-value {
    font-size: 1.7rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin-bottom: 6px;
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

/* =========================================================================
   STRUCTURED METADATA AUDIT CARDS
   ========================================================================= */

.meta-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    height: 100%;
}

.meta-card-header {
    font-size: 0.95rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    gap: 8px;
}

.meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 0;
    border-bottom: 1px dashed #f1f5f9;
    font-size: 0.85rem;
}

.meta-row:last-child {
    border-bottom: none;
}

.meta-label {
    color: #64748b;
    font-weight: 500;
}

.meta-value {
    color: #0f172a;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    background: #f8fafc;
    padding: 2px 7px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    font-size: 0.82rem;
}

/* =========================================================================
   CUSTOM BADGES & PILLS
   ========================================================================= */

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

/* Section Heading Style */
.section-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #0f172a;
    margin: 24px 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* Tele-banking Call Script Box */
.call-script-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #2563eb;
    border-radius: 8px 12px 12px 8px;
    padding: 18px 22px;
    margin: 16px 0;
    box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

.call-script-title {
    font-size: 0.88rem;
    font-weight: 700;
    color: #1e3a8a;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
}

.call-script-dialog {
    color: #334155;
    font-size: 0.92rem;
    line-height: 1.7;
    background: #f8fafc;
    padding: 14px 18px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

/* Action Box */
.action-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #10b981;
    border-radius: 8px 12px 12px 8px;
    padding: 16px 20px;
    margin: 14px 0;
}

/* Forms */
div[data-testid="stForm"] {
    background: #ffffff !important;
    padding: 24px !important;
    border-radius: 12px !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02) !important;
}

/* Tabs */
.stTabs [data-baseweb="tab-list"] {
    gap: 6px;
    border-bottom: 2px solid #e2e8f0;
}

.stTabs [data-baseweb="tab"] {
    height: 40px;
    border-radius: 6px 6px 0 0;
    font-weight: 600;
    font-size: 0.88rem;
    padding: 0 16px;
    color: #64748b;
}

.stTabs [aria-selected="true"] {
    color: #2563eb !important;
    background-color: transparent !important;
    border-bottom: 2px solid #2563eb !important;
}

/* Table formatting */
div[data-testid="stDataFrame"] {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    background: #ffffff;
}
</style>
"""


def apply_theme():
    """Injects central enterprise theme CSS."""
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


def render_sidebar_brand():
    """Renders sleek EuroVanguard branding and operator card in sidebar."""
    st.sidebar.markdown("""
    <div class="sidebar-brand-box">
        <div class="sidebar-brand-title">
            <span style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); width: 28px; height: 28px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; font-size: 15px;">🏛️</span>
            <span>EUROVANGUARD</span>
        </div>
        <div class="sidebar-brand-sub">Decision Support System</div>
    </div>
    """, unsafe_allow_html=True)


def render_sidebar_footer():
    """Renders active operator and certified governance footer in sidebar."""
    st.sidebar.markdown("""
    <div class="sidebar-footer-card">
        <div class="operator-row">
            <div class="operator-avatar">HB</div>
            <div>
                <div style="font-size: 0.82rem; font-weight: 700; color: #ffffff;">Hoàng Hữu Bảo</div>
                <div style="font-size: 0.72rem; color: #94a3b8;">Senior CVM Analyst</div>
            </div>
        </div>
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.72rem; color: #64748b; display: flex; justify-content: space-between;">
            <span style="color: #10b981;">● Certified Prod v2.4</span>
            <span>Basel III / GDPR</span>
        </div>
    </div>
    """, unsafe_allow_html=True)


def render_page_header(title: str, subtitle: str, category: str = "EuroVanguard DSS"):
    """Renders a sleek, modern SaaS page header."""
    st.markdown(f"""
    <div class="page-header-box">
        <div>
            <div class="page-breadcrumb">{category}</div>
            <h1 class="page-title">{title}</h1>
            <p class="page-desc">{subtitle}</p>
        </div>
        <div>
            <div class="page-badge-pill">
                <span class="live-dot"></span>
                <span>System Production v2.4</span>
            </div>
        </div>
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
    """Renders an enterprise stat card."""
    delta_html = ""
    if delta:
        delta_class = f"delta-{delta_type}"
        delta_html = f'<div class="stat-card-delta {delta_class}">{delta}</div>'

    html = f"""
    <div class="stat-card" title="{tooltip}">
        <div class="stat-card-title">
            <span>{title}</span>
            <span style="font-size: 1rem;">{icon}</span>
        </div>
        <div class="stat-card-value">{value}</div>
        {delta_html}
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)


def render_meta_card(title: str, icon: str, items: dict):
    """Renders a structured key-value audit card."""
    rows_html = ""
    for label, val in items.items():
        rows_html += f"""
        <div class="meta-row">
            <span class="meta-label">{label}</span>
            <span class="meta-value">{val}</span>
        </div>
        """

    html = f"""
    <div class="meta-card">
        <div class="meta-card-header">
            <span>{icon}</span>
            <span>{title}</span>
        </div>
        <div>
            {rows_html}
        </div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)


def get_plotly_theme():
    """Unified clean plotly layout matching EuroVanguard theme."""
    layout = go.Layout(
        font=dict(family="Plus Jakarta Sans, sans-serif", color="#334155", size=12),
        title_font=dict(family="Plus Jakarta Sans, sans-serif", size=14, color="#0f172a"),
        paper_bgcolor="#ffffff",
        plot_bgcolor="#ffffff",
        margin=dict(l=40, r=30, t=50, b=40),
        xaxis=dict(
            gridcolor="#f1f5f9",
            linecolor="#e2e8f0",
            tickfont=dict(size=11, color="#64748b")
        ),
        yaxis=dict(
            gridcolor="#f1f5f9",
            linecolor="#e2e8f0",
            tickfont=dict(size=11, color="#64748b")
        ),
        colorway=["#2563eb", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"]
    )
    return layout
