from __future__ import annotations

from typing import TYPE_CHECKING, Any, Dict, List, Union

if TYPE_CHECKING:
    from ..utils import WebRequest, PlatformValidator

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
        search_name: str, # The name of the club to search for.
        platform: str, # This should almost always be "common-gen5"
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
        if not web_request:
            raise ValueError("web_request cannot be None")
        if not platform_validator:
            raise ValueError("platform_validator cannot be None")
        if not platform_validator.validate(platform):
            raise ValueError(f"Provided value is not a valid platform: {platform}")

        self._search_name = search_name
        self._platform = platform
        self._web_request = web_request
        self._club_data = self._get_club_data()
        self._club_id = self._get_club_id()

    def get_club_id(self) -> int:
        """Get the club ID."""
        return self._club_id
    
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

    def _get_club_data(self) -> Union[Dict[str, Any], List[Any]]:
        """Fetch club data from the API.
        
        Returns:
            The parsed JSON response from the API.
            
        Raises:
            requests.exceptions.RequestException: If the HTTP request fails.
        """
        return self._web_request.process(self.url)
    
    def _get_club_id(self) -> int:
        """Get the club ID from the club data."""
        # Make list of keys
        keys = list(self._club_data.keys())

        # Club ID is the first and only top level key
        club_id = keys[0]
        return club_id

