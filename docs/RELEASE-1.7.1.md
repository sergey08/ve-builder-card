# VE Builder Card 1.7.1-beta.1 — release preparation

## English

- Configurable OTA version sensor (`ota_version_entity`) and update-status sensor (`ota_status_entity`) in Overview with image.
- Show OS name and version on the right of the vehicle title, with an amber exclamation icon when an update is available.
- Hide version and icon when the version entity is empty or lacks a usable value.
- Existing vehicle blocks and cards remain compatible.

## Español

- Sensores configurables de versión OTA (`ota_version_entity`) y estado de actualización (`ota_status_entity`) en Inicio con imagen.
- Nombre y versión del sistema a la derecha del título, con una exclamación ámbar cuando exista una actualización.
- Ocultar versión e icono si el sensor está vacío o no tiene un valor válido.
- Compatibilidad con las tarjetas existentes.

## Validation / Validación

- Temporary preview installed on user's XPeng dashboard and visual placement approved on 2026-10-29.
- Source code committed on `beta/1.7.1`; full compiled build, automated tests and official beta release still require verification before stable publication.
- Do not publish stable or remove the temporary preview until the built version has been validated.
