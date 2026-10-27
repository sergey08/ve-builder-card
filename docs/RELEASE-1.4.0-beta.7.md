# 1.4.0-beta.7 — Antigüedad de temperatura / Temperature age

## Español

- La antigüedad máxima de la temperatura exterior es configurable en minutos (30 por defecto).
- Usa last_reported cuando está disponible; en su ausencia utiliza last_updated. Una temperatura estable puede mantener una fecha de cambio antigua.
- Mantiene la exclusión de lecturas desconocidas, no disponibles, antiguas o demasiado futuras, y la selección por ubicación.
- 55 pruebas automáticas superadas; pendiente de comprobación visual.

## English

- Outside temperature maximum age is configurable in minutes (default 30).
- Uses last_reported when available, otherwise last_updated. A stable temperature may retain an older change timestamp.
- Still rejects unknown, unavailable, old or excessively future readings and preserves location-based selection.
- 55 automated tests pass; visual validation pending.
