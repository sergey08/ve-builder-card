# VE Builder Card 1.6.0-beta.1

## English

- Optional rain overlay on the vehicle image, using the current state of a weather entity, binary rain sensor or current precipitation sensor.
- Configurable light, normal or heavy visual intensity, animated or static. Reduced-motion preferences disable animation.
- Optional home-only location gate, manual under-cover setting and an optional covered-vehicle sensor. Unknown location or cover states suppress the effect when the corresponding gate is configured.
- Missing, unavailable, old or invalid rain readings do not show rain. Maximum reading age defaults to 180 minutes and is configurable. A minute refresh removes expired rain without repainting the whole card.
- Clearly labelled sample preview for testing on a dry day. Preview ignores sensors, location and cover; turn it off after testing.
- All controls and help in English, Spanish, Portuguese, French, German, Italian and Dutch. Configuration is retained by full-card export/import and optional entity-free sharing.

**Try it:** Edit → Overview → Rain over the vehicle → Show rain. Select a source and entity. Use current conditions, not forecasts, rain probability or daily accumulated precipitation. For a numeric source, rain appears when the value is strictly greater than the configured threshold, using that sensor’s unit. The intensity is cosmetic and does not estimate actual rain rate.

The photo and charging cable are preserved. The overlay receives no clicks and sends no vehicle commands. No entities are preassigned and the effect is disabled on existing cards until configured. 71 automated tests pass; mobile visual validation remains pending. The user downloads betas from HACS; no automatic installation.

## Español

- Capa opcional de lluvia sobre la imagen del vehículo, basada en el estado actual de una entidad meteorológica, sensor binario de lluvia o sensor de precipitación actual.
- Intensidad visual ligera, normal o intensa, con animación o estática. La preferencia de movimiento reducido desactiva la animación.
- Restricción opcional a cuando el coche está en casa, ajuste manual de coche bajo techo y sensor opcional de cobertura. La ubicación o cobertura desconocida oculta el efecto si se configura esa condición.
- Lecturas de lluvia ausentes, no disponibles, antiguas o inválidas no muestran lluvia. Antigüedad máxima de 180 minutos por defecto, configurable. La revisión cada minuto retira el efecto caducado sin redibujar toda la tarjeta.
- Vista previa marcada como ejemplo para probar sin lluvia real. Ignora sensores, ubicación y techo; desactívala después de probar.
- Controles y ayudas en inglés, español, portugués, francés, alemán, italiano y neerlandés. La configuración se conserva al exportar/importar y al compartir sin entidades.

**Prueba:** Editar → Inicio → Lluvia sobre el vehículo → Mostrar lluvia. Elige origen y entidad. Usa condiciones actuales, no previsiones, probabilidades o precipitación diaria acumulada. En origen numérico, muestra lluvia si el valor supera estrictamente el umbral, en la unidad del sensor. La intensidad es decorativa y no estima la precipitación real.

Conserva la imagen y la manguera de carga. La capa no intercepta pulsaciones ni envía órdenes. No trae entidades preasignadas y queda desactivada en las tarjetas existentes hasta configurarla. Pasan 71 pruebas automáticas; queda pendiente la validación visual móvil. El usuario descarga las betas desde HACS; no se instalan automáticamente.
