# VE Builder Card 1.7.0-beta.1

## English

Small addition: a compact, configurable state row below the vehicle image.

- Add, remove and reorder indicators for the lock, doors and windows in **Edit → Overview → States below the vehicle**.
- Configure each entity, display name, icon, normal/warning state and optional custom text. Normal readings stay subtle; unlocked/open readings are highlighted in amber.
- Unknown, unavailable or unrecognised states show No data and never imply that doors or windows are closed.
- Selecting an indicator only opens the entity details. No lock or window commands are sent, even if an imported item contains action settings.
- Default mappings: locked/unlocked for lock entities, closed/open for covers and off/on for binary sensors. Review your integration’s actual states.
- Full-card export/import, section copy and duplicate operations preserve the new indicators and generate independent identifiers.
- Interface and help in English, Spanish, Portuguese, French, German, Italian and Dutch. Existing cards gain no indicators until configured.

**Validation:** 78 automated tests pass, including state mappings, unknown states, escaping, detail-only behaviour, copy and import independence. Visual review on desktop/mobile remains pending before stable release.

## Español

Pequeña mejora: fila compacta y configurable de estados bajo la imagen del vehículo.

- Añade, quita y ordena indicadores de cerradura, puertas y ventanillas en **Editar → Inicio → Estados bajo el vehículo**.
- Configura entidad, nombre, icono, estados normal/de aviso y textos opcionales. Las lecturas normales son discretas; desbloqueado/abierto se resalta en ámbar.
- Estados desconocidos, no disponibles o no reconocidos muestran Sin datos; nunca se interpretan como puertas o ventanillas cerradas.
- Al pulsar solo se abren los detalles de la entidad. No envía órdenes a cerraduras o ventanillas, aunque un elemento importado contenga ajustes de acciones.
- Valores predeterminados: locked/unlocked para entidades lock, closed/open para cover y off/on para sensores binarios. Revisa los estados reales de tu integración.
- Exportar/importar, copiar y duplicar apartados conservan los indicadores y generan identificadores independientes.
- Interfaz y ayuda en inglés, español, portugués, francés, alemán, italiano y neerlandés. Las tarjetas existentes no añaden indicadores hasta configurarlos.

**Validación:** 78 pruebas automáticas correctas, incluidos estados, datos desconocidos, escape de texto, pulsación solo de detalles e independencia al copiar/importar. Pendiente revisión visual en escritorio/móvil antes de liberar la estable.
