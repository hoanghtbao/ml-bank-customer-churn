"""
Pydantic Schemas for BB Bank Customer Churn FastAPI Backend.
Roleplay: BB Bank (France, Germany, Spain).
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class CustomerProfileInput(BaseModel):
    """Input payload for scoring an individual customer."""
    CustomerId: Optional[int] = Field(default=15700001, description="Customer unique ID")
    Surname: str = Field(default="Müller", description="Customer surname")
    CreditScore: int = Field(default=680, ge=350, le=850, description="Credit score (350-850)")
    Geography: str = Field(default="Germany", description="Country: France, Germany, or Spain")
    Gender: str = Field(default="Male", description="Gender: Male or Female")
    Age: int = Field(default=45, ge=18, le=100, description="Age in years")
    Tenure: int = Field(default=5, ge=0, le=10, description="Tenure in years")
    Balance: float = Field(default=120000.0, ge=0.0, description="Account balance in EUR")
    NumOfProducts: int = Field(default=2, ge=1, le=4, description="Number of products held")
    HasCrCard: int = Field(default=1, ge=0, le=1, description="Credit card holder (0 or 1)")
    IsActiveMember: int = Field(default=1, ge=0, le=1, description="Active status (0 or 1)")
    EstimatedSalary: float = Field(default=90000.0, ge=0.0, description="Estimated annual salary in EUR")
    Satisfaction_Score: Optional[int] = Field(default=3, ge=1, le=5, description="Survey satisfaction score")
    Card_Type: Optional[str] = Field(default="DIAMOND", description="Card tier: SILVER, GOLD, PLATINUM, DIAMOND")
    Point_Earned: Optional[int] = Field(default=600, ge=0, description="Loyalty points earned")
    Complain: Optional[int] = Field(default=0, ge=0, le=1, description="Open complaint flag (0 or 1)")
    rm_name: Optional[str] = Field(default="Hoàng Hữu Bảo (Senior RM)", description="Relationship Manager name")


class SinglePredictionResponse(BaseModel):
    """Response payload for single customer prediction and decision support."""
    CustomerId: int
    Surname: str
    churn_probability: float
    churn_prediction: int
    threshold_used: float
    risk_tier: str
    rule_override_applied: bool
    override_message: str
    annual_customer_value_eur: float
    action_cost_eur: float
    break_even_threshold: float
    expected_net_gain_eur: float
    next_best_action: Dict[str, Any]
    call_script: str
    engineered_features: Dict[str, Any]


class WhatIfRequest(BaseModel):
    """Request payload for What-If sensitivity simulation."""
    customer: CustomerProfileInput
    sim_is_active: int = Field(ge=0, le=1)
    sim_num_products: int = Field(ge=1, le=4)
    sim_balance: float = Field(ge=0.0)


class WhatIfResponse(BaseModel):
    """Response payload for What-If sensitivity simulation."""
    original_probability: float
    simulated_probability: float
    delta_probability: float
    is_risk_reduced: bool
    recommendation_note: str


class RoiSimulateRequest(BaseModel):
    """Payload for real-time Tiered ROI simulation."""
    vip_cost: float = Field(default=150.0, ge=10.0, le=1000.0)
    std_cost: float = Field(default=25.0, ge=5.0, le=500.0)
    vip_save_rate: float = Field(default=0.40, ge=0.05, le=0.95)
    std_save_rate: float = Field(default=0.25, ge=0.05, le=0.95)
    margin_rate: float = Field(default=0.05, ge=0.005, le=0.20)
    base_service_fee: float = Field(default=200.0, ge=0.0, le=2000.0)
