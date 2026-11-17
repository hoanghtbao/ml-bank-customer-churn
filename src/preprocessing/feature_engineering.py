"""
Feature Engineering and Dataset Splitting Module.
Roleplay: EuroVanguard Bank (France, Germany, Spain).
Standard: CRISP-DM Phase 4 (Data Preparation).

This module implements deterministic, row-wise domain feature transformations
grounded in the diagnostic findings from EDA (Giai đoạn 3), avoiding any data leakage,
and provides a 3-way stratified dataset split (70% Train, 15% Validation, 15% Test).
"""

from typing import Tuple, Dict
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split


def categorize_age(row) -> str:
    """
    Phân loại nhóm tuổi khách hàng (Teacher's custom age categorizer adapted for Banking).
    - youth: Tuổi < 30 (nhóm trẻ mới đi làm, churn thấp 7.56%)
    - adult_prime: 30 <= Tuổi < 45 (nhóm tích lũy tài sản, churn 14.45%)
    - adult_mature: 45 <= Tuổi < 60 (nhóm trung niên nguy cơ cao nhất, churn đỉnh điểm 49.45%)
    - senior: Tuổi >= 60 (nhóm hưu trí, churn 27.95%)
    """
    age = row['Age'] if 'Age' in row else row.get('age', 35)
    if age < 30:
        return 'youth'
    elif age < 45:
        return 'adult_prime'
    elif age < 60:
        return 'adult_mature'
    else:
        return 'senior'


def create_domain_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Creates domain-engineered features derived from EDA diagnostic findings.
    All transformations are strictly row-wise and deterministic, preventing data leakage.

    Engineered Features:
    1. IsZeroBalance (int): 1 if Balance == 0.0, else 0. Solves the bimodal zero-inflated trap.
    2. Balance_To_Salary_Ratio (float): Balance / (EstimatedSalary + 1.0). Share of wallet proxy.
    3. Products_Per_Tenure (float): NumOfProducts / (Tenure + 1.0). Speed of cross-sell bundling.
    4. Product_Holding_Risk_Tier (str): 'Optimal' (2), 'Moderate_Risk' (1), 'Extreme_Danger' (3-4).
    5. Age_Lifecycle_Stage (str): '<30', '30-40', '41-50', '51-60', '>60'. Non-linear lifecycle risk.
    6. Engagement_Score (int): Composite score [0-4] from IsActiveMember, HasCrCard, and NumOfProducts == 2.
    7. age_groups (str): 'youth', 'adult_prime', 'adult_mature', 'senior' (Teacher's categorize_age).

    Parameters
    ----------
    df : pd.DataFrame
        Input DataFrame (cleaned technical data).

    Returns
    -------
    pd.DataFrame
        New DataFrame with engineered features appended.
    """
    df_out = df.copy()

    # 1. IsZeroBalance
    df_out['IsZeroBalance'] = (df_out['Balance'] == 0.0).astype(int)

    # 2. Balance_To_Salary_Ratio (Add 1.0 to salary to avoid division by zero)
    salary_safe = df_out['EstimatedSalary'].fillna(0.0).clip(lower=0.0) + 1.0
    balance_safe = df_out['Balance'].fillna(0.0).clip(lower=0.0)
    df_out['Balance_To_Salary_Ratio'] = np.round(balance_safe / salary_safe, 4)

    # 3. Products_Per_Tenure (Add 1.0 to tenure to avoid division by zero for new customers with Tenure=0)
    tenure_safe = df_out['Tenure'].fillna(0.0).clip(lower=0.0) + 1.0
    products_safe = df_out['NumOfProducts'].fillna(1.0)
    df_out['Products_Per_Tenure'] = np.round(products_safe / tenure_safe, 4)

    # 4. Product_Holding_Risk_Tier
    def classify_product_risk(num_prod: int) -> str:
        if num_prod == 2:
            return 'Optimal'
        elif num_prod == 1:
            return 'Moderate_Risk'
        else:
            return 'Extreme_Danger'

    df_out['Product_Holding_Risk_Tier'] = df_out['NumOfProducts'].apply(classify_product_risk)

    # 5. Age_Lifecycle_Stage
    age_bins = [0, 30, 40, 50, 60, 150]
    age_labels = ['<30', '30-40', '41-50', '51-60', '>60']
    df_out['Age_Lifecycle_Stage'] = pd.cut(
        df_out['Age'],
        bins=age_bins,
        labels=age_labels,
        right=True
    ).astype(str)

    # 6. Engagement_Score
    active_comp = df_out['IsActiveMember'].fillna(0).astype(int) * 2
    crcard_comp = df_out['HasCrCard'].fillna(0).astype(int) * 1
    optimal_prod_comp = (df_out['NumOfProducts'] == 2).astype(int) * 1
    df_out['Engagement_Score'] = (active_comp + crcard_comp + optimal_prod_comp).astype(int)

    # 7. age_groups (Teacher's categorize_age)
    df_out['age_groups'] = df_out.apply(categorize_age, axis=1)

    return df_out


def split_dataset_3way(
    df: pd.DataFrame,
    target_col: str = 'Exited',
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Splits the dataset into 3 stratified subsets: Train, Validation, and Test.

    Parameters
    ----------
    df : pd.DataFrame
        Input engineered DataFrame.
    target_col : str, optional
        Target column name for stratification, default 'Exited'.
    train_ratio : float, optional
        Ratio for Train set (default 0.70 = 70%).
    val_ratio : float, optional
        Ratio for Validation set (default 0.15 = 15%).
    test_ratio : float, optional
        Ratio for Test set (default 0.15 = 15%).
    random_state : int, optional
        Seed for reproducibility, default 42.

    Returns
    -------
    Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]
        (train_df, val_df, test_df) with reset indices.
    """
    total_ratio = train_ratio + val_ratio + test_ratio
    if not np.isclose(total_ratio, 1.0):
        raise ValueError(f"Sum of ratios must equal 1.0, got {total_ratio}")

    if target_col not in df.columns:
        raise KeyError(f"Target column '{target_col}' not found in DataFrame.")

    # First split: Separate Train (70%) from Temporary (30% = Val + Test)
    temp_ratio = val_ratio + test_ratio
    train_df, temp_df = train_test_split(
        df,
        test_size=temp_ratio,
        stratify=df[target_col],
        random_state=random_state
    )

    # Second split: Separate Temporary into Validation and Test (50/50 of the remaining 30%)
    relative_test_ratio = test_ratio / temp_ratio
    val_df, test_df = train_test_split(
        temp_df,
        test_size=relative_test_ratio,
        stratify=temp_df[target_col],
        random_state=random_state
    )

    return (
        train_df.reset_index(drop=True),
        val_df.reset_index(drop=True),
        test_df.reset_index(drop=True)
    )


def save_processed_splits(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    test_df: pd.DataFrame,
    output_dir: str = 'data/processed'
) -> Dict[str, str]:
    """
    Saves the 3 stratified dataset splits to CSV files.

    Parameters
    ----------
    train_df : pd.DataFrame
        Training set (70%).
    val_df : pd.DataFrame
        Validation set (15%).
    test_df : pd.DataFrame
        Test set (15%).
    output_dir : str, optional
        Target directory path, default 'data/processed'.

    Returns
    -------
    Dict[str, str]
        Dictionary of saved file paths.
    """
    os.makedirs(output_dir, exist_ok=True)

    paths = {
        'train': os.path.join(output_dir, 'train.csv'),
        'val': os.path.join(output_dir, 'val.csv'),
        'test': os.path.join(output_dir, 'test.csv'),
    }

    train_df.to_csv(paths['train'], index=False)
    val_df.to_csv(paths['val'], index=False)
    test_df.to_csv(paths['test'], index=False)

    return paths
