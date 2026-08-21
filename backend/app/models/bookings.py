from sqlalchemy import Uuid, Column, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel

class Booking(BaseModel):
    __tablename__ = "bookings"
    
    trip_id = Column(Uuid, ForeignKey("trips.id", ondelete="CASCADE"), index=True, nullable=True)
    customer_id = Column(Uuid, ForeignKey("customers.id", ondelete="CASCADE"), index=True, nullable=False)
    
    status = Column(String, default="pending") # pending, confirmed, cancelled
    total_amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    payment_status = Column(String, default="unpaid")
    
    items = relationship("BookingItem", back_populates="booking", cascade="all, delete-orphan")

class BookingItem(BaseModel):
    __tablename__ = "booking_items"
    
    booking_id = Column(Uuid, ForeignKey("bookings.id", ondelete="CASCADE"), index=True, nullable=False)
    item_type = Column(String, nullable=False) # flight, hotel, experience
    item_id = Column(String, nullable=False) # ID of the specific inventory item
    price = Column(Float, nullable=False)
    details = Column(JSON, nullable=True)
    
    booking = relationship("Booking", back_populates="items")
