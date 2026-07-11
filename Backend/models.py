from sqlalchemy import String, Integer, UniqueConstraint, Text, Float
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from typing import Optional

class Base(DeclarativeBase):
    pass

class CityYearAgg(Base):
    __tablename__ = "city_year_agg"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    city: Mapped[str] = mapped_column(String(128), index=True)
    year: Mapped[int] = mapped_column(Integer, index=True)
    crimes: Mapped[int] = mapped_column(Integer)

    __table_args__ = (UniqueConstraint("city", "year", name="uq_city_year"),)

class CitizenReport(Base):
    __tablename__ = "citizen_reports"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    city: Mapped[str] = mapped_column(String(128), index=True)
    crime_description: Mapped[str] = mapped_column(String(256))
    date_of_occurrence: Mapped[str] = mapped_column(String(32))
    time_of_occurrence: Mapped[str] = mapped_column(String(16))
    victim_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    victim_gender: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="pending")  # pending, approved, rejected
    report_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class CitizenUser(Base):
    __tablename__ = "citizen_users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    full_name: Mapped[str] = mapped_column(String(256))
    city: Mapped[str] = mapped_column(String(128))

class SOSAlert(Base):
    __tablename__ = "sos_alerts"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(128), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    timestamp: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32), default="active")  # active, resolved
