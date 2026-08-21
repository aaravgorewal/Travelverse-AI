from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)


class ToolDefinition(BaseModel):
    """Metadata describing a registered tool."""
    name: str
    description: str
    input_schema: Dict[str, Any] = Field(default_factory=dict)
    output_schema: Dict[str, Any] = Field(default_factory=dict)
    permissions: List[str] = Field(default_factory=list, description="Roles allowed to invoke this tool (e.g., 'traveler', 'agent').")


class BaseTool(ABC):
    """Abstract base class all tools must implement."""

    @property
    @abstractmethod
    def definition(self) -> ToolDefinition:
        pass

    @abstractmethod
    async def execute(self, params: Dict[str, Any]) -> Any:
        pass


# ---------------------------------------------------------------------------
# Tool Implementations
# ---------------------------------------------------------------------------

class FlightSearchTool(BaseTool):
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="search_flights",
            description="Search for flights given origin, destination, dates and passengers.",
            input_schema={"origin": "str", "destination": "str", "departure_date": "str", "return_date": "str?", "passengers": "int"},
            output_schema={"flights": "list[Flight]"},
            permissions=["traveler", "agent"],
        )

    async def execute(self, params: Dict[str, Any]) -> Any:
        # Delegate to TBO provider adapter (to be wired)
        return {"status": "provider_not_connected", "tool": self.definition.name, "params": params}


class HotelSearchTool(BaseTool):
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="search_hotels",
            description="Search for hotels given destination, dates, guests and preferences.",
            input_schema={"destination": "str", "check_in": "str", "check_out": "str", "guests": "int", "preferences": "dict?"},
            output_schema={"hotels": "list[Hotel]"},
            permissions=["traveler", "agent"],
        )

    async def execute(self, params: Dict[str, Any]) -> Any:
        return {"status": "provider_not_connected", "tool": self.definition.name, "params": params}


class ExperienceSearchTool(BaseTool):
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="search_experiences",
            description="Search for activities and experiences at a destination.",
            input_schema={"destination": "str", "category": "str?", "date": "str?"},
            output_schema={"experiences": "list[Experience]"},
            permissions=["traveler", "agent"],
        )

    async def execute(self, params: Dict[str, Any]) -> Any:
        return {"status": "provider_not_connected", "tool": self.definition.name, "params": params}


class PlacesTool(BaseTool):
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="search_places",
            description="Search for places of interest using Google Places API.",
            input_schema={"query": "str", "location": "str?", "radius_m": "int?"},
            output_schema={"places": "list[Place]"},
            permissions=["traveler", "agent"],
        )

    async def execute(self, params: Dict[str, Any]) -> Any:
        return {"status": "provider_not_connected", "tool": self.definition.name, "params": params}


class GeocodingTool(BaseTool):
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="geocode",
            description="Convert an address or place name to lat/lng coordinates.",
            input_schema={"address": "str"},
            output_schema={"lat": "float", "lng": "float", "formatted_address": "str"},
            permissions=["traveler", "agent"],
        )

    async def execute(self, params: Dict[str, Any]) -> Any:
        return {"status": "provider_not_connected", "tool": self.definition.name, "params": params}


class RouteTool(BaseTool):
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="route_optimizer",
            description="Compute optimal routes between waypoints using Google Routes API.",
            input_schema={"waypoints": "list[str]", "mode": "str?"},
            output_schema={"route": "Route", "duration_minutes": "int", "distance_km": "float"},
            permissions=["traveler", "agent"],
        )

    async def execute(self, params: Dict[str, Any]) -> Any:
        return {"status": "provider_not_connected", "tool": self.definition.name, "params": params}


class WeatherTool(BaseTool):
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="get_weather",
            description="Get current or forecasted weather for a location.",
            input_schema={"location": "str", "date": "str?"},
            output_schema={"temperature_c": "float", "condition": "str", "humidity": "int"},
            permissions=["traveler", "agent"],
        )

    async def execute(self, params: Dict[str, Any]) -> Any:
        return {"status": "provider_not_connected", "tool": self.definition.name, "params": params}


class BookingTool(BaseTool):
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="create_booking",
            description="Create a booking for flights, hotels, or experiences. Requires confirmation.",
            input_schema={"customer_id": "str", "items": "list[dict]"},
            output_schema={"booking_id": "str", "status": "str", "total_amount": "float"},
            permissions=["agent"],  # Only agents can directly create bookings
        )

    async def execute(self, params: Dict[str, Any]) -> Any:
        return {"status": "provider_not_connected", "tool": self.definition.name, "params": params}


class TripTool(BaseTool):
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="manage_trip",
            description="Create, read, update or delete trip itineraries.",
            input_schema={"action": "str", "trip_id": "str?", "data": "dict?"},
            output_schema={"trip": "Trip"},
            permissions=["traveler", "agent"],
        )

    async def execute(self, params: Dict[str, Any]) -> Any:
        return {"status": "provider_not_connected", "tool": self.definition.name, "params": params}


class CustomerTool(BaseTool):
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="get_customer_profile",
            description="Retrieve full customer profile including preferences and history.",
            input_schema={"customer_id": "str"},
            output_schema={"customer": "Customer", "preferences": "CustomerPreference"},
            permissions=["agent"],  # Only agents access full customer profiles
        )

    async def execute(self, params: Dict[str, Any]) -> Any:
        return {"status": "provider_not_connected", "tool": self.definition.name, "params": params}


class KnowledgeTool(BaseTool):
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="rag_knowledge",
            description="Search the RAG knowledge base for destination guides, policies and travel info.",
            input_schema={"query": "str", "top_k": "int?"},
            output_schema={"chunks": "list[KnowledgeChunk]"},
            permissions=["traveler", "agent"],
        )

    async def execute(self, params: Dict[str, Any]) -> Any:
        return {"status": "provider_not_connected", "tool": self.definition.name, "params": params}


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------

class ToolRegistry:
    """
    Central registry for all backend tools.
    The LLM never executes tools directly — the orchestrator calls this registry,
    which validates permissions before dispatching execution.
    """

    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool):
        defn = tool.definition
        self._tools[defn.name] = tool
        logger.info(f"Registered tool: {defn.name}")

    def get(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_tools(self) -> List[ToolDefinition]:
        return [t.definition for t in self._tools.values()]

    def list_for_role(self, role: str) -> List[ToolDefinition]:
        return [t.definition for t in self._tools.values() if role in t.definition.permissions]

    async def execute(self, tool_name: str, params: Dict[str, Any], user_role: str) -> Any:
        tool = self.get(tool_name)
        if not tool:
            raise ValueError(f"Tool '{tool_name}' not found in registry.")

        if user_role not in tool.definition.permissions:
            raise PermissionError(f"Role '{user_role}' is not permitted to use tool '{tool_name}'.")

        logger.info(f"Executing tool '{tool_name}' for role '{user_role}'")
        return await tool.execute(params)


def create_default_registry() -> ToolRegistry:
    """Factory function that builds and returns the standard TRAVELVERSE tool registry."""
    registry = ToolRegistry()
    registry.register(FlightSearchTool())
    registry.register(HotelSearchTool())
    registry.register(ExperienceSearchTool())
    registry.register(PlacesTool())
    registry.register(GeocodingTool())
    registry.register(RouteTool())
    registry.register(WeatherTool())
    registry.register(BookingTool())
    registry.register(TripTool())
    registry.register(CustomerTool())
    registry.register(KnowledgeTool())
    return registry
