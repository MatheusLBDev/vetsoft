from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from collections import defaultdict
import crud
from database import SessionLocal
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from datetime import timedelta

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/forecast/sales")
def get_sales_forecast(db: Session = Depends(get_db)):
    sales = crud.get_sales(db, skip=0, limit=1000)  # Get all sales
    if not sales:
        return {"message": "No sales data available for forecasting."}

    # Prepare data for time series analysis of total sales
    sales_data = [{"date": sale.date, "total": sale.total} for sale in sales]
    print(sales_data)
    try:
        df = pd.DataFrame(sales_data)
        df['date'] = pd.to_datetime(df['date'], format='ISO8601', utc=True)
    except ValueError as e:
        return {"message": f"Error parsing dates: {e}"}
    df = df.set_index('date')
    df = df.resample('D').sum().fillna(0)  # Resample to daily sales, fill missing days with 0

    if len(df) < 14:  # Need at least 2 weeks of data for a meaningful forecast
        return {"message": "Não há dados de vendas suficientes para uma previsão confiável."}

    # Fit a simple ARIMA model for total sales
    model = ARIMA(df['total'], order=(5, 1, 0))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=30)
    total_forecast_30_days = sum(forecast)

    # Calculate product proportions from historical sales
    product_sales = defaultdict(int)
    total_items_sold = 0
    for sale in sales:
        for item in sale.items:
            if item.product_id:
                product_sales[item.product_id] += item.quantity
                total_items_sold += item.quantity

    if total_items_sold == 0:
        return {"message": "No product sales data available for inventory suggestion."}

    product_proportions = {pid: count / total_items_sold for pid, count in product_sales.items()}

    # Estimate future sales for each product and generate suggestions
    products = crud.get_products(db, skip=0, limit=1000)
    suggestions = []
    for product in products:
        if product.id in product_proportions:
            estimated_sales = total_forecast_30_days * product_proportions[product.id]
            if estimated_sales > product.stock:
                suggestions.append({
                    "product_name": product.name,
                    "current_stock": product.stock,
                    "estimated_sales_30_days": round(estimated_sales),
                    "suggestion": f"Estoque recomendado: {round(estimated_sales - product.stock)} unidades."
                })

    # Prepare forecast data for response
    forecast_dates = [df.index[-1] + timedelta(days=i) for i in range(1, 31)]
    forecast_data = {
        "forecast": [
            {"date": date.strftime('%Y-%m-%d'), "predicted_sales": value}
            for date, value in zip(forecast_dates, forecast)
        ],
        "summary": "Previsão de vendas para os próximos 30 dias.",
        "inventory_suggestions": suggestions
    }

    return forecast_data
