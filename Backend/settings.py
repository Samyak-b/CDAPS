from pathlib import Path

DATA_DIR = Path("data")
GEOJSON_PATH = Path("geo/india_cities.geojson")  # keep "properties.city_name" as your join key
DB_PATH = Path("db/crime.sqlite")

# CSV schema hints (change if your column names differ)
COL_CITY = "City"
COL_DATE = "Date of Occurrence"   # parseable as date
