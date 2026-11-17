"""
Model Training and Multi-Scaler / Multi-Model Experimentation Module.
Roleplay: EuroVanguard Bank.
Standard: CRISP-DM Phase 5 (Modeling) & Teacher Barem Alignment.
"""

from typing import Dict, List, Tuple, Any
import os
import joblib
import pandas as pd
import numpy as np

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
)

# Standard feature definitions
CATEGORICAL_FEATURES = [
    'Geography', 'Gender', 'Card_Type', 'Product_Holding_Risk_Tier', 'Age_Lifecycle_Stage'
]

NUMERIC_FEATURES = [
    'CreditScore', 'Age', 'Tenure', 'Balance', 'NumOfProducts', 'HasCrCard',
    'IsActiveMember', 'EstimatedSalary', 'Satisfaction_Score', 'Point_Earned',
    'IsZeroBalance', 'Balance_To_Salary_Ratio', 'Products_Per_Tenure', 'Engagement_Score'
]

SCALERS = {
    'StandardScaler': StandardScaler(),
    'MinMaxScaler': MinMaxScaler(),
    'RobustScaler': RobustScaler()
}


def build_preprocessor(
    scaler_name: str = 'StandardScaler',
    numeric_cols: List[str] = None,
    categorical_cols: List[str] = None
) -> ColumnTransformer:
    """Creates a ColumnTransformer with specified scaler and one-hot encoder."""
    if numeric_cols is None:
        numeric_cols = NUMERIC_FEATURES
    if categorical_cols is None:
        categorical_cols = CATEGORICAL_FEATURES

    scaler = SCALERS.get(scaler_name, StandardScaler())
    return ColumnTransformer(
        transformers=[
            ('num', scaler, numeric_cols),
            ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), categorical_cols)
        ]
    )


def get_model_catalog(random_state: int = 42) -> Dict[str, Any]:
    """Returns the dictionary of 4 competitive candidate classifiers."""
    return {
        'LogisticRegression': LogisticRegression(max_iter=1000, random_state=random_state),
        'DecisionTree': DecisionTreeClassifier(max_depth=6, min_samples_split=20, random_state=random_state),
        'RandomForest': RandomForestClassifier(n_estimators=150, max_depth=10, min_samples_split=10, random_state=random_state),
        'XGBoost': XGBClassifier(n_estimators=120, max_depth=5, learning_rate=0.08, eval_metric='logloss', random_state=random_state)
    }


def evaluate_models_and_scalers(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    numeric_cols: List[str] = None,
    categorical_cols: List[str] = None,
    k_best: int = 15,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Pipeline]]:
    """
    Trains and evaluates all (Model, Scaler) pairs.
    Produces:
    1. df_result: Train vs Validation metrics for overfitting diagnosis (teacher barem).
    2. df_if_values: Feature importances across models (with 'Omitted' for linear models).
    3. pipelines: Dictionary of trained pipelines.
    """
    if numeric_cols is None:
        numeric_cols = NUMERIC_FEATURES
    if categorical_cols is None:
        categorical_cols = CATEGORICAL_FEATURES

    feature_cols = numeric_cols + categorical_cols
    X_train = train_df[feature_cols]
    y_train = train_df['Exited']
    X_val = val_df[feature_cols]
    y_val = val_df['Exited']

    models = get_model_catalog(random_state=random_state)
    results = []
    trained_pipelines = {}
    fi_dict = {}

    for model_name, model in models.items():
        for scaler_name in SCALERS.keys():
            preprocessor = build_preprocessor(scaler_name, numeric_cols, categorical_cols)
            
            steps = [('preprocessor', preprocessor)]
            if k_best and k_best < len(feature_cols):
                steps.append(('select_k_best', SelectKBest(score_func=f_classif, k=k_best)))
            steps.append(('classifier', model))

            pipeline = Pipeline(steps)
            pipeline.fit(X_train, y_train)

            # Predictions
            train_preds = pipeline.predict(X_train)
            train_probs = pipeline.predict_proba(X_train)[:, 1]
            val_preds = pipeline.predict(X_val)
            val_probs = pipeline.predict_proba(X_val)[:, 1]

            # Metrics
            train_acc = accuracy_score(y_train, train_preds)
            val_acc = accuracy_score(y_val, val_preds)
            train_prec = precision_score(y_train, train_preds, zero_division=0)
            val_prec = precision_score(y_val, val_preds, zero_division=0)
            train_rec = recall_score(y_train, train_preds, zero_division=0)
            val_rec = recall_score(y_val, val_preds, zero_division=0)
            train_f1 = f1_score(y_train, train_preds, zero_division=0)
            val_f1 = f1_score(y_val, val_preds, zero_division=0)
            train_auc = roc_auc_score(y_train, train_probs)
            val_auc = roc_auc_score(y_val, val_probs)

            pair_name = f"{model_name}_{scaler_name}"
            trained_pipelines[pair_name] = pipeline

            results.append({
                'Model': model_name,
                'Scaler': scaler_name,
                'Train Accuracy': round(train_acc, 4),
                'Val Accuracy': round(val_acc, 4),
                'Train Precision': round(train_prec, 4),
                'Val Precision': round(val_prec, 4),
                'Train Recall': round(train_rec, 4),
                'Val Recall': round(val_rec, 4),
                'Train F1': round(train_f1, 4),
                'Val F1': round(val_f1, 4),
                'Train ROC-AUC': round(train_auc, 4),
                'Val ROC-AUC': round(val_auc, 4)
            })

            # Feature importances for StandardScaler version
            if scaler_name == 'StandardScaler':
                if hasattr(model, 'feature_importances_'):
                    # Retrieve transformed feature names
                    if 'select_k_best' in pipeline.named_steps:
                        mask = pipeline.named_steps['select_k_best'].get_support()
                        raw_features = pipeline.named_steps['preprocessor'].get_feature_names_out()
                        selected_features = raw_features[mask]
                    else:
                        selected_features = pipeline.named_steps['preprocessor'].get_feature_names_out()
                    
                    fi_series = pd.Series(model.feature_importances_, index=selected_features)
                    fi_dict[model_name] = fi_series
                else:
                    fi_dict[model_name] = 'Omitted'

    df_result = pd.DataFrame(results)

    # Format df_if_values
    df_if_values = pd.DataFrame()
    for m_name, fi in fi_dict.items():
        if isinstance(fi, pd.Series):
            df_if_values[m_name] = fi.round(4)
        else:
            df_if_values[m_name] = 'Omitted'

    return df_result, df_if_values, trained_pipelines


def run_ablation_study(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    random_state: int = 42
) -> pd.DataFrame:
    """
    Executes the 4 Core Ablation Scenarios:
    - Scenario A: Standard Early-Warning Proactive Model (Without Complain)
    - Scenario A1: Strict Model (Without Complain and Without Satisfaction_Score)
    - Scenario A2: AI Fairness Model (Without Complain and Without Gender)
    - Scenario B: Target Leakage Benchmark (With Complain included)
    """
    scenarios = [
        {
            'Scenario': 'Scenario A (Proactive Champion)',
            'Description': 'Standard Early-Warning (Excludes Complain)',
            'num_cols': NUMERIC_FEATURES,
            'cat_cols': CATEGORICAL_FEATURES
        },
        {
            'Scenario': 'Scenario A1 (Strict Operational)',
            'Description': 'Excludes Complain and Satisfaction_Score',
            'num_cols': [c for c in NUMERIC_FEATURES if c != 'Satisfaction_Score'],
            'cat_cols': CATEGORICAL_FEATURES
        },
        {
            'Scenario': 'Scenario A2 (AI Fairness & Ethics)',
            'Description': 'Excludes Complain and Gender (Gender-blind)',
            'num_cols': NUMERIC_FEATURES,
            'cat_cols': [c for c in CATEGORICAL_FEATURES if c != 'Gender']
        },
        {
            'Scenario': 'Scenario B (Target Leakage Benchmark)',
            'Description': 'Includes Complain (Demonstrates Artificial Flaw)',
            'num_cols': NUMERIC_FEATURES + ['Complain'],
            'cat_cols': CATEGORICAL_FEATURES
        }
    ]

    ablation_results = []

    for sc in scenarios:
        pre = build_preprocessor('StandardScaler', sc['num_cols'], sc['cat_cols'])
        model = XGBClassifier(n_estimators=120, max_depth=5, learning_rate=0.08, eval_metric='logloss', random_state=random_state)
        pipe = Pipeline([
            ('preprocessor', pre),
            ('classifier', model)
        ])

        cols = sc['num_cols'] + sc['cat_cols']
        pipe.fit(train_df[cols], train_df['Exited'])

        val_probs = pipe.predict_proba(val_df[cols])[:, 1]
        val_preds = (val_probs >= 0.5).astype(int)

        val_acc = accuracy_score(val_df['Exited'], val_preds)
        val_prec = precision_score(val_df['Exited'], val_preds, zero_division=0)
        val_rec = recall_score(val_df['Exited'], val_preds, zero_division=0)
        val_f1 = f1_score(val_df['Exited'], val_preds, zero_division=0)
        val_auc = roc_auc_score(val_df['Exited'], val_probs)

        ablation_results.append({
            'Scenario': sc['Scenario'],
            'Description': sc['Description'],
            'Val Accuracy': round(val_acc, 4),
            'Val Precision': round(val_prec, 4),
            'Val Recall': round(val_rec, 4),
            'Val F1': round(val_f1, 4),
            'Val ROC-AUC': round(val_auc, 4),
            'Leakage Status': 'LEAKAGE DETECTED (Artificial)' if 'B' in sc['Scenario'] else 'CLEAN (Production-Safe)'
        })

    return pd.DataFrame(ablation_results)
