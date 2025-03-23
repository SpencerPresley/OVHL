"""Module for handling EA NHL Pro Clubs game data requests."""

from typing import Any, Dict, List, Union

from ..utils import WebRequest, PlatformValidator, MatchTypeValidator
from ..models import Match

class GetGamesRequest:
    """Handles requests to fetch games data from the EA NHL API.

    This class encapsulates the logic for making requests to the EA NHL API
    to fetch games data for a specific club.

    Attributes:
        club_id: The ID of the club to fetch games for.
        platform: The gaming platform identifier.
        match_type: The type of match to fetch.
    """

    def __init__(
        self,
        club_id: int,
        match_type: str,  # For league games, almost always 'club_private'
        platform: str,  # Should almost always be 'common-gen5'
        web_request: WebRequest,
        platform_validator: PlatformValidator,
        match_type_validator: MatchTypeValidator,
    ) -> None:
        """Initialize a new GetGamesRequest instance.

        Args:
            club_id: The ID of the club to fetch games for.
            match_type: The type of match to fetch.
            platform: The gaming platform identifier.
            web_request: WebRequest instance for making HTTP requests.
            platform_validator: Validator for platform identifiers.
            match_type_validator: Validator for match types.

        Raises:
            ValueError: If any of the validators are None or if platform/match_type are invalid.
        """
        self._club_id = club_id
        self._match_type = match_type
        self._platform = platform
        self._web_request = web_request
        self._platform_validator = platform_validator
        self._match_type_validator = match_type_validator
        self._check_args()
    
    def _check_args(self) -> None:
        if not self._web_request:
            raise ValueError("Argument `web_request` cannot be None")
        if not isinstance(self._web_request, WebRequest):
            raise ValueError("Argument `web_request` must be a `WebRequest` instance")
        if not self._platform_validator:
            raise ValueError("Argument `platform_validator` cannot be None")
        if not isinstance(self._platform_validator, PlatformValidator):
            raise ValueError("Argument `platform_validator` must be a `PlatformValidator` instance")
        if not self._match_type_validator:
            raise ValueError("Argument `match_type_validator` cannot be None")
        if not isinstance(self._match_type_validator, MatchTypeValidator):
            raise ValueError("Argument `match_type_validator` must be a `MatchTypeValidator` instance")
        if not self._platform_validator.validate(self._platform):
            raise ValueError(f"Provided value is not a valid platform: {self._platform}")
        if not self._match_type_validator.validate(self._match_type):
            raise ValueError(f"Provided value is not a valid matchType: {self._match_type}")
        
    @property
    def club_id(self) -> int:
        """Get the club ID."""
        return self._club_id

    @property
    def platform(self) -> str:
        """Get the platform identifier."""
        return self._platform

    @property
    def match_type(self) -> str:
        """Get the match type."""
        return self._match_type

    @property
    def url(self) -> str:
        """Get the formatted API URL."""
        return f"https://proclubs.ea.com/api/nhl/clubs/matches?clubIds={self.club_id}&platform={self.platform}&matchType={self.match_type}"
    
    def _fetch_raw_data(self) -> Dict[str, Any]:
        """Fetch raw data from the API."""
        return self._web_request.process(self.url)
    
    def get_games(self) -> Union[Dict[str, Any], List[Any]]:
        """Fetch games data from the API.

        Returns:
            The parsed JSON response from the API.

        Raises:
            requests.exceptions.RequestException: If the HTTP request fails.
        """
        raw_data = self._fetch_raw_data()
        return [Match.model_validate(match_data) for match_data in raw_data]
