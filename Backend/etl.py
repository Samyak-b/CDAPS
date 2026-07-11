import pandas as pd
from sqlalchemy import create_engine, text
from settings import DATA_DIR, COL_CITY, COL_DATE, DB_PATH
from models import Base, CityYearAgg
from pathlib import Path

def _read_all_csvs() -> pd.DataFrame:
    files = sorted(DATA_DIR.glob("*.csv"))
    if not files:
        raise FileNotFoundError(f"No CSVs found in {DATA_DIR.resolve()}")
    dfs = []
    for f in files:
        df = pd.read_csv(f)
        if COL_DATE not in df.columns or COL_CITY not in df.columns:
            raise ValueError(f"{f.name} missing required columns: {COL_DATE}, {COL_CITY}")
        df[COL_DATE] = pd.to_datetime(df[COL_DATE], errors="coerce")
        df = df.dropna(subset=[COL_DATE, COL_CITY])
        df[COL_CITY] = df[COL_CITY].astype(str).str.strip()
        df["year"] = df[COL_DATE].dt.year
        dfs.append(df[[COL_CITY, "year"]])
    return pd.concat(dfs, ignore_index=True)

def rebuild_db():
    # create db folder
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    engine = create_engine(f"sqlite:///{DB_PATH}", future=True)
    
    # Drop only the aggregate table to avoid deleting citizen-reported data
    CityYearAgg.__table__.drop(engine, checkfirst=True)
    Base.metadata.create_all(engine)

    df = _read_all_csvs()
    agg = (
        df.groupby([COL_CITY, "year"])
        .size()
        .reset_index(name="crimes")
        .rename(columns={COL_CITY: "city"})
    )

    # write aggregates
    agg.to_sql(CityYearAgg.__tablename__, con=engine, if_exists="append", index=False)
    return {"rows": len(agg)}

def get_available_years():
    engine = create_engine(f"sqlite:///{DB_PATH}", future=True)
    with engine.connect() as conn:
        years = conn.execute(text("SELECT DISTINCT year FROM city_year_agg ORDER BY year")).scalars().all()
    return sorted(list(years))
