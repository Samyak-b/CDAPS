# CDAPS: Crime Data Analysis and Prediction System

A full-stack web app for exploring crime data across Indian cities and forecasting monthly crime counts. It has two
portals: a **Command Control Desk** for police/admin users (analytics dashboard, map, forecasts, report moderation,
SOS alerts) and a **Citizen Safety Portal** (file a crime report, send an SOS with your location, view approved
community reports on a map).

Frontend: React + TypeScript (Vite). Backend: FastAPI + SQLAlchemy on SQLite. Forecasting: scikit-learn and
statsmodels models trained in a Jupyter notebook.

## Screenshots

<!-- Replace these with real screenshots saved in a screenshots/ folder. -->

| Admin dashboard | Map view |
|---|---|
| ![Admin dashboard](screenshots/dashboard.png) | ![Map view](screenshots/map-view.png) |

| Forecast | Citizen portal |
|---|---|
| ![Forecast](screenshots/prediction.png) | ![Citizen portal](screenshots/citizen-portal.png) |

## Features

**Admin (Command Control Desk)**
- Dashboard with KPI cards, top cities by crime volume, crime type by victim gender, and crime type by time of day
- A printable summary report generated from the aggregated data
- Leaflet map (CartoDB dark tiles) with colour-coded city markers, city search, and year-over-year change per city
- Monthly crime forecasts per city for 1 to 12 months ahead, shown as line charts
- Moderation of citizen reports (approve, reject, delete) and a list of SOS alerts that can be marked resolved
- Rebuild the database from the CSVs, or upload a new CSV, from the API

**Citizens (Citizen Safety Portal)**
- Sign up and log in (separate from the admin login)
- Submit a crime report: city, crime type, date and time, optional victim details
- SOS button that sends the browser's GPS coordinates to the admin side
- Map of approved community reports, viewable without logging in

**Auth**
- JWT tokens with bcrypt password hashing, an auth middleware, and role checks (`admin`, `citizen`) on protected routes
  and pages

## Architecture

```
React + TypeScript (Vite, Tailwind, shadcn/ui, Recharts, Leaflet, React Query)
        |  REST / JSON, JWT in the Authorization header
        v
FastAPI (Backend/app.py)
  ├─ auth: routes/auth_routes.py, controllers/, middleware/, utils/security.py
  ├─ ETL: etl.py reads Backend/data/*.csv into per-city, per-year aggregates
  ├─ stats and map endpoints (aggregates, gender, time of day, map data)
  ├─ citizen reports and SOS alerts (SQLAlchemy models in models.py)
  └─ forecasting: /predict and /predict-sarima
        |
        v
SQLite (Backend/db/crime.sqlite, created on first run)

prediction/prediction/  Jupyter notebook that aggregates the data by city, crime group and month,
                        builds lag and rolling-mean features, trains the models and writes the artifacts
```

### How a forecast is produced

`GET /predict?city=<name>&months_ahead=<n>` tries, in order:

1. A saved SARIMA model for the city, if one exists
2. A saved tree model (Random Forest, Gradient Boosting, XGBoost or LightGBM) applied month by month, using lag
   features (1 to 6 months) and 3- and 6-month rolling means from `monthly_aggregated_with_features.csv`
3. Precomputed values from `example_predictions.csv`
4. The last observed value

The model files (`*.pkl`) are git-ignored, so a fresh clone uses steps 3 and 4 until you run the notebook to
train and save models.

## Tech stack

| Area | Tools |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix), Recharts, Leaflet / react-leaflet, TanStack Query, Axios, React Router |
| Backend | Python, FastAPI, Uvicorn, SQLAlchemy 2, SQLite, pandas, PyJWT, bcrypt |
| ML | scikit-learn, XGBoost, LightGBM, statsmodels (SARIMA), joblib, Jupyter |

## Project structure

```
Backend/
  app.py                 API endpoints
  models.py              SQLAlchemy models: city-year aggregates, citizen reports, citizen users, SOS alerts
  etl.py                 CSV ingestion and aggregation
  settings.py            data, GeoJSON and database paths
  routes/ controllers/ middleware/ utils/   auth
  data/                  crime_dataset_india.csv
  geo/                   india_cities.geojson
  prediction_artifacts/  monthly aggregates, model metrics, example predictions
frontend/
  src/pages/             Home, Login, Dashboard, MapView, Prediction, Predict, CitizenPortal,
                         CitizenLogin, CitizenSignup, ReportModeration
  src/components/        dashboard widgets, map components, layout, route guard
  src/hooks/ src/lib/ src/services/   API clients and React Query hooks
prediction/prediction/
  crime_prediction_advanced_notebook.ipynb
  notebook_generation.py script that generates the notebook
```

## Running it locally

**Requirements:** Python 3.10+, Node.js 18+.

Backend (from `Backend/`):

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -c "from etl import rebuild_db; print(rebuild_db())"   # build the SQLite aggregates from data/*.csv
uvicorn app:app --reload --port 8080
```

API docs are then at http://127.0.0.1:8080/docs.

Frontend (from `frontend/`):

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000. It calls the API at `VITE_API_BASE` (default `http://127.0.0.1:8080`).

Training the models (optional, from `prediction/prediction/`): open `crime_prediction_advanced_notebook.ipynb` and run
all cells. It saves models, encoders and CSVs to `crime_prediction_notebook_output/` and SARIMA models to
`sarima_models_improved/`. The API looks for them there and in `Backend/prediction_artifacts/`.

## Data and limitations

- The dataset (`crime_dataset_india.csv`) has about 40,000 records across 29 cities, 2020 to 2024.
- Its victim-gender split is close to uniform, so the gender chart applies hand-set weights per crime type
  (in `app.py`). Treat that chart as illustrative, not as a finding.
- Model accuracy on the held-out months is modest: the best model in `model_metrics.csv` is Gradient Boosting with
  RMSE 1.01, MAE 0.78 and R² 0.18 on monthly counts per city and crime group.
- The admin login and the JWT signing key are hard-coded demo values (`controllers/auth_controller.py`,
  `utils/security.py`). Move them to environment variables before deploying anywhere.
