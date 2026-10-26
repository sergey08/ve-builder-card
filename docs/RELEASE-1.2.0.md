# 1.2.0 — Colores por valor y presiones recomendadas / Value colours and recommended pressures

## Español

### Novedades

- **Colores según el valor** para campos numéricos, barras de potencia, precios e importes, límites y presiones del mapa del vehículo. Es opcional: las configuraciones existentes conservan su estilo hasta activarlo.
- Selección de avisos por **valores bajos o altos**, con umbral de aviso en ámbar y crítico en rojo; los valores fuera de los avisos se muestran en verde. Los umbrales incluyen el valor indicado y tienen prioridad los críticos.
- **Umbrales de presión independientes por eje**: delantero y trasero. Si no hay configuración propia, el eje utiliza los colores comunes; una configuración propia desactivada deja ese eje sin colorear.
- **Presión recomendada en frío**, en pequeño bajo cada rueda, con valores editables para delante y detrás. Se guarda en bar y se convierte a la unidad mostrada: bar, kPa o psi. Vacío o 0 oculta la referencia.
- Sin datos válidos o con umbrales incoherentes se conserva el estilo habitual, sin mostrar un estado verde engañoso.
- Guías en español e inglés y lista de mejoras pendientes en `docs/ROADMAP.md`.

### Configuración

En Editar, abre un campo numérico y **Colores según el valor**. En el Mapa del vehículo encontrarás los colores comunes, los ajustes por eje y **Presiones recomendadas**. Utiliza las presiones en frío de la etiqueta de tu vehículo; los umbrales visuales no son tolerancias oficiales ni presiones de inflado. No se incluyen valores de un modelo concreto por defecto.

### Validación

- 31 pruebas automáticas superadas: límites inclusivos, prioridad del crítico, datos ausentes, umbrales inválidos, conversión de unidades, ajustes por eje y referencias recomendadas.
- Validación de la beta final confirmada por el mantenedor en su instalación.
- Promoción de `1.2.0-beta.3` sin nuevos cambios funcionales.

## English

### What's new

- Optional **Value-based colours** for numeric fields, power bars, reference prices and amounts, limits and vehicle map pressures. Existing configurations retain their style until colours are enabled.
- Choose **low or high values**, with amber warning and red critical thresholds; values outside warning ranges appear green. Thresholds are inclusive and critical takes priority.
- **Independent front and rear axle pressure thresholds**. An axle without an override uses shared colours; a disabled axle override leaves it uncoloured.
- Small **recommended cold pressure** references beneath each wheel, with editable front and rear values. References are stored in bar and converted to the display unit: bar, kPa or psi. Empty or 0 hides the reference.
- Missing readings and invalid threshold order preserve the original style instead of showing a misleading green state.
- Updated English and Spanish guides and a pending improvements list in `docs/ROADMAP.md`.

### Configuration

In Edit, open a numeric field and **Value-based colours**. The Vehicle map contains shared colours, axle overrides and **Recommended pressures**. Use the cold pressures from your vehicle label; visual thresholds are not official tolerances or inflation pressures. No model-specific values are supplied by default.

### Validation

- 31 automated tests pass: inclusive boundaries, critical priority, missing data, invalid thresholds, unit conversion, axle overrides and recommended references.
- Final beta validated by the maintainer in their installation.
- Promotes `1.2.0-beta.3` without additional functional changes.
