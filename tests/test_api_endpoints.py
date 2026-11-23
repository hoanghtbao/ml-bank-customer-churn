"""
Integration tests for FastAPI REST API endpoints.
Uses FastAPI TestClient to test endpoints without requiring external network ports.
"""

import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True

def test_dashboard_overview():
    response = client.get("/api/dashboard/overview")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["total_customers"] == 10000
    assert "country_distribution" in data
    assert "product_holding_curve" in data
    assert "age_lifecycle" in data

def test_predict_single_normal():
    payload = {
        "CreditScore": 650,
        "Geography": "Germany",
        "Gender": "Female",
        "Age": 50,
        "Tenure": 3,
        "Balance": 125000.0,
        "NumOfProducts": 1,
        "HasCrCard": 1,
        "IsActiveMember": 0,
        "EstimatedSalary": 95000.0,
        "Complain": 0,
        "Satisfaction_Score": 2,
        "Card_Type": "PLATINUM",
        "Point_Earned": 420
    }
    response = client.post("/api/predict/single", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "churn_probability" in data
    assert "churn_prediction" in data
    assert "next_best_action" in data
    assert "call_script" in data
    assert "annual_customer_value_eur" in data
    assert data["annual_customer_value_eur"] > 0
    assert data["rule_override_applied"] is False

def test_predict_single_complaint_override():
    payload = {
        "CreditScore": 700,
        "Geography": "France",
        "Gender": "Male",
        "Age": 35,
        "Tenure": 5,
        "Balance": 50000.0,
        "NumOfProducts": 2,
        "HasCrCard": 1,
        "IsActiveMember": 1,
        "EstimatedSalary": 60000.0,
        "Complain": 1,
        "Satisfaction_Score": 1,
        "Card_Type": "GOLD",
        "Point_Earned": 300
    }
    response = client.post("/api/predict/single", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["rule_override_applied"] is True
    assert data["churn_prediction"] == 1
    assert data["churn_probability"] >= 0.99

def test_what_if_sensitivity():
    payload = {
        "customer": {
            "CreditScore": 650,
            "Geography": "Germany",
            "Gender": "Female",
            "Age": 52,
            "Tenure": 3,
            "Balance": 125000.0,
            "NumOfProducts": 1,
            "HasCrCard": 1,
            "IsActiveMember": 0,
            "EstimatedSalary": 95000.0,
            "Complain": 0,
            "Satisfaction_Score": 2,
            "Card_Type": "PLATINUM",
            "Point_Earned": 420
        },
        "sim_is_active": 1,
        "sim_num_products": 2,
        "sim_balance": 125000.0
    }
    response = client.post("/api/predict/what-if", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "original_probability" in data
    assert "simulated_probability" in data
    assert "delta_probability" in data
    # Activation & product optimization should decrease risk
    assert data["simulated_probability"] < data["original_probability"]

def test_strategy_quadrants():
    response = client.get("/api/strategy/quadrants")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "sample_points" in data
    assert len(data["summary"]) == 4

def test_strategy_roi_simulate():
    payload = {
        "vip_cost": 150.0,
        "std_cost": 25.0,
        "vip_save_rate": 0.40,
        "std_save_rate": 0.25,
        "margin_rate": 0.05,
        "base_service_fee": 200.0
    }
    response = client.post("/api/strategy/roi-simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Total_Campaign" in data
    assert "total_intervention_cost_eur" in data["Total_Campaign"]
    assert "total_net_profit_eur" in data["Total_Campaign"]
    assert "total_roi_pct" in data["Total_Campaign"]
    assert data["Total_Campaign"]["total_roi_pct"] > 500

def test_governance_metadata():
    response = client.get("/api/governance/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "metadata" in data
    assert "decile_lift_table" in data
    assert "ablation_studies" in data


def test_batch_search_and_customer_lookup():
    search_res = client.get("/api/batch/search", params={"q": "Hargrave", "limit": 5})
    assert search_res.status_code == 200
    payload = search_res.json()
    assert payload["count"] >= 1
    first = payload["results"][0]
    cid = first["CustomerId"]

    detail_res = client.get(f"/api/batch/customer/{cid}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["CustomerId"] == cid
    assert "Balance" in detail

    missing_res = client.get("/api/batch/customer/999999999")
    assert missing_res.status_code == 404
