from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

from prisma import Prisma

prisma_client = Prisma()

__all__ = ["prisma_client"]

