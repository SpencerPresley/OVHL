from __future__ import annotations

from typing import Any, Dict

from ..utils import WebRequest, PlatformValidator

# Import the Pydantic models
from ..models.club_response.club_data import ClubResponse


class GetClubsRequest:
    """Handles requests to fetch club data from the EA NHL API.

    This class encapsulates the logic for making requests to the EA NHL API
    to search for clubs by name.

    Attributes:
        search_name: The name of the club to search for.
        platform: The gaming platform identifier.
    """

    def __init__(
        self,
        search_name: str,  # The name of the club to search for.
        platform: str,  # This should almost always be "common-gen5"
        web_request: WebRequest,
        platform_validator: PlatformValidator,
    ) -> None:
        """Initialize a new GetClubsRequest instance.

        Args:
            search_name: The name of the club to search for.
            platform: The gaming platform identifier.
            web_request: WebRequest instance for making HTTP requests.
            platform_validator: Validator for platform identifiers.

        Raises:
            ValueError: If any of the validators are None or if platform is invalid.
        """
        self._platform_validator = platform_validator
        self._search_name = search_name
        self._platform = platform
        self._web_request = web_request
        self._check_args()
        self._club_data = self._parse_club_data(self._fetch_raw_club_data())
        self._club_id = self._get_club_id()
        
    def _check_args(self) -> None:
        if not self._web_request:
            raise ValueError("Argument `web_request` cannot be None")
        if not isinstance(self._web_request, WebRequest):
            raise ValueError("Argument `web_request` must be a `WebRequest` instance")
        if not self._platform_validator:
            raise ValueError("Argument `platform_validator` cannot be None")
        if not isinstance(self._platform_validator, PlatformValidator):
            raise ValueError("Argument `platform_validator` must be a `PlatformValidator` instance")
        if not self._platform_validator.validate(self._platform):
            raise ValueError(f"Provided value is not a valid platform: {self._platform}")
        
    def get_club_id(self) -> int:
        """Get the club ID."""
        return self._club_id

    def get_club_data(self) -> ClubResponse:
        """Get the validated club data as a Pydantic model."""
        return self._club_data

    @property
    def search_name(self) -> str:
        """Get the search name."""
        return self._search_name

    @property
    def platform(self) -> str:
        """Get the platform identifier."""
        return self._platform

    @property
    def url(self) -> str:
        """Get the formatted API URL."""
        club_name_formatted = self.search_name.replace(" ", "+").lower()
        return f"https://proclubs.ea.com/api/nhl/clubs/search?platform={self.platform}&clubName={club_name_formatted}"

    def _fetch_raw_club_data(self) -> Dict[str, Any]:
        """Fetch raw club data from the API.

        Returns:
            The parsed JSON response from the API.

        Raises:
            requests.exceptions.RequestException: If the HTTP request fails.
        """
        return self._web_request.process(self.url)

    def _parse_club_data(self, raw_club_data: Dict[str, Any]) -> ClubResponse:
        """Parse raw club data using Pydantic model.

        Returns:
            Validated ClubResponse object

        Raises:
            ValidationError: If the data doesn't match the expected schema
        """
        return ClubResponse.model_validate(raw_club_data)

    def _get_club_id(self) -> int:
        """Get the club ID from the club data."""
        for _, club_data in self._club_data.root.items():
            if club_data.name == self.search_name:
                return club_data.club_id
        raise ValueError(f"Club not found: {self.search_name}")
