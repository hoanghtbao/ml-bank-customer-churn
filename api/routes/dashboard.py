"""
Dashboard Router: Executive KPIs, cross-country outflows, product sweet spots, and demographics.
"""

from fastapi import APIRouter
import os
import sys
import pandas as pd
import numpy as np

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

router = APIRouter(prefix="/api/dashboard", tags=["Executive Dashboard"])

DATA_PATH = os.path.join(PROJECT_ROOT, 'data', 'processed', 'full_engineered.csv')
if not os.path.exists(DATA_PATH):
    DATA_PATH = os.path.join(PROJECT_ROOT, 'Customer-Churn-Records.csv')


def get_df():
    return pd.read_csv(DATA_PATH)


@router.get("/overview")
def get_executive_overview():
    """Returns top executive dual baseline KPIs and diagnostic aggregates."""
    df = get_df()
    total_cust = len(df)
    churners = int(df['Exited'].sum())
    churn_rate = round(churners / total_cust * 100, 2)
    tot_bal = float(df['Balance'].sum())
    lost_bal = float(df[df['Exited'] == 1]['Balance'].sum())
    lost_bal_rate = round(lost_bal / tot_bal * 100, 2)

    avg_bal_churn = float(df[df['Exited'] == 1]['Balance'].mean())
    avg_bal_loyal = float(df[df['Exited'] == 0]['Balance'].mean())

    # Country breakdown
    geo_stats = []
    for geo, grp in df.groupby('Geography'):
        g_tot = len(grp)
        g_churn = int(grp['Exited'].sum())
        g_rate = round(g_churn / g_tot * 100, 2)
        g_tot_bal = float(grp['Balance'].sum())
        g_lost_bal = float(grp[grp['Exited'] == 1]['Balance'].sum())
        geo_stats.append({
            "country": geo,
            "total_customers": g_tot,
            "churners": g_churn,
            "churn_rate_pct": g_rate,
            "total_balance_m_eur": round(g_tot_bal / 1e6, 2),
            "lost_balance_m_eur": round(g_lost_bal / 1e6, 2),
            "lost_balance_share_pct": round(g_lost_bal / lost_bal * 100, 2)
        })

    # Product breakdown
    prod_stats = []
    for prod, grp in df.groupby('NumOfProducts'):
        p_tot = len(grp)
        p_churn = int(grp['Exited'].sum())
        prod_stats.append({
            "num_products": int(prod),
            "total_customers": p_tot,
            "churn_rate_pct": round(p_churn / p_tot * 100, 2)
        })

    # Age groups breakdown
    age_col = 'age_groups' if 'age_groups' in df.columns else 'Age_Lifecycle_Stage'
    age_stats = []
    if age_col in df.columns:
        for age_g, grp in df.groupby(age_col):
            active_grp = grp[grp['IsActiveMember'] == 1]
            inactive_grp = grp[grp['IsActiveMember'] == 0]
            age_stats.append({
                "age_group": str(age_g),
                "total": len(grp),
                "churn_rate_pct": round(grp['Exited'].mean() * 100, 2),
                "active_churn_rate_pct": round(active_grp['Exited'].mean() * 100, 2) if len(active_grp) > 0 else 0.0,
                "inactive_churn_rate_pct": round(inactive_grp['Exited'].mean() * 100, 2) if len(inactive_grp) > 0 else 0.0
            })

    return {
        "kpis": {
            "total_customers": total_cust,
            "total_balance_m_eur": round(tot_bal / 1e6, 2),
            "churn_headcount": churners,
            "churn_rate_pct": churn_rate,
            "balance_at_risk_m_eur": round(lost_bal / 1e6, 2),
            "balance_at_risk_pct": lost_bal_rate,
            "avg_balance_churned_eur": round(avg_bal_churn, 2),
            "avg_balance_retained_eur": round(avg_bal_loyal, 2),
            "balance_delta_pct": round((avg_bal_churn - avg_bal_loyal) / avg_bal_loyal * 100, 2)
        },
        "country_distribution": geo_stats,
        "product_holding_curve": prod_stats,
        "age_lifecycle": age_stats
    }
