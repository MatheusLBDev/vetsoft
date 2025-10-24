from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from collections import defaultdict
import crud
from database import SessionLocal
import polars as pl
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
    try:
        df = pl.from_dicts(sales_data)
        df = df.with_columns(pl.col("date").str.to_datetime())
    except Exception as e:
        return {"message": f"Error parsing dates: {e}"}
    
    df_resampled = df.sort("date").group_by_dynamic("date", every="1d").agg(pl.col("total").sum()).fill_null(0)

    if len(df_resampled) < 14:  # Need at least 2 weeks of data for a meaningful forecast
        return {"message": "Não há dados de vendas suficientes para uma previsão confiável."}

    # Calculate a 7-day Exponential Moving Average (EMA)
    span = 7
    df_with_ema = df_resampled.with_columns(
        pl.col("total").ewm_mean(span=span).alias("ema")
    )

    # For the forecast, we'll take the last EMA value and project it forward.
    last_ema = df_with_ema.select(pl.last("ema")).item()
    if last_ema is None:
        last_ema = 0
    
    forecast_values = [last_ema] * 30
    total_forecast_30_days = sum(forecast_values)

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
    last_date = df_resampled.select(pl.col("date")).max().item()
    forecast_dates = [last_date + timedelta(days=i) for i in range(1, 31)]
    forecast_data = {
        "forecast": [
            {"date": date.strftime('%Y-%m-%d'), "predicted_sales": value}
            for date, value in zip(forecast_dates, forecast_values)
        ],
        "summary": "Previsão de vendas para os próximos 30 dias (baseada em Média Móvel Exponencial).",
        "inventory_suggestions": suggestions
    }

    return forecast_data
