from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from pydantic import BaseModel
import pandas as pd
import json
from pathlib import Path

from settings import DB_PATH, GEOJSON_PATH
from etl import rebuild_db, get_available_years

app = FastAPI(title="India Crime API", version="1.0")

# CORS: adjust for your frontend origin(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"]
)

def _engine():
    return create_engine(f"sqlite:///{DB_PATH}", future=True)

def _latest_two_years():
    years = get_available_years()
    if len(years) < 2:
        raise HTTPException(400, "Need at least two years of data.")
    return years[-2], years[-1]



# ---------- Schemas ----------
class CityStat(BaseModel):
    city: str
    year_prev: int
    year_curr: int
    crimes_prev: int
    crimes_curr: int
    pct_change: float  # +/- %

# ---------- Admin/ETL ----------
@app.post("/admin/rebuild", tags=["admin"])
def admin_rebuild():
    """Re-scan /data CSVs and rebuild aggregates. Call this after adding new files."""
    return rebuild_db()

@app.post("/admin/upload", tags=["admin"])
async def admin_upload(file: UploadFile = File(...)):
    """Optional: upload a CSV directly, then trigger rebuild."""
    target = Path("data") / file.filename
    target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, "wb") as f:
        f.write(await file.read())
    return rebuild_db()

# ---------- Metadata ----------
@app.get("/years", tags=["meta"])
def years():
    return {"years": get_available_years()}

@app.get("/cities", tags=["meta"])
def cities():
    with _engine().connect() as conn:
        rows = conn.execute(text("SELECT DISTINCT city FROM city_year_agg ORDER BY city")).scalars().all()
    return {"cities": rows}

# ---------- Core queries ----------
@app.get("/stats/city", response_model=CityStat, tags=["stats"])
def city_stats(
    city: str = Query(..., description="Exact city name as in your CSV/GeoJSON"),
    year_prev: int | None = None,
    year_curr: int | None = None,
):
    if year_prev is None or year_curr is None:
        year_prev, year_curr = _latest_two_years()

    q = text("""
        SELECT year, crimes FROM city_year_agg
        WHERE city = :city AND year IN (:y1, :y2)
    """)
    with _engine().connect() as conn:
        res = conn.execute(q.bindparams(city=city, y1=year_prev, y2=year_curr)).all()

    m = {r[0]: r[1] for r in res}
    c_prev, c_curr = int(m.get(year_prev, 0)), int(m.get(year_curr, 0))
    denom = c_prev if c_prev != 0 else 1
    pct = ((c_curr - c_prev) / denom) * 100.0
    return CityStat(city=city, year_prev=year_prev, year_curr=year_curr,
                    crimes_prev=c_prev, crimes_curr=c_curr, pct_change=round(pct, 2))

@app.get("/stats/top", tags=["stats"])
def top_cities(
    k: int = 20,
    year: int | None = None
):
    """Top-K cities by crimes for a given year (defaults to latest)."""
    if year is None:
        _, year = _latest_two_years()
    q = text("""
        SELECT city, crimes FROM city_year_agg WHERE year = :y
        ORDER BY crimes DESC LIMIT :k
    """)
    with _engine().connect() as conn:
        rows = conn.execute(q.bindparams(y=year, k=k)).all()
    return {"year": year, "results": [{"city": r[0], "crimes": int(r[1])} for r in rows]}

@app.get("/map/choropleth", tags=["map"])
def map_choropleth(
    year_prev: int | None = None,
    year_curr: int | None = None
):
    """
    Returns a GeoJSON FeatureCollection where each feature has properties:
    { city, crimes_prev, crimes_curr, pct_change }
    The frontend can color by crimes_curr or pct_change.
    """
    if year_prev is None or year_curr is None:
        year_prev, year_curr = _latest_two_years()

    # read aggregates
    with _engine().connect() as conn:
        df = pd.read_sql(
            text("SELECT city, year, crimes FROM city_year_agg WHERE year IN (:y1, :y2)"),
            con=conn, params={"y1": year_prev, "y2": year_curr}
        )

    if df.empty:
        raise HTTPException(404, "No data for the selected years.")

    pivot = df.pivot_table(index="city", columns="year", values="crimes", fill_value=0).reset_index()
    pivot.columns = ["city"] + [str(c) for c in pivot.columns[1:]]
    if str(year_prev) not in pivot.columns: pivot[str(year_prev)] = 0
    if str(year_curr) not in pivot.columns: pivot[str(year_curr)] = 0

    pivot["crimes_prev"] = pivot[str(year_prev)].astype(int)
    pivot["crimes_curr"] = pivot[str(year_curr)].astype(int)
    denom = pivot["crimes_prev"].replace(0, 1)
    pivot["pct_change"] = ((pivot["crimes_curr"] - pivot["crimes_prev"]) / denom) * 100
    pivot = pivot[["city", "crimes_prev", "crimes_curr", "pct_change"]]

    # join to geojson by city name
    if not GEOJSON_PATH.exists():
        raise HTTPException(500, f"GeoJSON not found at {GEOJSON_PATH.resolve()}")

    geo = json.loads(Path(GEOJSON_PATH).read_text(encoding="utf-8"))
    feat_by_city = {}
    for f in geo["features"]:
        # adjust the key if your geojson differs
        name = str(f["properties"].get("city_name", "")).strip()
        if name:
            feat_by_city[name] = f

    features = []
    for _, row in pivot.iterrows():
        city = row["city"]
        base = feat_by_city.get(city)
        if not base:
            # skip cities we don’t have geometry for
            continue
        # shallow copy + overlay our properties
        props = dict(base["properties"])
        props.update({
            "city": city,
            "crimes_prev": int(row["crimes_prev"]),
            "crimes_curr": int(row["crimes_curr"]),
            "pct_change": round(float(row["pct_change"]), 2)
        })
        features.append({
            "type": "Feature",
            "geometry": base["geometry"],
            "properties": props
        })

    return {"type": "FeatureCollection", "features": features,
            "meta": {"year_prev": year_prev, "year_curr": year_curr}}



from fastapi import Query
import pandas as pd
import pickle
import math

def load_monthly_data():
    # attempt to find monthly aggregated with features
    candidates = [
        Path(__file__).resolve().parents[1] / "prediction" / "crime_prediction_notebook_output" / "monthly_aggregated_with_features.csv",
        Path(__file__).resolve().parents[1] / "prediction" / "monthly_aggregated_with_features.csv",
        Path("prediction") / "crime_prediction_notebook_output" / "monthly_aggregated_with_features.csv"
    ]
    for c in candidates:
        if c.exists():
            return pd.read_csv(c, parse_dates=["year_month"])
    return None

def try_load_pickle(p: Path):
    try:
        with open(p, "rb") as f:
            return pickle.load(f)
    except Exception as e:
        return None
    
# add missing imports at top of file
import joblib
from typing import Optional
import glob
from fastapi import Body

# ---- helper: robust model locator & loader ----
def find_sarima_file_for_city(city: str):
    """Search multiple candidate directories for a sarima file matching the city (case-insensitive)."""
    base = Path(__file__).resolve().parents[1]
    candidate_dirs = [
        base / "prediction" / "sarima_models_improved",
        base / "prediction" / "sarima_models",
        base / "prediction_artifacts" / "sarima_models",
        Path("prediction") / "sarima_models_improved",
        Path("prediction") / "sarima_models",
    ]
    city_l = city.replace(" ", "_").lower()
    for d in candidate_dirs:
        if not d.exists():
            continue
        # find files starting with sarima_ or containing city name
        for f in d.iterdir():
            if not f.is_file():
                continue
            name = f.name.lower()
            if name.startswith("sarima_" + city_l) or city_l in name:
                return f
    # fallback: try glob anywhere under prediction
    for p in glob.glob(str(base / "prediction" / "**" / f"*{city_l}*.pkl"), recursive=True):
        return Path(p)
    return None

def load_sarima_model_by_city(city: str):
    """Return loaded object or raise FileNotFoundError."""
    p = find_sarima_file_for_city(city)
    if p is None:
        raise FileNotFoundError(f"No SARIMA model file found for city '{city}' in prediction folders.")
    try:
        obj = joblib.load(p)
        return obj, p
    except Exception as e:
        raise RuntimeError(f"Failed to load model file {p}: {e}")

# ---- helper: get last observed date for city from monthly feature file (if available) ----
def get_last_observed_date_for_city(city: str) -> Optional[pd.Timestamp]:
    # reuse your load_monthly_data function (assumes it returns DataFrame with 'year_month' and 'city')
    df = load_monthly_data()
    if df is None:
        return None
    df_city = df[df['city'].str.lower() == city.lower()]
    if df_city.empty:
        df_city = df[df['city'].str.lower().str.contains(city.lower())]
    if df_city.empty:
        return None
    last = df_city['year_month'].max()
    try:
        return pd.to_datetime(last)
    except:
        return None

# ---- robust predictor that can handle multiple saved model shapes ----
def sarima_predict_from_loaded(model_obj, months: int, city: str):
    """
    model_obj may be:
      - a statsmodels SARIMAXResults-like object (has .get_forecast)
      - a dict containing {'results': SARIMAXResults, 'transform':..., 'pt_obj':...}
      - other shapes: we try common attributes
    Returns JSON-able dict: {'city', 'months', 'dates': [...], 'values': [...]}
    """
    # resolve results object and inverse-transform function if present
    results_obj = None
    inv_transform_fn = None

    if isinstance(model_obj, dict):
        # common saved shape in your earlier notebook
        if 'results' in model_obj:
            results_obj = model_obj['results']
        elif 'model' in model_obj:
            results_obj = model_obj['model']
        # check transform info
        transform = model_obj.get('transform', 'none')
        pt_obj = model_obj.get('pt_obj', None)
        if transform == 'none':
            inv_transform_fn = lambda x: x
        elif transform == 'log1p':
            inv_transform_fn = lambda x: np.expm1(np.array(x, dtype=float))
        elif transform == 'yeo' and pt_obj is not None:
            inv_transform_fn = lambda x, pt=pt_obj: pt.inverse_transform(np.array(x).reshape(-1,1)).reshape(-1)
        else:
            inv_transform_fn = lambda x: x
    else:
        # assume statsmodels results-like
        results_obj = model_obj
        inv_transform_fn = lambda x: x

    if results_obj is None:
        raise RuntimeError("Loaded model does not contain a usable results object.")

    # obtain forecasted values on model scale
    if hasattr(results_obj, "get_forecast"):
        fc = results_obj.get_forecast(steps=months)
        vals = fc.predicted_mean
    elif hasattr(results_obj, "forecast"):
        vals = results_obj.forecast(steps=months)
    else:
        raise RuntimeError("SARIMA object cannot forecast (missing get_forecast/forecast)")

    # inverse transform and ensure python floats
    try:
        inv_vals = inv_transform_fn(np.array(vals))
    except Exception:
        # fallback: use raw values
        inv_vals = np.array(vals, dtype=float)

    inv_vals = [float(x) for x in np.asarray(inv_vals).reshape(-1)]

    # determine last observed date
    last = get_last_observed_date_for_city(city)
    if last is None:
        from datetime import datetime
        last = pd.to_datetime(datetime.today())

    dates = pd.date_range(start=last + pd.offsets.MonthBegin(1), periods=months, freq='MS').strftime("%Y-%m-01").tolist()
    return {"city": city, "months": months, "dates": dates, "values": inv_vals}

# ---- endpoint: POST JSON body (preferred) ----
from pydantic import BaseModel

class PredictSARIMARequest(BaseModel):
    city: str
    months: int = 6

@app.post("/predict-sarima")
def api_sarima_post(req: PredictSARIMARequest = Body(...)):
    city = req.city
    months = req.months
    try:
        model_obj, path = load_sarima_model_by_city(city)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        out = sarima_predict_from_loaded(model_obj, months, city)
        return out
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/predict-sarima")
def api_sarima(city: str, months: int):
    return sarima_predict(city, months)

@app.get("/predict")
def predict(city: str = Query(...), months_ahead: int = Query(6, ge=1, le=36), model_name: str = Query(None)):
    """
    Predict future crime counts for a given city.
    Strategy:
      1. If a SARIMA model exists for the city under prediction_artifacts or prediction/sarima_models, use it to forecast.
      2. Else, try to use a tree-based model (RandomForest/GradientBoosting/XGBoost/LightGBM) with iterative forecasting using lag features.
      3. If model loading fails, fall back to returning rows from example_predictions.csv when available.
    """
    base = Path(__file__).resolve().parents[1]
    # 1) Try SARIMA (statsmodels) for exact-city model
    sarima_candidates = [
        base / "prediction" / "sarima_models",
        base / "prediction_artifacts" / "sarima_models",
        Path("prediction") / "sarima_models"
    ]
    # look for file matching city name case-insensitive
    for sc in sarima_candidates:
        if sc.exists():
            for f in sc.iterdir():
                if f.is_file() and f.name.lower().startswith("sarima_" + city.lower()):
                    model = try_load_pickle(f)
                    if model is not None:
                        try:
                            # statsmodels results object: use get_forecast or forecast
                            if hasattr(model, "get_forecast"):
                                pred = model.get_forecast(steps=months_ahead)
                                vals = pred.predicted_mean
                            elif hasattr(model, "forecast"):
                                vals = model.forecast(steps=months_ahead)
                            else:
                                return {"error": "Loaded SARIMA model doesn't support forecast interface."}
                            # build month labels from last data if available
                            monthly = []
                            from datetime import datetime
                            # find last date from monthly data
                            monthly_df = load_monthly_data()
                            if monthly_df is not None:
                                last = monthly_df[monthly_df['city'].str.lower()==city.lower()]['year_month'].max()
                                if pd.notna(last):
                                    last = pd.to_datetime(last)
                                else:
                                    last = datetime.today()
                            else:
                                last = datetime.today()
                            for i, v in enumerate(vals, start=1):
                                next_month = (last + pd.DateOffset(months=i)).strftime("%Y-%m-01")
                                monthly.append({"year_month": next_month, "predicted_count": float(v)})
                            return {"city": city, "model": "sarima", "months_ahead": months_ahead, "predictions": monthly}
                        except Exception as e:
                            # continue to other methods
                            pass

    # 2) Try tree-based iterative forecasting using available model pickles and monthly_aggregated_with_features.csv
    monthly_df = load_monthly_data()
    if monthly_df is None:
        # fallback to example_predictions.csv
        example = None
        for c in [base / "prediction" / "crime_prediction_notebook_output" / "example_predictions.csv",
                  base / "prediction_artifacts" / "example_predictions.csv",
                  Path("prediction") / "crime_prediction_notebook_output" / "example_predictions.csv"]:
            if c.exists():
                try:
                    example = pd.read_csv(c, parse_dates=["year_month"])
                    break
                except:
                    pass
        if example is None:
            return {"error": "No monthly feature data or example predictions available to produce forecasts."}
        df_city = example[example['city'].str.lower() == city.lower()]
        if df_city.empty:
            df_city = example[example['city'].str.lower().str.contains(city.lower())]
        if df_city.empty:
            return {"error": f"No example predictions available for city '{city}'."}
        df_city = df_city.sort_values('year_month')
        res = df_city.head(months_ahead).to_dict(orient='records')
        return {"city": city, "model": "example_csv", "months_ahead": months_ahead, "predictions": res}

    # Prepare per crime_group forecasts using a preferred ML model if available
    # try to locate a tree model in prediction_artifacts
    model_candidates = [
        base / "prediction_artifacts" / "model_RandomForest.pkl",
        base / "prediction_artifacts" / "model_GradientBoosting.pkl",
        base / "prediction_artifacts" / "model_XGBoost.pkl",
        base / "prediction_artifacts" / "model_LightGBM.pkl",
        base / "prediction" / "crime_prediction_notebook_output" / "model_RandomForest.pkl"
    ]
    model = None
    model_path = None
    for mc in model_candidates:
        if mc.exists():
            m = try_load_pickle(mc)
            if m is not None:
                model = m
                model_path = mc
                break

    # Also load encoders if present
    enc_city = try_load_pickle(base / "prediction_artifacts" / "enc_city.pkl") or try_load_pickle(base / "prediction" / "crime_prediction_notebook_output" / "enc_city.pkl")
    enc_crime = try_load_pickle(base / "prediction_artifacts" / "enc_crime.pkl") or try_load_pickle(base / "prediction" / "crime_prediction_notebook_output" / "enc_crime.pkl")

    # Filter last records for city
    city_df = monthly_df[monthly_df['city'].str.lower() == city.lower()]
    if city_df.empty:
        # try contains
        city_df = monthly_df[monthly_df['city'].str.lower().str.contains(city.lower())]
    if city_df.empty:
        return {"error": f"No historical monthly aggregates found for city '{city}' in monthly_aggregated_with_features.csv."}

    # For each crime_group in city, take last row as seed and iteratively forecast
    results = []
    groups = city_df['crime_group'].unique().tolist()
    for grp in groups:
        grp_df = city_df[city_df['crime_group'] == grp].sort_values('year_month')
        last_row = grp_df.iloc[-1]
        # initialize lag list
        lags = [float(last_row.get(f"lag_{i}", 0)) if not math.isnan(last_row.get(f"lag_{i}", 0)) else 0.0 for i in range(1,7)]
        roll3 = float(last_row.get("roll_mean_3", 0.0))
        roll6 = float(last_row.get("roll_mean_6", 0.0))
        # start month index from last_row.month (1-12)
        month_idx = int(last_row.get("month", pd.to_datetime(last_row['year_month']).month))
        seed_date = pd.to_datetime(last_row['year_month'])

        preds = []
        for step in range(1, months_ahead+1):
            month_idx = month_idx + 1
            if month_idx > 12: month_idx = 1
            # construct feature vector
            feat = {
                "lag_1": lags[0], "lag_2": lags[1], "lag_3": lags[2],
                "lag_4": lags[3], "lag_5": lags[4], "lag_6": lags[5],
                "roll_mean_3": roll3, "roll_mean_6": roll6,
                "month": month_idx
            }
            # Some models might expect city/crime encoded as additional features; try to add them if encoders present
            if enc_city is not None and hasattr(enc_city, "transform"):
                try:
                    feat["city_enc"] = int(enc_city.transform([last_row['city']])[0])
                except:
                    pass
            if enc_crime is not None and hasattr(enc_crime, "transform"):
                try:
                    feat["crime_enc"] = int(enc_crime.transform([grp])[0])
                except:
                    pass

            # Predict using model if available
            y_pred = None
            if model is not None:
                try:
                    # many sklearn estimators accept 2D array
                    import numpy as _np
                    X = _np.array([ [feat.get(k, 0) for k in sorted(feat.keys()) ] ])
                    # If model has feature_names_in_, align accordingly (best-effort)
                    if hasattr(model, "predict"):
                        y_pred = float(model.predict(X)[0])
                    else:
                        y_pred = float(model(X)[0])
                except Exception as e:
                    y_pred = None
            # If model failed, try to find predictions in example_predictions.csv as fallback for this grp
            if y_pred is None:
                # read example_predictions if available
                ex = None
                for c in [base / "prediction_artifacts" / "example_predictions.csv", base / "prediction" / "crime_prediction_notebook_output" / "example_predictions.csv"]:
                    if c.exists():
                        try:
                            ex = pd.read_csv(c, parse_dates=["year_month"])
                            break
                        except:
                            ex = None
                if ex is not None:
                    # try to pick step-th future relative to last_row
                    ex_grp = ex[(ex['city'].str.lower() == last_row['city'].lower()) & (ex['crime_group'] == grp)].sort_values('year_month')
                    if not ex_grp.empty:
                        # find rows after last_row.year_month
                        after = ex_grp[ex_grp['year_month'] > last_row['year_month']]
                        if len(after) >= step:
                            y_pred = float(after.iloc[step-1]['crime_count'])
            if y_pred is None:
                # final fallback: use last observed lag_1
                y_pred = lags[0]

            # append prediction with next month label
            next_month = (seed_date + pd.DateOffset(months=step)).strftime("%Y-%m-01")
            preds.append({"year_month": next_month, "crime_group": grp, "predicted_count": float(y_pred)})

            # update lags and rolling means
            lags = [y_pred] + lags[:-1]
            roll3 = float(sum(lags[:3]) / 3.0)
            roll6 = float(sum(lags[:6]) / 6.0)

        # aggregate preds per group
        results.append({"crime_group": grp, "predictions": preds})

    return {"city": city, "model": ("rf_or_tree" if model is not None else "example_based"), "months_ahead": months_ahead, "results": results}
