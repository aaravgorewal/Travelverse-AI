import asyncio
import sys
import os
import uuid

# Ensure the backend directory is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.database.session import Base
from app.models.identity import User, Customer, Agent, Agency, CustomerPreference
from app.models.trips import Trip, TripDay, Activity
from app.models.inventory import Destination, Flight, Hotel
from app.core.config import settings

# Override DB URL for async asyncpg connection if using Postgres, else use sqlite async
# For demo script purposes we will assume the primary DB connection is accessible.
db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://") if "postgresql://" in settings.DATABASE_URL else "sqlite+aiosqlite:///./test.db"
engine = create_async_engine(db_url, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed_data():
    print("Starting Idempotent Data Seed...")
    async with AsyncSessionLocal() as session:
        
        # 1. Check if demo agency exists
        stmt = select(Agency).where(Agency.is_demo == True, Agency.name == "Demo Agency")
        result = await session.execute(stmt)
        agency = result.scalar_one_or_none()
        if not agency:
            agency = Agency(name="Demo Agency", contact_email="contact@demoagency.com", contact_phone="555-0100", is_demo=True)
            session.add(agency)
            await session.commit()
            await session.refresh(agency)
            print("Created Demo Agency.")
            
        # 2. Check if demo Agent exists
        stmt = select(User).where(User.is_demo == True, User.email == "agent@demo.com")
        result = await session.execute(stmt)
        agent_user = result.scalar_one_or_none()
        if not agent_user:
            agent_user = User(name="Demo Agent", email="agent@demo.com", role="agent", is_demo=True)
            session.add(agent_user)
            await session.commit()
            await session.refresh(agent_user)
            
            agent = Agent(user_id=agent_user.id, agency_id=agency.id, title="Senior Travel Designer", is_demo=True)
            session.add(agent)
            await session.commit()
            print("Created Demo Agent.")

        # 3. Check if demo Traveler exists
        stmt = select(User).where(User.is_demo == True, User.email == "traveler@demo.com")
        result = await session.execute(stmt)
        traveler_user = result.scalar_one_or_none()
        if not traveler_user:
            traveler_user = User(name="Demo Traveler", email="traveler@demo.com", role="traveler", is_demo=True)
            session.add(traveler_user)
            await session.commit()
            await session.refresh(traveler_user)
            
            customer = Customer(user_id=traveler_user.id, name="Demo Traveler", email="traveler@demo.com", is_demo=True)
            session.add(customer)
            await session.commit()
            await session.refresh(customer)
            
            pref = CustomerPreference(customer_id=customer.id, preferred_cabin="business", dietary_requirements="vegetarian", is_demo=True)
            session.add(pref)
            await session.commit()
            print("Created Demo Traveler & Preferences.")

        # 4. Check if demo Destination exists
        stmt = select(Destination).where(Destination.is_demo == True, Destination.name == "Paris")
        result = await session.execute(stmt)
        dest = result.scalar_one_or_none()
        if not dest:
            dest = Destination(name="Paris", country="France", region="Europe", description="The city of light.", is_demo=True)
            session.add(dest)
            await session.commit()
            print("Created Demo Destination (Paris).")

        # 5. Check if demo Hotel exists
        stmt = select(Hotel).where(Hotel.is_demo == True, Hotel.name == "Demo Grand Hotel Paris")
        result = await session.execute(stmt)
        hotel = result.scalar_one_or_none()
        if not hotel:
            hotel = Hotel(name="Demo Grand Hotel Paris", provider_id="demo-hotel-1", rating=5, base_price=450.0, currency="USD", is_demo=True)
            session.add(hotel)
            await session.commit()
            print("Created Demo Hotel.")

        # 6. Check if demo Flight exists
        stmt = select(Flight).where(Flight.is_demo == True, Flight.flight_number == "DM100")
        result = await session.execute(stmt)
        flight = result.scalar_one_or_none()
        if not flight:
            flight = Flight(flight_number="DM100", airline="Demo Airlines", origin="JFK", destination="CDG", base_price=1200.0, currency="USD", is_demo=True)
            session.add(flight)
            await session.commit()
            print("Created Demo Flight.")

        # 7. Check if demo Trip exists
        stmt = select(Trip).where(Trip.is_demo == True, Trip.title == "Demo Paris Getaway")
        result = await session.execute(stmt)
        trip = result.scalar_one_or_none()
        if not trip:
            # Need customer ID
            stmt_c = select(Customer).where(Customer.is_demo == True, Customer.email == "traveler@demo.com")
            res_c = await session.execute(stmt_c)
            c = res_c.scalar_one_or_none()
            if c:
                trip = Trip(customer_id=c.id, title="Demo Paris Getaway", status="planned", is_demo=True)
                session.add(trip)
                await session.commit()
                await session.refresh(trip)
                
                # Add Day 1
                day1 = TripDay(trip_id=trip.id, day_index=1, date="2026-10-01", notes="Arrival Day", is_demo=True)
                session.add(day1)
                await session.commit()
                await session.refresh(day1)
                
                # Add Activity
                act = Activity(trip_day_id=day1.id, title="Eiffel Tour", start_time="14:00", duration_minutes=120, is_demo=True)
                session.add(act)
                await session.commit()
                print("Created Demo Trip, TripDay, and Activity.")
            
    print("Idempotent Seed Complete.")

if __name__ == "__main__":
    asyncio.run(seed_data())
