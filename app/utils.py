"""
Utility functions and cached loaders for Streamlit Decision Support System.
Roleplay: EuroVanguard Bank.
"""

import os
import sys
import json
import joblib
import pandas as pd
import streamlit as st

# Universal project root resolution
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.modeling.predict import predict_batch, predict_customer
from src.business.segmentation import assign_four_quadrants, get_quadrant_summary
from src.business.retention_advisor import (
    recommend_next_best_action,
    generate_call_script,
    calculate_tiered_roi
)


@st.cache_resource
def load_champion_pipeline():
    """Loads the trained champion model pipeline."""
    model_path = os.path.join(PROJECT_ROOT, 'models', 'churn_early_warning_pipeline.joblib')
    if not os.path.exists(model_path):
        st.error(f"Không tìm thấy tệp mô hình tại: {model_path}")
        return None
    return joblib.load(model_path)


@st.cache_data
def load_metadata():
    """Loads model governance metadata."""
    meta_path = os.path.join(PROJECT_ROOT, 'models', 'model_metadata.json')
    if os.path.exists(meta_path):
        with open(meta_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


@st.cache_data
def load_full_dataset():
    """Loads the full engineered dataset (10,000 customers)."""
    data_path = os.path.join(PROJECT_ROOT, 'data', 'processed', 'full_engineered.csv')
    if not os.path.exists(data_path):
        # Fallback to interim or raw
        data_path = os.path.join(PROJECT_ROOT, 'Customer-Churn-Records.csv')
    return pd.read_csv(data_path)


@st.cache_data
def get_pre_scored_data():
    """Returns the full dataset pre-scored with 4 Quadrants for fast UI rendering."""
    pipeline = load_champion_pipeline()
    df = load_full_dataset()
    if pipeline is not None:
        scored = predict_batch(pipeline, df, threshold=0.45, enforce_complain_rule=True)
        scored = assign_four_quadrants(scored, risk_threshold=0.45, high_value_threshold=80000.0)
        return scored
    return df
