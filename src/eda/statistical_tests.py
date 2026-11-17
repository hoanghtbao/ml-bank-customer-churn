"""
Module: src.eda.statistical_tests
Description: Rigorous statistical testing, effect sizes, Weight of Evidence (WOE),
Information Value (IV), and Variance Inflation Factor (VIF) for enterprise banking EDA.
"""

from typing import Dict, List, Tuple, Union
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.linear_model import LinearRegression


def calculate_categorical_association(df: pd.DataFrame, feature: str, target: str = "Exited") -> Dict[str, Union[float, str]]:
    """
    Computes Chi-Square test of independence and Cramér's V effect size.
    """
    contingency = pd.crosstab(df[feature], df[target])
    chi2, p_val, dof, _ = stats.chi2_contingency(contingency)

    n = contingency.values.sum()
    r, c = contingency.shape
    min_dim = min(r - 1, c - 1)
    cramers_v = np.sqrt(chi2 / (n * min_dim)) if min_dim > 0 else 0.0

    return {
        "feature": feature,
        "test": "Chi-Square",
        "statistic": float(chi2),
        "dof": int(dof),
        "p_value": float(p_val),
        "effect_size_name": "Cramér's V",
        "effect_size": float(cramers_v)
    }


def calculate_continuous_difference(df: pd.DataFrame, feature: str, target: str = "Exited") -> Dict[str, Union[float, str]]:
    """
    Computes Welch's T-test (parametric), Mann-Whitney U (non-parametric),
    Cohen's d, and Rank-Biserial correlation effect sizes.
    """
    group0 = df[df[target] == 0][feature].dropna()
    group1 = df[df[target] == 1][feature].dropna()

    n0, n1 = len(group0), len(group1)
    mean0, mean1 = float(np.mean(group0)), float(np.mean(group1))
    var0, var1 = float(np.var(group0, ddof=1)), float(np.var(group1, ddof=1))

    # Welch's t-test (unequal variances)
    t_stat, t_pval = stats.ttest_ind(group1, group0, equal_var=False)

    # Mann-Whitney U test
    u_stat, u_pval = stats.mannwhitneyu(group1, group0, alternative="two-sided")

    # Cohen's d (pooled standard deviation)
    pooled_sd = np.sqrt(((n0 - 1) * var0 + (n1 - 1) * var1) / (n0 + n1 - 2))
    cohens_d = (mean1 - mean0) / pooled_sd if pooled_sd > 0 else 0.0

    # Rank-biserial correlation
    r_rb = 1.0 - (2.0 * u_stat) / (n0 * n1) if (n0 * n1) > 0 else 0.0

    return {
        "feature": feature,
        "mean_0": mean0,
        "mean_1": mean1,
        "mean_diff": mean1 - mean0,
        "welch_t_stat": float(t_stat),
        "welch_p_value": float(t_pval),
        "mann_whitney_u": float(u_stat),
        "mann_whitney_p_value": float(u_pval),
        "cohens_d": float(cohens_d),
        "rank_biserial_r": float(r_rb)
    }


def calculate_woe_iv(df: pd.DataFrame, feature: str, target: str = "Exited", bins: int = 10) -> Tuple[pd.DataFrame, float]:
    """
    Calculates Weight of Evidence (WOE) and Information Value (IV)
    standardized for credit & churn risk rating.
    """
    data = df[[feature, target]].copy()

    # If numeric with more than bins unique values, bin it
    if pd.api.types.is_numeric_dtype(data[feature]) and data[feature].nunique() > bins:
        try:
            data["binned"] = pd.qcut(data[feature], q=bins, duplicates="drop")
        except Exception:
            data["binned"] = pd.cut(data[feature], bins=bins)
    else:
        data["binned"] = data[feature].astype(str)

    total_good = (data[target] == 0).sum()
    total_bad = (data[target] == 1).sum()

    grouped = data.groupby("binned", observed=False)[target].agg(
        total="count",
        bad="sum"
    ).reset_index()
    grouped["good"] = grouped["total"] - grouped["bad"]

    # Laplace smoothing to avoid division by zero or log of zero
    eps = 0.5
    grouped["dist_good"] = (grouped["good"] + eps) / (total_good + 2 * eps)
    grouped["dist_bad"] = (grouped["bad"] + eps) / (total_bad + 2 * eps)

    grouped["woe"] = np.log(grouped["dist_good"] / grouped["dist_bad"])
    grouped["iv_component"] = (grouped["dist_good"] - grouped["dist_bad"]) * grouped["woe"]
    total_iv = float(grouped["iv_component"].sum())

    grouped["churn_rate_pct"] = (grouped["bad"] / grouped["total"]) * 100.0

    return grouped, total_iv


def calculate_vif_dataframe(df: pd.DataFrame, numeric_features: List[str]) -> pd.DataFrame:
    """
    Computes Variance Inflation Factor (VIF) using linear regression (R^2),
    completely avoiding external DLL load issues.
    Formula: VIF_i = 1 / (1 - R_i^2)
    """
    X = df[numeric_features].dropna().values
    vif_data = []

    for i in range(len(numeric_features)):
        y_i = X[:, i]
        X_other = np.delete(X, i, axis=1)

        # Regress feature i on all other features to find R^2
        reg = LinearRegression().fit(X_other, y_i)
        r2 = reg.score(X_other, y_i)

        vif = 1.0 / (1.0 - r2) if (1.0 - r2) > 1e-10 else float("inf")
        vif_data.append({"Feature": numeric_features[i], "VIF": round(float(vif), 3)})

    return pd.DataFrame(vif_data).sort_values("VIF", ascending=False).reset_index(drop=True)


def apply_holm_bonferroni(p_values: List[float], alpha: float = 0.05) -> Tuple[np.ndarray, np.ndarray]:
    """
    Applies Holm-Bonferroni step-down correction on a list of p-values.
    Returns:
    --------
    (reject: np.ndarray of bool, p_adjusted: np.ndarray of float)
    """
    p_vals = np.asarray(p_values, dtype=float)
    m = len(p_vals)
    order = np.argsort(p_vals)
    reverse_order = np.empty(m, dtype=int)
    reverse_order[order] = np.arange(m)

    sorted_p = p_vals[order]
    # Multipliers: m, m-1, m-2, ..., 1
    multipliers = np.arange(m, 0, -1)
    adj_p = sorted_p * multipliers

    # Ensure monotonicity: p_adj[i] = max(p_adj[i-1], p_adj[i])
    adj_p = np.maximum.accumulate(adj_p)
    adj_p = np.clip(adj_p, 0.0, 1.0)

    # Reorder back
    p_adjusted = adj_p[reverse_order]
    reject = p_adjusted <= alpha

    return reject, p_adjusted
