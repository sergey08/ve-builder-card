# VE Builder Card 1.8.0-beta.1

### Battery beta (v1.8.0-beta.1)

The Battery section shows the state of charge on a 3D EV chassis, plus range, charging power and plug status. Existing sections titled “Charging modes” are displayed as Battery and keep their mode entities and actions. Generic selection blocks retain their original layout. You can also add a Battery block in the visual editor.

In the Battery settings, choose the sensors manually or reuse the overview readings. With a single existing power or limits block, the first Battery section shows limits inline and groups additional readings under **Charging power**. Select a block explicitly when there are several, or choose **Keep separate**. Choose a number helper or number entity for the current adjustment. Read-only current sensors still show their reading.

For XPengTK 0.6.49, enable **Show preheating** and select the status sensor and the vehicle target entity. The configurable services default to `xpeng.start_battery_preheating` and `xpeng.stop_battery_preheating`. Each action requires confirmation. If the state is unknown or unavailable, the controls are disabled. Leave preheating disabled on unsupported vehicles.

In HACS or Marketplace, open the card’s menu, choose **Redownload**, enable beta versions if needed and select `v1.8.0-beta.1`. Reload the dashboard after downloading.

### Beta de Batería (v1.8.0-beta.1)

La sección Batería muestra el porcentaje sobre un chasis 3D, junto con la autonomía, la potencia de carga y el estado del cable. Las secciones existentes tituladas «Modos de carga» se muestran como Batería y conservan sus entidades y acciones. Los bloques de selección genéricos mantienen su presentación. También puedes añadir un bloque Batería desde el editor visual.

En los ajustes de Batería puedes elegir los sensores manualmente o reutilizar las lecturas del bloque de inicio. Si hay un único bloque de potencia o de límites, la primera sección Batería muestra los límites y agrupa las lecturas adicionales en **Potencia de carga**. Si hay varios, selecciona uno de forma explícita o elige **Mantener separado**. Selecciona un ayudante numérico o una entidad `number` para ajustar la intensidad. Los sensores de solo lectura siguen mostrando su valor.

Para XPengTK 0.6.49, activa **Mostrar precalentamiento** y selecciona el sensor de estado y la entidad objetivo del vehículo. Los servicios configurables son `xpeng.start_battery_preheating` y `xpeng.stop_battery_preheating` de forma predeterminada. Cada acción requiere confirmación. Los botones se desactivan si el estado es desconocido o no está disponible. Deja el precalentamiento desactivado si el vehículo no lo admite.

En HACS o Marketplace, abre el menú de la tarjeta, elige **Volver a descargar**, muestra las versiones beta si hace falta y selecciona `v1.8.0-beta.1`. Recarga el panel tras descargarla.
