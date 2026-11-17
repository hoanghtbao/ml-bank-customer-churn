"""
Model Evaluation, Threshold Optimization, and 1-Time Test Holdout Module.
Roleplay: EuroVanguard Bank.
Standard: CRISP-DM Phase 5 (Evaluation) & Enterprise Model Governance.
"""

from typing import Dict, List, Tuple, Any
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix
)


def tune_decision_threshold(
    pipeline: Pipeline,
    val_df: pd.DataFrame,
    feature_cols: List[str],
    target_col: str = 'Exited',
    cost_contact: float = 50.0,
    save_rate: float = 0.30,
    margin_rate: float = 0.05,
    base_service_fee: float = 200.0
) -> Tuple[Dict[str, Any], pd.DataFrame]:
    """
    Optimizes decision threshold on the Validation set for:
    1. Maximum F1-score (Statistical Champion Threshold T*_F1)
    2. Maximum Net Financial Gain (Business ROI Champion Threshold T*_ROI)

    CLV Formula for Customer i:
    CLV_i = Balance_i * margin_rate + base_service_fee
    Net ROI = Sum_{i in TP} (save_rate * CLV_i) - (TP + FP) * cost_contact
    """
    X_val = val_df[feature_cols]
    y_val = val_df[target_col].values
    balances = val_df['Balance'].values

    y_probs = pipeline.predict_proba(X_val)[:, 1]

    thresholds = np.linspace(0.05, 0.95, 91)
    curve_data = []

    best_f1 = -1.0
    best_t_f1 = 0.5
    best_net_roi = -np.inf
    best_t_roi = 0.5

    for t in thresholds:
        preds = (y_probs >= t).astype(int)
        cm = confusion_matrix(y_val, preds, labels=[0, 1])
        tn, fp, fn, tp = cm.ravel()

        acc = accuracy_score(y_val, preds)
        prec = precision_score(y_val, preds, zero_division=0)
        rec = recall_score(y_val, preds, zero_division=0)
        f1 = f1_score(y_val, preds, zero_division=0)

        # Financial calculation
        tp_mask = (y_val == 1) & (preds == 1)
        clv_saved = (balances[tp_mask] * margin_rate + base_service_fee) * save_rate
        total_value_saved = np.sum(clv_saved)
        intervention_cost = (tp + fp) * cost_contact
        net_roi = total_value_saved - intervention_cost

        if f1 > best_f1:
            best_f1 = f1
            best_t_f1 = t

        if net_roi > best_net_roi:
            best_net_roi = net_roi
            best_t_roi = t

        curve_data.append({
            'Threshold': round(t, 2),
            'Accuracy': round(acc, 4),
            'Precision': round(prec, 4),
            'Recall': round(rec, 4),
            'F1': round(f1, 4),
            'TP': tp,
            'FP': fp,
            'TN': tn,
            'FN': fn,
            'Targeted': tp + fp,
            'Value_Saved_EUR': round(total_value_saved, 2),
            'Intervention_Cost_EUR': round(intervention_cost, 2),
            'Net_ROI_EUR': round(net_roi, 2)
        })

    df_curve = pd.DataFrame(curve_data)

    optimization_summary = {
        'optimal_f1_threshold': round(best_t_f1, 2),
        'max_f1_score': round(best_f1, 4),
        'optimal_roi_threshold': round(best_t_roi, 2),
        'max_net_roi_eur': round(best_net_roi, 2),
        'baseline_05_f1': round(df_curve.loc[df_curve['Threshold'] == 0.50, 'F1'].values[0], 4),
        'baseline_05_net_roi': round(df_curve.loc[df_curve['Threshold'] == 0.50, 'Net_ROI_EUR'].values[0], 2)
    }

    return optimization_summary, df_curve


def evaluate_test_set(
    pipeline: Pipeline,
    test_df: pd.DataFrame,
    feature_cols: List[str],
    target_col: str = 'Exited',
    threshold: float = 0.5,
    n_bootstrap: int = 1000,
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Executes final 1-time holdout evaluation on the untouched Test set (1,500 samples).
    Computes exact point metrics, 95% Bootstrap Confidence Intervals, and Decile Lift Table.
    """
    X_test = test_df[feature_cols]
    y_test = test_df[target_col].values

    y_probs = pipeline.predict_proba(X_test)[:, 1]
    y_preds = (y_probs >= threshold).astype(int)

    # Point metrics
    acc = accuracy_score(y_test, y_preds)
    prec = precision_score(y_test, y_preds, zero_division=0)
    rec = recall_score(y_test, y_preds, zero_division=0)
    f1 = f1_score(y_test, y_preds, zero_division=0)
    auc = roc_auc_score(y_test, y_probs)
    pr_auc = average_precision_score(y_test, y_probs)

    cm = confusion_matrix(y_test, y_preds, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()

    # 95% Bootstrap Confidence Intervals (B = 1000)
    rng = np.random.default_rng(random_state)
    n_samples = len(y_test)
    boot_aucs = []
    boot_f1s = []

    for _ in range(n_bootstrap):
        idx = rng.choice(n_samples, size=n_samples, replace=True)
        if len(np.unique(y_test[idx])) < 2:
            continue
        b_probs = y_probs[idx]
        b_preds = (b_probs >= threshold).astype(int)
        boot_aucs.append(roc_auc_score(y_test[idx], b_probs))
        boot_f1s.append(f1_score(y_test[idx], b_preds, zero_division=0))

    auc_ci = (round(np.percentile(boot_aucs, 2.5), 4), round(np.percentile(boot_aucs, 97.5), 4))
    f1_ci = (round(np.percentile(boot_f1s, 2.5), 4), round(np.percentile(boot_f1s, 97.5), 4))

    # Decile Gain & Cumulative Lift Table
    test_eval_df = pd.DataFrame({
        'Exited': y_test,
        'Probability': y_probs
    }).sort_values(by='Probability', ascending=False).reset_index(drop=True)

    test_eval_df['Decile'] = pd.qcut(test_eval_df.index, q=10, labels=list(range(1, 11)))
    total_churners = test_eval_df['Exited'].sum()
    global_churn_rate = test_eval_df['Exited'].mean()

    decile_records = []
    cum_churn = 0

    for decile_num in range(1, 11):
        d_df = test_eval_df[test_eval_df['Decile'] == decile_num]
        d_count = len(d_df)
        d_churn = d_df['Exited'].sum()
        d_non_churn = d_count - d_churn
        d_churn_rate = d_churn / d_count if d_count > 0 else 0.0

        cum_churn += d_churn
        cum_gain_pct = (cum_churn / total_churners) * 100.0 if total_churners > 0 else 0.0
        cum_lift = (cum_churn / (decile_num * d_count)) / global_churn_rate if (decile_num * d_count) > 0 else 0.0

        decile_records.append({
            'Decile': decile_num,
            'Customer_Count': d_count,
            'Churn_Count': d_churn,
            'Non_Churn_Count': d_non_churn,
            'Decile_Churn_Rate_Pct': round(d_churn_rate * 100, 2),
            'Cum_Churn_Count': cum_churn,
            'Cum_Gain_Pct': round(cum_gain_pct, 2),
            'Cum_Lift': round(cum_lift, 2)
        })

    df_deciles = pd.DataFrame(decile_records)

    return {
        'threshold_used': round(threshold, 2),
        'accuracy': round(acc, 4),
        'precision': round(prec, 4),
        'recall': round(rec, 4),
        'f1_score': round(f1, 4),
        'roc_auc': round(auc, 4),
        'pr_auc': round(pr_auc, 4),
        'confusion_matrix': {'tn': int(tn), 'fp': int(fp), 'fn': int(fn), 'tp': int(tp)},
        'roc_auc_95_ci': auc_ci,
        'f1_95_ci': f1_ci,
        'decile_lift_table': df_deciles
    }
