from sqlalchemy.orm import Session
from app.models.system import Notification
from .base import BaseRepository

class NotificationRepository(BaseRepository[Notification]):
    def __init__(self):
        super().__init__(Notification)

notification_repo = NotificationRepository()
