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
# -- template enums.py.jinja --
from ._compat import StrEnum


class System(StrEnum):
    PS = 'PS'
    XBOX = 'XBOX'

class VerificationStatus(StrEnum):
    PENDING = 'PENDING'
    VERIFIED = 'VERIFIED'
    EXPIRED = 'EXPIRED'
    FAILED = 'FAILED'
    UNKNOWN = 'UNKNOWN'

class UserRole(StrEnum):
    SUPER_ADMIN = 'SUPER_ADMIN'
    ADMIN = 'ADMIN'
    COMMISSIONER = 'COMMISSIONER'
    BOG = 'BOG'
    USER = 'USER'

class LeagueType(StrEnum):
    NHL = 'NHL'
    AHL = 'AHL'
    ECHL = 'ECHL'
    CHL = 'CHL'

class CHLSubLeague(StrEnum):
    OHL = 'OHL'
    QMJHL = 'QMJHL'
    WHL = 'WHL'
    NAJHL = 'NAJHL'

class PositionGroup(StrEnum):
    FORWARD = 'FORWARD'
    DEFENSE = 'DEFENSE'
    GOALIE = 'GOALIE'

class PlayerPosition(StrEnum):
    LW = 'LW'
    C = 'C'
    RW = 'RW'
    LD = 'LD'
    RD = 'RD'
    G = 'G'
    ECU = 'ECU'

class BidStatus(StrEnum):
    PENDING = 'PENDING'
    ACCEPTED = 'ACCEPTED'
    REJECTED = 'REJECTED'

class NotificationType(StrEnum):
    SYSTEM = 'SYSTEM'
    FORUM = 'FORUM'
    TEAM = 'TEAM'
    LEAGUE = 'LEAGUE'
    MATCH = 'MATCH'
    CUSTOM = 'CUSTOM'

class NotificationStatus(StrEnum):
    UNREAD = 'UNREAD'
    READ = 'READ'
    ARCHIVED = 'ARCHIVED'

class ForumPostStatus(StrEnum):
    PUBLISHED = 'PUBLISHED'
    HIDDEN = 'HIDDEN'
    DELETED = 'DELETED'

class ReactionType(StrEnum):
    LIKE = 'LIKE'
    DISLIKE = 'DISLIKE'
    LAUGH = 'LAUGH'
    THINKING = 'THINKING'
    HEART = 'HEART'

class TeamManagementRole(StrEnum):
    OWNER = 'OWNER'
    GM = 'GM'
    AGM = 'AGM'
    PAGM = 'PAGM'

class PSNSyncType(StrEnum):
    PROFILE = 'PROFILE'
    TROPHIES = 'TROPHIES'
    GAMES = 'GAMES'
    ALL = 'ALL'

class PSNSyncStatus(StrEnum):
    PENDING = 'PENDING'
    IN_PROGRESS = 'IN_PROGRESS'
    SUCCESS = 'SUCCESS'
    FAILED = 'FAILED'

