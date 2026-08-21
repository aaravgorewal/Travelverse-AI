from abc import ABC, abstractmethod
from typing import Any, Dict, List, Type
from pydantic import BaseModel

class FeatureStrategy(ABC):
    @property
    @abstractmethod
    def feature_name(self) -> str:
        pass

    @property
    @abstractmethod
    def response_schema(self) -> Type[BaseModel]:
        pass

    @abstractmethod
    def get_system_instruction(self, user_context: dict, trip_context: dict, rag_context: List[str]) -> str:
        pass

    @abstractmethod
    def requires_confirmation(self, response: BaseModel) -> bool:
        pass

# Example implementations (The other 16 would follow this exact pattern)
class TripGenieStrategy(FeatureStrategy):
    @property
    def feature_name(self) -> str:
        return "TripGenie"

    @property
    def response_schema(self) -> Type[BaseModel]:
        from app.schemas.trip_genie import TripGenieResponse # Placeholder import
        return TripGenieResponse

    def get_system_instruction(self, user_context: dict, trip_context: dict, rag_context: List[str]) -> str:
        base = f"You are TripGenie. Plan an itinerary based on user preferences: {user_context}\n"
        if rag_context:
            base += f"Use the following trusted knowledge to inform your plan:\n{rag_context}"
        return base

    def requires_confirmation(self, response: BaseModel) -> bool:
        return False # Planning doesn't require hard booking confirmation

class SmartBundleStrategy(FeatureStrategy):
    @property
    def feature_name(self) -> str:
        return "SmartBundle"

    @property
    def response_schema(self) -> Type[BaseModel]:
        from app.schemas.smart_bundle import SmartBundleResponse # Placeholder import
        return SmartBundleResponse

    def get_system_instruction(self, user_context: dict, trip_context: dict, rag_context: List[str]) -> str:
        base = "You are SmartBundle. Bundle flights and hotels into a package.\n"
        if rag_context:
            base += f"Relevant factual data:\n{rag_context}"
        return base

    def requires_confirmation(self, response: BaseModel) -> bool:
        return True # Booking/Packaging requires agent/user confirmation

def get_strategy(feature_name: str) -> FeatureStrategy:
    strategies = {
        "TripGenie": TripGenieStrategy(),
        "SmartBundle": SmartBundleStrategy(),
        # Other 15 features dynamically mapped here...
    }
    if feature_name not in strategies:
        raise ValueError(f"Unknown feature: {feature_name}")
    return strategies[feature_name]
