import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import text
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.database.session import SessionLocal
from app.models.identity import User, Agency, Agent, Customer, CustomerPreference
from app.models.inventory import Destination, Activity
from app.models.bookings import Booking, BookingItem, Hotel, Flight

def seed_db():
    db: Session = SessionLocal()
    
    try:
        # Idempotency check: Does the demo agency exist?
        existing_agency = db.query(Agency).filter(Agency.name == "Demo Travel Agency", Agency.is_demo == True).first()
        if existing_agency:
            print("Demo seed data already exists. Skipping to avoid duplicates.")
            return

        print("Seeding database with demo data...")
        
        # 1. Agency
        agency = Agency(name="Demo Travel Agency", is_demo=True)
        db.add(agency)
        db.commit()

        # 2. Users (Agent and Traveler)
        agent_user = User(email="agent@demo.travelverse", hashed_password="fakehash", role="agent", is_demo=True)
        traveler_user = User(email="traveler@demo.travelverse", hashed_password="fakehash", role="traveler", is_demo=True)
        db.add_all([agent_user, traveler_user])
        db.commit()

        # 3. Agent & Customer Profiles
        agent = Agent(user_id=agent_user.id, agency_id=agency.id, is_demo=True)
        customer = Customer(user_id=traveler_user.id, first_name="Demo", last_name="Traveler", is_demo=True)
        db.add_all([agent, customer])
        db.commit()

        # 4. Customer Preferences
        prefs = CustomerPreference(
            customer_id=customer.id, 
            preferences={"dietary": "Vegetarian", "style": "Luxury"},
            is_demo=True
        )
        db.add(prefs)
        
        # 5. Inventory (Destinations & Activities)
        dest = Destination(name="Dubai", country="UAE", is_demo=True)
        db.add(dest)
        db.commit()
        
        act1 = Activity(destination_id=dest.id, name="Desert Safari", category="Adventure", is_demo=True)
        act2 = Activity(destination_id=dest.id, name="Burj Khalifa Tour", category="Sightseeing", is_demo=True)
        db.add_all([act1, act2])
        
        # 6. Mock Flights & Hotels (Raw items, not attached to live trips)
        # Note: In the real app, these are BookingItems inside a Booking. We'll just seed a mock booking for testing.
        from app.models.trips import Trip
        import datetime
        trip = Trip(customer_id=customer.id, name="Demo Dubai Trip", start_date=datetime.date.today(), end_date=datetime.date.today(), is_demo=True)
        db.add(trip)
        db.commit()
        
        booking = Booking(trip_id=trip.id, status="Confirmed", total_price=1500.0, is_demo=True)
        db.add(booking)
        db.commit()
        
        b_item_hotel = BookingItem(booking_id=booking.id, item_type="hotel", price=1000.0, is_demo=True)
        b_item_flight = BookingItem(booking_id=booking.id, item_type="flight", price=500.0, is_demo=True)
        db.add_all([b_item_hotel, b_item_flight])
        db.commit()
        
        hotel = Hotel(booking_item_id=b_item_hotel.id, hotel_name="Atlantis The Palm", is_demo=True)
        flight = Flight(booking_item_id=b_item_flight.id, flight_number="EK101", is_demo=True)
        db.add_all([hotel, flight])
        
        db.commit()
        print("Seed complete! Demo data inserted securely.")
        
    except Exception as e:
        db.rollback()
        print(f"Failed to seed data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
