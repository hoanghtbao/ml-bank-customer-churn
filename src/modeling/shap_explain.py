"""
SHAP Explainability Module for Tree-based Early-Warning Models.
Roleplay: BB Bank.
Provides global and local feature attribution for decision support and regulatory audit.
"""

from typing import List, Dict, Any, Tuple
import os
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap
from sklearn.pipeline import Pipeline


def get_tree_explainer_and_features(
    pipeline: Pipeline,
    df_sample: pd.DataFrame,
    feature_cols: List[str]
) -> Tuple[shap.TreeExplainer, np.ndarray, List[str]]:
    """
    Extracts the tree classifier and transformed feature matrix from pipeline.
    """
    preprocessor = pipeline.named_steps['preprocessor']
    classifier = pipeline.named_steps['classifier']

    X_trans = preprocessor.transform(df_sample[feature_cols])
    raw_feature_names = preprocessor.get_feature_names_out()

    # Clean feature names for clean presentation
    cleaned_feature_names = [
        f.replace('num__', '').replace('cat__', '') for f in raw_feature_names
    ]

    explainer = shap.TreeExplainer(classifier)
    return explainer, X_trans, cleaned_feature_names


def plot_and_save_shap_summary(
    explainer: shap.TreeExplainer,
    X_trans: np.ndarray,
    feature_names: List[str],
    output_path: str = 'reports/figures/fig_14_shap_summary.png',
    max_display: int = 15
) -> None:
    """
    Generates and saves the Global SHAP beeswarm / summary plot.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    shap_vals = explainer(X_trans)
    shap_vals.feature_names = feature_names

    plt.figure(figsize=(10, 7))
    shap.plots.beeswarm(shap_vals, max_display=max_display, show=False)
    plt.title("Biểu đồ Phân bổ Đóng góp Đặc trưng Toàn cục (Global SHAP Beeswarm Plot)", fontsize=12, pad=15)
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()


def plot_and_save_shap_waterfall(
    explainer: shap.TreeExplainer,
    X_trans: np.ndarray,
    feature_names: List[str],
    sample_index: int = 0,
    output_path: str = 'reports/figures/fig_15_shap_waterfall_sample.png',
    max_display: int = 10
) -> None:
    """
    Generates and saves a Local SHAP waterfall plot for a specific customer instance.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    shap_vals = explainer(X_trans)
    shap_vals.feature_names = feature_names

    plt.figure(figsize=(9, 6))
    shap.plots.waterfall(shap_vals[sample_index], max_display=max_display, show=False)
    plt.title(f"Giải thích Rủi ro Cục bộ Khách hàng Mẫu #{sample_index} (Local SHAP Waterfall)", fontsize=11, pad=15)
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()


def get_customer_top_drivers(
    explainer: shap.TreeExplainer,
    pipeline: Pipeline,
    customer_df: pd.DataFrame,
    feature_cols: List[str],
    top_n: int = 3
) -> List[Dict[str, Any]]:
    """
    Extracts top positive (risk-increasing) and negative (risk-decreasing) feature drivers
    for an individual customer to display in the BB Bank Retention Advisor.
    """
    preprocessor = pipeline.named_steps['preprocessor']
    X_trans = preprocessor.transform(customer_df[feature_cols])
    raw_feature_names = preprocessor.get_feature_names_out()
    cleaned_names = [f.replace('num__', '').replace('cat__', '') for f in raw_feature_names]

    shap_vals = explainer(X_trans)
    values = shap_vals[0].values

    drivers = []
    for name, val in zip(cleaned_names, values):
        drivers.append({
            'Feature': name,
            'SHAP_Value': round(float(val), 4),
            'Impact': 'Tăng rủi ro (Risk Factor)' if val > 0 else 'Giảm rủi ro (Protective Factor)'
        })

    drivers_sorted = sorted(drivers, key=lambda x: abs(x['SHAP_Value']), reverse=True)
    return drivers_sorted[:top_n]
