from sqlalchemy.orm import Session
from app.models.inventory import Destination, Place, Activity
from .base import BaseRepository

class DestinationRepository(BaseRepository[Destination]):
    def __init__(self):
        super().__init__(Destination)

class PlaceRepository(BaseRepository[Place]):
    def __init__(self):
        super().__init__(Place)

class ActivityRepository(BaseRepository[Activity]):
    def __init__(self):
        super().__init__(Activity)

destination_repo = DestinationRepository()
place_repo = PlaceRepository()
activity_repo = ActivityRepository()
