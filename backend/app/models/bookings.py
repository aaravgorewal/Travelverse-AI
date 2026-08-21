from sqlalchemy import Column, String, ForeignKey, Float, Boolean
from .base import Base

class Booking(Base):
    __tablename__ = "bookings"
    trip_id = Column(ForeignKey("trips.id", ondelete="CASCADE"))
    status = Column(String)
    total_price = Column(Float)

class BookingItem(Base):
    __tablename__ = "booking_items"
    booking_id = Column(ForeignKey("bookings.id", ondelete="CASCADE"))
    item_type = Column(String)
    price = Column(Float)

class Flight(Base):
    __tablename__ = "flights"
    booking_item_id = Column(ForeignKey("booking_items.id", ondelete="CASCADE"))
    flight_number = Column(String)

class Hotel(Base):
    __tablename__ = "hotels"
    booking_item_id = Column(ForeignKey("booking_items.id", ondelete="CASCADE"))
    hotel_name = Column(String)

class Transfer(Base):
    __tablename__ = "transfers"
    booking_item_id = Column(ForeignKey("booking_items.id", ondelete="CASCADE"))
    vehicle_type = Column(String)

class Experience(Base):
    __tablename__ = "experiences"
    booking_item_id = Column(ForeignKey("booking_items.id", ondelete="CASCADE"))
    experience_name = Column(String)
