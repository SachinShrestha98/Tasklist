FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
COPY apps/api apps/api
RUN uv sync --frozen --no-dev --package api

FROM python:3.12-slim-bookworm
WORKDIR /app/apps/api
ENV PATH="/app/.venv/bin:$PATH" PYTHHONUNBUFFERED=1
COPY --from=builder /app /app