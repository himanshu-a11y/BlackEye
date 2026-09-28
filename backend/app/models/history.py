from sqlalchemy import Column, String, Text, DateTime, Float, Boolean
from sqlalchemy.sql import func
import uuid
from app.database import Base

class TestRecord(Base):
    __tablename__ = "test_records"

    id = Column(String, primary_key=True, default=lambda: f"BE-{uuid.uuid4().hex[:8].upper()}")
    test_type = Column(String, default="geolocation")
    target = Column(String, nullable=False)
    country = Column(String, default="")
    country_code = Column(String, default="")
    region = Column(String, default="")
    city = Column(String, default="")
    postal = Column(String, default="")
    timezone = Column(String, default="")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    isp = Column(String, default="")
    org = Column(String, default="")
    asn = Column(String, default="")
    domain = Column(String, default="")
    connection_type = Column(String, default="")
    is_vpn = Column(Boolean, nullable=True)
    is_proxy = Column(Boolean, nullable=True)
    is_tor = Column(Boolean, nullable=True)
    is_hosting = Column(Boolean, nullable=True)
    is_mobile = Column(Boolean, nullable=True)
    consistency_score = Column(String, default="")
    raw_data = Column(Text, default="{}")
    timestamp = Column(DateTime, server_default=func.now())
