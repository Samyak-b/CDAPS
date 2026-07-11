<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
</p>

<h1 align="center">🛡️ CDAPS — Crime Data Analysis & Prediction System</h1>

<p align="center">
  <strong>A full-stack geospatial crime analytics platform with ML-powered forecasting, interactive mapping, citizen reporting, and real-time SOS dispatch.</strong>
</p>

<p align="center">
  <em>Built for Indian cities • SARIMA & ensemble ML models • Leaflet-based dark-theme choropleth maps • Role-based JWT authentication</em>
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [Prediction Models (Optional)](#3-prediction-models-optional)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Machine Learning Models](#-machine-learning-models)
- [Screenshots](#-screenshots)
- [Environment Variables](#-environment-variables)
- [Default Credentials](#-default-credentials)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

**CDAPS** (Crime Data Analysis & Prediction System) is a comprehensive full-stack application designed for analyzing historical crime data across Indian cities, predicting future crime trends using machine learning, and enabling citizens to report incidents and broadcast SOS distress signals.

The system features **two distinct portals**:

| Portal | Audience | Capabilities |
|--------|----------|-------------|
| **🏛️ Command Control Desk** | Police / Admin | Full analytical dashboard, choropleth maps, ML prediction pipelines, report moderation, SOS dispatch monitoring |
| **👥 Citizen Safety Portal** | General Public | Crime reporting, SOS emergency beacon (GPS-based), view approved community reports |

---

## ✨ Key Features

### 📊 Analytics Dashboard (Admin)
- **KPI Cards** — Total cities, latest year crime totals, year-over-year growth percentage
- **Top Cities Bar Chart** — Top-K cities ranked by crime volume
- **Choropleth Map Integration** — Color-coded geo-spatial crime visualization per city
- **Gender Breakdown Analysis** — Crime type distribution by victim gender with real-world demographic weighting
- **Time-of-Day Analysis** — Temporal distribution of crime types (Morning / Afternoon / Evening / Night)
- **Auto-generated Crime Reports** — Downloadable insights from aggregated data

### 🗺️ Interactive Geospatial Map
- **Leaflet.js dark-themed maps** with CartoDB Dark Matter tiles
- **Circle markers** with dynamic color coding (Red / Yellow / Green based on crime intensity)
- **City search & fly-to** — Select or search any city to zoom in
- **Side panel details** — Year-over-year crime counts and percentage change per city

### 🤖 ML-Powered Crime Prediction
- **SARIMA (Seasonal ARIMA)** models for per-city time-series forecasting
- **Ensemble tree models** — Random Forest, Gradient Boosting, XGBoost, LightGBM
- **Iterative multi-step forecasting** with lag features and rolling means
- **Automatic model fallback chain**: SARIMA → Tree Model → Example CSV → Last Observed Value
- **Interactive prediction UI** — Select city, choose forecast horizon (1–12 months), view line charts

### 🚨 Citizen Safety Portal
- **Crime Report Submission** — Citizens can file incident reports (city, crime type, date, time, victim info)
- **SOS Emergency Beacon** — One-tap distress signal broadcasting live GPS coordinates to police dispatch
- **Community Warnings Map** — Approved reports plotted on an interactive map
- **Citizen Authentication** — Separate signup/login flow with JWT tokens

### 🔐 Role-Based Access Control
- **Admin role** — Full access to dashboard, maps, predictions, report moderation, SOS alerts
- **Citizen role** — Crime reporting, SOS alerts, viewing approved community reports
- **Guest access** — Browse approved reports without login (limited features)
- **JWT authentication** with bcrypt password hashing via middleware

### 📋 Report Moderation (Admin)
- View all citizen-submitted reports with filtering (All / Pending / Approved / Rejected)
- Approve, reject, or delete reports
- Monitor live SOS alerts with GPS coordinates on a map
- Resolve SOS alerts

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│          React 18 + TypeScript + Vite                │
│    TailwindCSS • shadcn/ui • Recharts • Leaflet     │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │Dashboard │  │ Map View │  │  Prediction UI   │   │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │              │                 │             │
│  ┌────┴──────────────┴─────────────────┴──────────┐  │
│  │          Axios HTTP Client (JWT Auth)          │  │
│  └────────────────────┬───────────────────────────┘  │
└───────────────────────┼──────────────────────────────┘
                        │  REST API (JSON)
┌───────────────────────┼──────────────────────────────┐
│                    BACKEND                           │
│              FastAPI (Python 3.10+)                  │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │
│  │ Auth/RBAC  │  │  ETL/CRUD  │  │ ML Inference │   │
│  │ Middleware │  │  Endpoints │  │  Endpoints   │   │
│  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘   │
│        │               │                │            │
│  ┌─────┴───────────────┴────────────────┴─────────┐  │
│  │          SQLAlchemy ORM + SQLite DB            │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  Prediction Artifacts (pkl models, CSVs, etc.) │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│               PREDICTION / ML PIPELINE               │
│         Jupyter Notebook + scikit-learn               │
│  SARIMA • RandomForest • XGBoost • LightGBM          │
│  Lag features • Rolling means • Label encoding       │
└──────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance async REST API framework |
| **SQLAlchemy 2.0** | ORM with declarative models |
| **SQLite** | Lightweight embedded database |
| **Pandas** | Data manipulation and ETL pipeline |
| **scikit-learn / XGBoost / LightGBM** | ML model inference |
| **statsmodels** | SARIMA time-series forecasting |
| **PyJWT + bcrypt** | JWT token auth & password hashing |
| **Uvicorn** | ASGI production server |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI library |
| **TypeScript** | Type-safe JavaScript |
| **Vite 5** | Lightning-fast dev server & bundler |
| **TailwindCSS 3.4** | Utility-first CSS framework |
| **shadcn/ui + Radix** | Premium accessible UI components |
| **Recharts** | Composable chart library |
| **Leaflet + react-leaflet** | Interactive geo-spatial maps |
| **React Query (TanStack)** | Server state management & caching |
| **Axios** | HTTP client with JWT interceptors |
| **React Router v6** | Client-side routing |
| **Sonner** | Toast notifications |
| **Lucide React** | Modern icon library |

### ML / Data Science
| Technology | Purpose |
|------------|---------|
| **SARIMA (statsmodels)** | Seasonal time-series forecasting per city |
| **Random Forest / Gradient Boosting** | Ensemble regression models |
| **XGBoost / LightGBM** | Gradient-boosted tree models |
| **joblib** | Model serialization (`.pkl` artifacts) |

---

## 📁 Project Structure

```
CDAPS/
├── Backend/                          # FastAPI backend server
│   ├── app.py                        # Main application — all API endpoints
│   ├── models.py                     # SQLAlchemy ORM models
│   ├── settings.py                   # Configuration (DB path, GeoJSON path)
│   ├── etl.py                        # ETL pipeline — CSV ingestion & aggregation
│   ├── requirements.txt              # Python dependencies
│   ├── run_command.txt               # Quick reference: uvicorn start command
│   ├── test_login.py                 # Admin login smoke test
│   ├── controllers/
│   │   └── auth_controller.py        # Admin authentication logic
│   ├── routes/
│   │   └── auth_routes.py            # Auth API route definitions
│   ├── middleware/
│   │   └── auth_middleware.py        # JWT auth middleware for protected routes
│   ├── utils/
│   │   ├── security.py               # JWT creation/validation, bcrypt hashing
│   │   └── deps.py                   # FastAPI dependency injection (auth guards)
│   ├── data/
│   │   └── crime_dataset_india.csv   # Raw crime dataset (~5MB)
│   ├── db/
│   │   └── crime.sqlite              # SQLite database (auto-generated)
│   ├── geo/
│   │   └── india_cities.geojson      # GeoJSON geometries for Indian cities
│   └── prediction_artifacts/         # Pre-trained ML model files
│       ├── model_RandomForest.pkl
│       ├── model_GradientBoosting.pkl
│       ├── model_XGBoost.pkl
│       ├── model_LightGBM.pkl
│       ├── enc_city.pkl              # Label encoder for city names
│       ├── enc_crime.pkl             # Label encoder for crime groups
│       ├── monthly_aggregated.csv
│       ├── monthly_aggregated_with_features.csv
│       ├── model_metrics.csv
│       └── example_predictions.csv
│
├── frontend/                         # React + TypeScript frontend
│   ├── index.html                    # HTML entry point with SEO meta tags
│   ├── package.json                  # Node dependencies & scripts
│   ├── vite.config.ts                # Vite bundler configuration
│   ├── tailwind.config.ts            # TailwindCSS theme configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── .env                          # Environment variables (API base URL)
│   └── src/
│       ├── App.tsx                   # Root component — routing & providers
│       ├── main.tsx                  # React DOM entry point
│       ├── index.css                 # Global styles
│       ├── pages/
│       │   ├── Home.tsx              # Landing page — portal selector
│       │   ├── Login.tsx             # Admin login page
│       │   ├── Dashboard.tsx         # Admin analytics dashboard
│       │   ├── MapView.tsx           # Geospatial choropleth map view
│       │   ├── Prediction.tsx        # SARIMA prediction interface
│       │   ├── Predict.tsx           # ML tree-model prediction interface
│       │   ├── CitizenPortal.tsx     # Citizen reporting & SOS portal
│       │   ├── CitizenLogin.tsx      # Citizen login page
│       │   ├── CitizenSignup.tsx     # Citizen registration page
│       │   ├── ReportModeration.tsx  # Admin report & SOS moderation
│       │   ├── Index.tsx             # Supplementary data view
│       │   └── NotFound.tsx          # 404 page
│       ├── components/
│       │   ├── ProtectedRoute.tsx    # Role-based route guard
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx       # Admin navigation sidebar
│       │   │   └── Header.tsx        # Top header bar
│       │   ├── dashboard/
│       │   │   ├── KPICards.tsx       # Summary stat cards
│       │   │   ├── Charts.tsx        # Bar/line charts (top cities)
│       │   │   ├── GenderChart.tsx   # Gender breakdown visualization
│       │   │   ├── TimeOfDayChart.tsx # Time-of-day crime distribution
│       │   │   ├── CrimeReport.tsx   # Auto-generated report component
│       │   │   ├── MLCrimePredictor.tsx # ML prediction widget
│       │   │   ├── CityDetailModal.tsx  # City drill-down modal
│       │   │   ├── city-search.tsx   # City search component
│       │   │   ├── city-stats-card.tsx  # City statistics card
│       │   │   └── top-cities-list.tsx  # Top cities ranking list
│       │   └── map/
│       │       ├── MapComponent.tsx   # Main Leaflet map (data-driven)
│       │       ├── IndiaMap.tsx       # Static India map with markers
│       │       └── coordinates.ts    # City lat/lng coordinate mappings
│       ├── hooks/
│       │   ├── useAuth.tsx           # Authentication context & hook
│       │   ├── useAnalytics.ts       # React Query hooks for all API calls
│       │   ├── use-toast.ts          # Toast notification hook
│       │   └── use-mobile.tsx        # Mobile breakpoint detection
│       ├── contexts/
│       │   └── CityContext.tsx       # Global city selection state
│       ├── services/
│       │   └── api.ts               # Axios instance with JWT interceptor
│       ├── config/
│       │   └── api.ts               # API base URL configuration
│       └── lib/                      # Shared utility functions
│
├── prediction/                       # ML model training pipeline
│   └── prediction/
│       ├── crime_dataset_india.csv   # Training dataset
│       ├── crime_prediction_advanced_notebook.ipynb  # Jupyter notebook
│       ├── notebook_generation.py    # Script to generate the notebook
│       ├── sarima_models/            # SARIMA model artifacts
│       └── sarima_models_improved/   # Improved SARIMA model artifacts
│
└── README.md                         # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| **Python** | 3.10 or higher |
| **Node.js** | 18+ (with npm or bun) |
| **Git** | Latest |

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/<your-username>/CDAPS.git
cd CDAPS

# Create and activate a virtual environment
cd Backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize the database with crime data
# (Ensure crime_dataset_india.csv is in Backend/data/)
python -c "from etl import rebuild_db; print(rebuild_db())"

# Start the API server
uvicorn app:app --reload --port 8080
```

The API will be live at **http://127.0.0.1:8080**. Interactive docs available at **http://127.0.0.1:8080/docs**.

### 2. Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be live at **http://localhost:5173** (default Vite port).

### 3. Prediction Models (Optional)

The pre-trained model artifacts (`.pkl` files) are already included in `Backend/prediction_artifacts/`. To retrain models:

```bash
cd prediction/prediction

# Open the Jupyter notebook
jupyter notebook crime_prediction_advanced_notebook.ipynb

# Or generate a fresh notebook from the script
python notebook_generation.py
```

---

## 💡 Usage

### Landing Page
Navigate to `http://localhost:5173` to see the home portal selector with two entry points:
- **Citizen Safety Portal** — Public crime reporting and SOS features
- **Command Control Desk** — Admin/Police analytical dashboard (requires login)

### Admin Dashboard Workflow
1. Log in at `/login` with admin credentials
2. View the **Intelligence Dashboard** with KPI cards, charts, and analytics
3. Navigate to **Map View** for geospatial crime visualization
4. Use the **Prediction** page to forecast future crime trends per city
5. Moderate citizen reports and monitor SOS alerts via **Community Reports**

### Citizen Workflow
1. Sign up at `/citizen/signup` or log in at `/citizen/login`
2. Submit crime reports from the **Citizen Safety Portal**
3. Trigger an **SOS Emergency Beacon** to broadcast your GPS coordinates
4. View approved community warnings plotted on the map

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/login` | Admin login → JWT token | ❌ |
| `POST` | `/auth/logout` | Logout (client-side) | ❌ |
| `GET` | `/auth/me` | Get current user profile | ✅ Admin |
| `POST` | `/auth/citizen/signup` | Citizen registration | ❌ |
| `POST` | `/auth/citizen/login` | Citizen login → JWT token | ❌ |

### Crime Data & Statistics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/years` | List available data years | ❌ |
| `GET` | `/cities` | List all cities in dataset | ❌ |
| `GET` | `/stats/city?city=<name>` | City-level year-over-year stats | ❌ |
| `GET` | `/stats/top?k=<n>` | Top-K cities by crime volume | ❌ |
| `GET` | `/stats/gender-breakdown` | Crime distribution by gender | ❌ |
| `GET` | `/stats/time-of-day` | Crime distribution by time period | ❌ |
| `GET` | `/map/choropleth` | GeoJSON FeatureCollection for map | ❌ |

### Predictions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/predict-sarima` | SARIMA forecast (city + months) | ❌ |
| `GET` | `/predict?city=<name>&months_ahead=<n>` | Multi-model prediction with fallback | ❌ |

### Admin Operations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/admin/rebuild` | Re-scan CSVs and rebuild database | ✅ Admin |
| `POST` | `/admin/upload` | Upload new CSV dataset | ✅ Admin |
| `GET` | `/admin/dashboard-stats` | Aggregated dashboard statistics | ✅ Admin |
| `GET` | `/admin/citizen-reports` | All citizen reports (any status) | ✅ Admin |
| `PUT` | `/admin/citizen-report/<id>/status` | Update report status | ✅ Admin |
| `DELETE` | `/admin/citizen-report/<id>` | Delete a report | ✅ Admin |
| `GET` | `/admin/sos-alerts` | All SOS alerts | ✅ Admin |
| `PUT` | `/admin/sos-alert/<id>/resolve` | Resolve an SOS alert | ✅ Admin |

### Citizen Operations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/citizen/report` | Submit a crime report | ❌ |
| `GET` | `/citizen/reports` | Get approved reports | ❌ |
| `POST` | `/citizen/sos` | Send SOS distress signal with GPS | ✅ Citizen |

---

## 🤖 Machine Learning Models

### SARIMA (Seasonal ARIMA)
- **Per-city time-series models** trained on monthly crime aggregates
- Handles seasonality with configurable `(p,d,q)(P,D,Q,s)` orders
- Supports inverse transforms (log1p, Yeo-Johnson, none)
- Currently trained for **Delhi** with automatic city lookup

### Ensemble Tree Models
| Model | File | Description |
|-------|------|-------------|
| Random Forest | `model_RandomForest.pkl` | 300 estimators, robust baseline |
| Gradient Boosting | `model_GradientBoosting.pkl` | Sequential boosting regressor |
| XGBoost | `model_XGBoost.pkl` | Optimized gradient boosting |
| LightGBM | `model_LightGBM.pkl` | Fast gradient boosting (Microsoft) |

### Feature Engineering
- **Lag features**: `lag_1` through `lag_6` (previous months' crime counts)
- **Rolling means**: 3-month and 6-month rolling averages
- **Month seasonality**: Month-of-year (1–12)
- **Label encoding**: City and crime group encoded via `LabelEncoder`

### Prediction Fallback Chain
```
1. SARIMA model for city → if available
2. Tree-based model (RF/GB/XGB/LGBM) with iterative forecasting → if monthly data available
3. Example predictions CSV → if no model works
4. Last observed value → final fallback
```

---

## 🖼️ Screenshots

> **Note:** Add screenshots of your application here before pushing to GitHub.
> Save them in a `screenshots/` folder and reference them like:
>
> ```markdown
> ![Dashboard](screenshots/dashboard.png)
> ![Map View](screenshots/map-view.png)
> ![Citizen Portal](screenshots/citizen-portal.png)
> ![Prediction](screenshots/prediction.png)
> ```

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE` | `http://127.0.0.1:8080` | Backend API base URL |

### Backend

Configuration is managed through `Backend/settings.py`:

| Setting | Default | Description |
|---------|---------|-------------|
| `DATA_DIR` | `data/` | Directory containing crime CSV files |
| `GEOJSON_PATH` | `geo/india_cities.geojson` | GeoJSON file for map geometries |
| `DB_PATH` | `db/crime.sqlite` | SQLite database file path |
| `SECRET_KEY` | (in `security.py`) | JWT signing secret key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `43200` (30 days) | JWT token expiry duration |

---

## 🔑 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Citizen** | *(self-registered)* | *(user-chosen)* |

> ⚠️ **Security Note:** Change the default admin credentials and `SECRET_KEY` before any production deployment.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is for educational and research purposes. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ for safer communities</strong>
</p>
