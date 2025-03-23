# -*- coding: utf-8 -*-
# code generated by Prisma. DO NOT EDIT.
# pyright: reportUnusedImport=false
# fmt: off

# global imports for type checking
from builtins import bool as _bool
from builtins import int as _int
from builtins import float as _float
from builtins import str as _str
import sys
import decimal
import datetime
from typing import (
    TYPE_CHECKING,
    Optional,
    Iterable,
    Iterator,
    Sequence,
    Callable,
    ClassVar,
    NoReturn,
    TypeVar,
    Generic,
    Mapping,
    Tuple,
    Union,
    List,
    Dict,
    Type,
    Any,
    Set,
    overload,
    cast,
)
from typing_extensions import TypedDict, Literal


from typing_extensions import LiteralString
# -- template models.py.jinja --
from pydantic import BaseModel

from . import fields, actions
from ._types import FuncType
from ._builder import serialize_base64
from ._compat import PYDANTIC_V2, ConfigDict

if TYPE_CHECKING:
    from .client import Prisma


_PrismaModelT = TypeVar('_PrismaModelT', bound='_PrismaModel')


class _PrismaModel(BaseModel):
    if PYDANTIC_V2:
        model_config: ClassVar[ConfigDict] = ConfigDict(
            use_enum_values=True,
            arbitrary_types_allowed=True,
            populate_by_name=True,
        )
    elif not TYPE_CHECKING:
        from ._compat import BaseConfig

        class Config(BaseConfig):
            use_enum_values: bool = True
            arbitrary_types_allowed: bool = True
            allow_population_by_field_name: bool = True
            json_encoders: Dict[Any, FuncType] = {
                fields.Base64: serialize_base64,
            }

    # TODO: ensure this is required by subclasses
    __prisma_model__: ClassVar[str]


class BaseUser(_PrismaModel):
    __prisma_model__: ClassVar[Literal['User']] = 'User'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.UserActions[_PrismaModelT]':
        from .client import get_client

        return actions.UserActions[_PrismaModelT](client or get_client(), cls)


class BasePlayer(_PrismaModel):
    __prisma_model__: ClassVar[Literal['Player']] = 'Player'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.PlayerActions[_PrismaModelT]':
        from .client import get_client

        return actions.PlayerActions[_PrismaModelT](client or get_client(), cls)


class BaseGamertagHistory(_PrismaModel):
    __prisma_model__: ClassVar[Literal['GamertagHistory']] = 'GamertagHistory'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.GamertagHistoryActions[_PrismaModelT]':
        from .client import get_client

        return actions.GamertagHistoryActions[_PrismaModelT](client or get_client(), cls)


class BaseSeason(_PrismaModel):
    __prisma_model__: ClassVar[Literal['Season']] = 'Season'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.SeasonActions[_PrismaModelT]':
        from .client import get_client

        return actions.SeasonActions[_PrismaModelT](client or get_client(), cls)


class BaseTier(_PrismaModel):
    __prisma_model__: ClassVar[Literal['Tier']] = 'Tier'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.TierActions[_PrismaModelT]':
        from .client import get_client

        return actions.TierActions[_PrismaModelT](client or get_client(), cls)


class BaseTeam(_PrismaModel):
    __prisma_model__: ClassVar[Literal['Team']] = 'Team'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.TeamActions[_PrismaModelT]':
        from .client import get_client

        return actions.TeamActions[_PrismaModelT](client or get_client(), cls)


class BaseTeamSeason(_PrismaModel):
    __prisma_model__: ClassVar[Literal['TeamSeason']] = 'TeamSeason'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.TeamSeasonActions[_PrismaModelT]':
        from .client import get_client

        return actions.TeamSeasonActions[_PrismaModelT](client or get_client(), cls)


class BasePlayerSeason(_PrismaModel):
    __prisma_model__: ClassVar[Literal['PlayerSeason']] = 'PlayerSeason'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.PlayerSeasonActions[_PrismaModelT]':
        from .client import get_client

        return actions.PlayerSeasonActions[_PrismaModelT](client or get_client(), cls)


class BasePlayerTierHistory(_PrismaModel):
    __prisma_model__: ClassVar[Literal['PlayerTierHistory']] = 'PlayerTierHistory'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.PlayerTierHistoryActions[_PrismaModelT]':
        from .client import get_client

        return actions.PlayerTierHistoryActions[_PrismaModelT](client or get_client(), cls)


class BasePlayerTeamSeason(_PrismaModel):
    __prisma_model__: ClassVar[Literal['PlayerTeamSeason']] = 'PlayerTeamSeason'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.PlayerTeamSeasonActions[_PrismaModelT]':
        from .client import get_client

        return actions.PlayerTeamSeasonActions[_PrismaModelT](client or get_client(), cls)


class BaseContract(_PrismaModel):
    __prisma_model__: ClassVar[Literal['Contract']] = 'Contract'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.ContractActions[_PrismaModelT]':
        from .client import get_client

        return actions.ContractActions[_PrismaModelT](client or get_client(), cls)


class BaseBid(_PrismaModel):
    __prisma_model__: ClassVar[Literal['Bid']] = 'Bid'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.BidActions[_PrismaModelT]':
        from .client import get_client

        return actions.BidActions[_PrismaModelT](client or get_client(), cls)


class BaseMatch(_PrismaModel):
    __prisma_model__: ClassVar[Literal['Match']] = 'Match'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.MatchActions[_PrismaModelT]':
        from .client import get_client

        return actions.MatchActions[_PrismaModelT](client or get_client(), cls)


class BasePlayerMatch(_PrismaModel):
    __prisma_model__: ClassVar[Literal['PlayerMatch']] = 'PlayerMatch'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.PlayerMatchActions[_PrismaModelT]':
        from .client import get_client

        return actions.PlayerMatchActions[_PrismaModelT](client or get_client(), cls)


class BaseNotification(_PrismaModel):
    __prisma_model__: ClassVar[Literal['Notification']] = 'Notification'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.NotificationActions[_PrismaModelT]':
        from .client import get_client

        return actions.NotificationActions[_PrismaModelT](client or get_client(), cls)


class BaseForumPost(_PrismaModel):
    __prisma_model__: ClassVar[Literal['ForumPost']] = 'ForumPost'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.ForumPostActions[_PrismaModelT]':
        from .client import get_client

        return actions.ForumPostActions[_PrismaModelT](client or get_client(), cls)


class BaseForumReaction(_PrismaModel):
    __prisma_model__: ClassVar[Literal['ForumReaction']] = 'ForumReaction'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.ForumReactionActions[_PrismaModelT]':
        from .client import get_client

        return actions.ForumReactionActions[_PrismaModelT](client or get_client(), cls)


class BaseForumFollower(_PrismaModel):
    __prisma_model__: ClassVar[Literal['ForumFollower']] = 'ForumFollower'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.ForumFollowerActions[_PrismaModelT]':
        from .client import get_client

        return actions.ForumFollowerActions[_PrismaModelT](client or get_client(), cls)


class BaseForumPostSubscription(_PrismaModel):
    __prisma_model__: ClassVar[Literal['ForumPostSubscription']] = 'ForumPostSubscription'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.ForumPostSubscriptionActions[_PrismaModelT]':
        from .client import get_client

        return actions.ForumPostSubscriptionActions[_PrismaModelT](client or get_client(), cls)


class BaseForumComment(_PrismaModel):
    __prisma_model__: ClassVar[Literal['ForumComment']] = 'ForumComment'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.ForumCommentActions[_PrismaModelT]':
        from .client import get_client

        return actions.ForumCommentActions[_PrismaModelT](client or get_client(), cls)


class BaseTeamManager(_PrismaModel):
    __prisma_model__: ClassVar[Literal['TeamManager']] = 'TeamManager'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.TeamManagerActions[_PrismaModelT]':
        from .client import get_client

        return actions.TeamManagerActions[_PrismaModelT](client or get_client(), cls)


class BasePSNProfile(_PrismaModel):
    __prisma_model__: ClassVar[Literal['PSNProfile']] = 'PSNProfile'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.PSNProfileActions[_PrismaModelT]':
        from .client import get_client

        return actions.PSNProfileActions[_PrismaModelT](client or get_client(), cls)


class BasePSNAvatar(_PrismaModel):
    __prisma_model__: ClassVar[Literal['PSNAvatar']] = 'PSNAvatar'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.PSNAvatarActions[_PrismaModelT]':
        from .client import get_client

        return actions.PSNAvatarActions[_PrismaModelT](client or get_client(), cls)


class BasePSNTrophy(_PrismaModel):
    __prisma_model__: ClassVar[Literal['PSNTrophy']] = 'PSNTrophy'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.PSNTrophyActions[_PrismaModelT]':
        from .client import get_client

        return actions.PSNTrophyActions[_PrismaModelT](client or get_client(), cls)


class BasePSNGame(_PrismaModel):
    __prisma_model__: ClassVar[Literal['PSNGame']] = 'PSNGame'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.PSNGameActions[_PrismaModelT]':
        from .client import get_client

        return actions.PSNGameActions[_PrismaModelT](client or get_client(), cls)


class BasePSNSyncLog(_PrismaModel):
    __prisma_model__: ClassVar[Literal['PSNSyncLog']] = 'PSNSyncLog'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.PSNSyncLogActions[_PrismaModelT]':
        from .client import get_client

        return actions.PSNSyncLogActions[_PrismaModelT](client or get_client(), cls)


class BasePSNGameTrophies(_PrismaModel):
    __prisma_model__: ClassVar[Literal['PSNGameTrophies']] = 'PSNGameTrophies'  # pyright: ignore[reportIncompatibleVariableOverride]

    @classmethod
    def prisma(cls: Type[_PrismaModelT], client: Optional['Prisma'] = None) -> 'actions.PSNGameTrophiesActions[_PrismaModelT]':
        from .client import get_client

        return actions.PSNGameTrophiesActions[_PrismaModelT](client or get_client(), cls)


