# make_notebook.py
import nbformat as nbf
from pathlib import Path

nb = nbf.v4.new_notebook()
cells = []

cells.append(nbf.v4.new_markdown_cell("# Advanced Monthly Crime Prediction\n\n"
"**Contents:**\n\n"
"- Load dataset\n- Preprocess & parse dates\n- Monthly aggregation (city × crime_group × month)\n- Feature engineering: lag features, rolling means, seasonality\n- Modeling: RandomForest, GradientBoosting, optional XGBoost/LightGBM\n- Evaluation (time-aware split)\n- Save artifacts (models, encoders, CSVs) and package results\n\n"
"Each **code** cell contains a clear function or step so you can run, modify, or extend it easily.\n"))

cells.append(nbf.v4.new_markdown_cell("## 1) Setup & Imports\n\nInstall dependencies (run in a cell or terminal):\n```\npip install pandas numpy scikit-learn joblib xgboost lightgbm nbformat\n```\nIf you don't want xgboost/lightgbm skip them — notebook handles their absence."))

cells.append(nbf.v4.new_code_cell("import warnings\nwarnings.filterwarnings('ignore')\n\n# Standard data science libraries\nimport pandas as pd\nimport numpy as np\nfrom pathlib import Path\nfrom sklearn.preprocessing import LabelEncoder\nfrom sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor\nfrom sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score\nimport joblib\nimport zipfile\n\nprint('Imports ready')"))

cells.append(nbf.v4.new_markdown_cell("## 2) Configuration & Paths\nSet the file names and output folders. Ensure your dataset is named `crime_dataset_india.csv` and placed next to this notebook."))

cells.append(nbf.v4.new_code_cell("ROOT = Path.cwd()\nDATA_CSV = ROOT / 'crime_dataset_india.csv'  # put your CSV here\nOUT_DIR = ROOT / 'crime_prediction_notebook_output'\nOUT_DIR.mkdir(parents=True, exist_ok=True)\nZIP_OUT = ROOT / 'crime_prediction_notebook.zip'\n\nprint('Data path:', DATA_CSV)\nprint('Output folder:', OUT_DIR)"))

cells.append(nbf.v4.new_markdown_cell("## 3) Utility functions\nHelpers used across the notebook (saving models, evaluation helper)."))

cells.append(nbf.v4.new_code_cell("def save_model(obj, path):\n    joblib.dump(obj, path)\n\n\ndef regression_metrics(y_true, y_pred):\n    mse = mean_squared_error(y_true, y_pred)\n    rmse = np.sqrt(mse)\n    mae = mean_absolute_error(y_true, y_pred)\n    r2 = r2_score(y_true, y_pred)\n    return {'rmse': float(rmse), 'mae': float(mae), 'r2': float(r2)}\n\nprint('Utility functions defined')"))

cells.append(nbf.v4.new_markdown_cell("## 4) Load dataset\nLoad the CSV and show a quick preview. If your CSV uses a different filename, change `DATA_CSV` above."))

cells.append(nbf.v4.new_code_cell("assert DATA_CSV.exists(), f\"CSV not found at {DATA_CSV}. Please place it there and re-run this cell.\"\n\ndf = pd.read_csv(DATA_CSV)\ndf.head().T"))

cells.append(nbf.v4.new_markdown_cell("### 4.1) Inspect columns & basic cleaning\nLook at columns and datatypes; trim whitespace from column names."))

cells.append(nbf.v4.new_code_cell("df.columns = [c.strip() for c in df.columns]\ndf.info()\n\n# Show unique counts for key columns if present\nfor c in ['City','Crime Domain','Crime Description']:\n    if c in df.columns:\n        print(c, 'unique:', df[c].nunique())"))

cells.append(nbf.v4.new_markdown_cell("## 5) Preprocessing function\nThis cell defines a function to parse dates, normalize city and crime group, and remove invalid rows."))

cells.append(nbf.v4.new_code_cell("def preprocess_monthly(df, date_cols=('Date of Occurrence','Date Reported')):\n    d = df.copy()\n    # find date column\n    date_col = None\n    for c in date_cols:\n        if c in d.columns:\n            date_col = c\n            break\n    if date_col is None:\n        date_col = d.columns[0]\n    d[date_col] = pd.to_datetime(d[date_col], dayfirst=True, errors='coerce')\n    d = d.dropna(subset=[date_col]).copy()\n    d['year'] = d[date_col].dt.year.astype(int)\n    d['month'] = d[date_col].dt.month.astype(int)\n    d['year_month'] = d[date_col].dt.to_period('M').dt.to_timestamp()\n    # crime group\n    if 'Crime Domain' in d.columns and d['Crime Domain'].notna().sum()>0:\n        d['crime_group'] = d['Crime Domain'].astype(str).str.upper()\n    elif 'Crime Description' in d.columns:\n        d['crime_group'] = d['Crime Description'].astype(str).str.upper()\n    else:\n        d['crime_group'] = d.iloc[:,1].astype(str).str.upper()\n    d['city'] = d['City'].astype(str).str.title() if 'City' in d.columns else 'Unknown'\n    d = d[d['year']>1900]\n    return d\n\n# Run preprocess and preview\ndfp = preprocess_monthly(df)\ndfp.head()"))

cells.append(nbf.v4.new_markdown_cell("## 6) Monthly aggregation\nAggregate to monthly counts per (city, crime_group)."))

cells.append(nbf.v4.new_code_cell("agg_month = dfp.groupby(['city','crime_group','year_month']).size().reset_index(name='crime_count')\nagg_month = agg_month.sort_values(['city','crime_group','year_month']).reset_index(drop=True)\nprint('Aggregated rows:', len(agg_month))\nagg_month.head()"))

cells.append(nbf.v4.new_markdown_cell("## 7) Feature engineering\nCreate lag features (1..6 months), rolling means, and month seasonality. Function returns dataframe with features."))

cells.append(nbf.v4.new_code_cell("def make_time_features(agg_month, max_lag=6):\n    df = agg_month.copy().set_index(['city','crime_group','year_month']).sort_index().reset_index()\n    def proc(g):\n        g = g.sort_values('year_month').reset_index(drop=True)\n        for lag in range(1, max_lag+1):\n            g[f'lag_{lag}'] = g['crime_count'].shift(lag)\n        g['roll_mean_3'] = g['crime_count'].shift(1).rolling(3, min_periods=1).mean()\n        g['roll_mean_6'] = g['crime_count'].shift(1).rolling(6, min_periods=1).mean()\n        g['month'] = g['year_month'].dt.month\n        # fill missing lags\n        for lag in range(1, max_lag+1):\n            g[f'lag_{lag}'] = g[f'lag_{lag}'].fillna(method='ffill').fillna(0)\n        g['roll_mean_3'] = g['roll_mean_3'].fillna(0)\n        g['roll_mean_6'] = g['roll_mean_6'].fillna(0)\n        return g\n    df = df.groupby(['city','crime_group'], group_keys=False).apply(proc).reset_index(drop=True)\n    return df\n\nagg_feat = make_time_features(agg_month)\nagg_feat.head()"))

cells.append(nbf.v4.new_markdown_cell("## 8) Prepare modeling dataset\nWe want to predict next month's crime_count for each (city, crime_group). We shift the target by -1 and drop last rows per group."))

cells.append(nbf.v4.new_code_cell("data = agg_feat.copy()\ndata['target_next'] = data.groupby(['city','crime_group'])['crime_count'].shift(-1)\ndata_model = data.dropna(subset=['target_next']).reset_index(drop=True)\nprint('Model rows:', len(data_model))\ndata_model.head()"))

cells.append(nbf.v4.new_markdown_cell("## 9) Encoding and features\nEncode city and crime_group and select feature columns."))

cells.append(nbf.v4.new_code_cell("enc_city = LabelEncoder().fit(data_model['city'])\nenc_crime = LabelEncoder().fit(data_model['crime_group'])\ndata_model['city_enc'] = enc_city.transform(data_model['city'])\ndata_model['crime_enc'] = enc_crime.transform(data_model['crime_group'])\n\nfeature_cols = ['crime_count','lag_1','lag_2','lag_3','lag_4','lag_5','lag_6','roll_mean_3','roll_mean_6','month','city_enc','crime_enc']\nX = data_model[feature_cols].astype(float)\ny = data_model['target_next'].astype(float)\nprint('Feature matrix shape:', X.shape)\nX.head()"))

cells.append(nbf.v4.new_markdown_cell("## 10) Time-aware train/test split\nIf we have >=12 unique months, use last 6 months as test. Otherwise use 80/20 split."))

cells.append(nbf.v4.new_code_cell("data_model = data_model.sort_values('year_month').reset_index(drop=True)\nunique_months = data_model['year_month'].nunique()\nif unique_months >= 12:\n    last_month = data_model['year_month'].max()\n    cutoff = last_month - pd.DateOffset(months=6) + pd.DateOffset(days=1)\n    train_idx = data_model['year_month'] < cutoff\n    test_idx = data_model['year_month'] >= cutoff\nelse:\n    split_point = int(len(data_model)*0.8)\n    train_idx = data_model.index < split_point\n    test_idx = data_model.index >= split_point\n\nX_train, X_test = X[train_idx], X[test_idx]\ny_train, y_test = y[train_idx], y[test_idx]\nprint('Train/test sizes:', len(X_train), len(X_test))"))

cells.append(nbf.v4.new_markdown_cell("## 11) Define models\nWe will use RandomForest and GradientBoosting plus optional XGBoost/LightGBM if installed."))

cells.append(nbf.v4.new_code_cell("models = {}\nmodels['RandomForest'] = RandomForestRegressor(n_estimators=300, n_jobs=-1, random_state=42)\nmodels['GradientBoosting'] = GradientBoostingRegressor(n_estimators=300, random_state=42)\n# Optional models (if installed)\ntry:\n    from xgboost import XGBRegressor\n    models['XGBoost'] = XGBRegressor(n_estimators=300, random_state=42, n_jobs=-1, verbosity=0)\n    print('XGBoost available')\nexcept Exception:\n    print('XGBoost not available')\ntry:\n    from lightgbm import LGBMRegressor\n    models['LightGBM'] = LGBMRegressor(n_estimators=300, random_state=42, n_jobs=-1)\n    print('LightGBM available')\nexcept Exception:\n    print('LightGBM not available')\n\nmodels.keys()"))

cells.append(nbf.v4.new_markdown_cell("## 12) Train & Evaluate\nTrain each model and compute RMSE, MAE, R² on the test set."))

cells.append(nbf.v4.new_code_cell("def regression_metrics(y_true, y_pred):\n    from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score\n    mse = mean_squared_error(y_true, y_pred)\n    rmse = (mse**0.5)\n    mae = mean_absolute_error(y_true, y_pred)\n    r2 = r2_score(y_true, y_pred)\n    return {'rmse': float(rmse), 'mae': float(mae), 'r2': float(r2)}\n\nresults = {}\nfor name,model in models.items():\n    try:\n        print('Training', name)\n        model.fit(X_train, y_train)\n        preds = model.predict(X_test)\n        metrics = regression_metrics(y_test, preds)\n        results[name] = {'model': model, 'metrics': metrics, 'preds': preds}\n        print(name, metrics)\n    except Exception as e:\n        results[name] = {'error': str(e)}\n        print(name, 'failed:', e)\n\n# Tabulate metrics\nrows = []\nfor k,v in results.items():\n    if 'error' in v:\n        rows.append({'model':k, 'rmse':None, 'mae':None, 'r2':None, 'note':v['error']})\n    else:\n        rows.append({'model':k, **v['metrics']})\n\nimport pandas as pd\npd.DataFrame(rows).sort_values('rmse', na_position='last').reset_index(drop=True)"))

cells.append(nbf.v4.new_markdown_cell("## 13) Example predictions\nShow test-period rows with model predictions side-by-side."))

cells.append(nbf.v4.new_code_cell("example = data_model[test_idx].copy().reset_index(drop=True)\nfor name,v in results.items():\n    if 'error' not in v and len(v['preds'])==len(example):\n        example[f'pred_{name}'] = np.round(v['preds'],2)\nexample.head(20)"))

cells.append(nbf.v4.new_markdown_cell("## 14) Feature importance\nDisplay feature importances for tree-based models (if available)."))

cells.append(nbf.v4.new_code_cell("importances = {}\nfor name,v in results.items():\n    if 'error' not in v:\n        model = v['model']\n        if hasattr(model, 'feature_importances_'):\n            importances[name] = model.feature_importances_\n\nfor k,imp in importances.items():\n    imp_df = pd.DataFrame({'feature':feature_cols, 'importance':imp}).sort_values('importance', ascending=False)\n    print('\\nFeature importances for', k)\n    display(imp_df.head(10))"))

cells.append(nbf.v4.new_markdown_cell("## 15) Save models, encoders, and CSVs\nSave everything to the output folder and create a zip."))

cells.append(nbf.v4.new_code_cell("agg_month.to_csv(OUT_DIR/'monthly_aggregated.csv', index=False)\nagg_feat.to_csv(OUT_DIR/'monthly_aggregated_with_features.csv', index=False)\npd.DataFrame(rows).to_csv(OUT_DIR/'model_metrics.csv', index=False)\nexample.to_csv(OUT_DIR/'example_predictions.csv', index=False)\n\njoblib.dump(enc_city, OUT_DIR/'enc_city.pkl')\njoblib.dump(enc_crime, OUT_DIR/'enc_crime.pkl')\nfor k,v in results.items():\n    if 'error' not in v:\n        try:\n            joblib.dump(v['model'], OUT_DIR/f'model_{k}.pkl')\n        except Exception as e:\n            print('Failed saving', k, e)\n\nwith zipfile.ZipFile(ZIP_OUT, 'w', compression=zipfile.ZIP_DEFLATED) as zf:\n    for p in OUT_DIR.rglob('*'):\n        zf.write(p, arcname=p.relative_to(OUT_DIR.parent))\nprint('Saved artifacts to', OUT_DIR)\nprint('Created zip:', ZIP_OUT)"))

cells.append(nbf.v4.new_markdown_cell("## 16) Next steps & Improvements\n- Add external features: population, events/holidays, weather\n- Hyperparameter tuning with TimeSeriesSplit or Optuna\n- SHAP explanations for feature importance\n- Monthly → yearly aggregation for dashboard compatibility\n\nFeel free to modify model hyperparameters or add more features. Good luck!"))

nb['cells'] = cells

out_path = Path('crime_prediction_advanced_notebook.ipynb')
with open(out_path, 'w', encoding='utf-8') as f:
    nbf.write(nb, f)

print('Wrote notebook to', out_path.resolve())
