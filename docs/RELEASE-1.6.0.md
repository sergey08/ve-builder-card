# VE Builder Card 1.6.0

## English

Optional rain over the vehicle image, validated during the 1.6.0 betas.

- Current-weather, binary rain or numeric current-precipitation source, with configurable state or threshold.
- Light, normal or heavy visual intensity, animated or static. Three depth layers vary drop lengths, opacity and fall speeds, with staggered phases, stable irregular positions and soft image edges.
- Optional home-only location gate, manual under-cover setting and optional cover sensor.
- Missing, unavailable, invalid or old rain readings show no rain. Default maximum age: 180 minutes, configurable; expired effects are removed by the existing minute refresh.
- Clearly labelled sample preview for testing on a dry day. Preview ignores sensors, location and cover; turn it off after testing.
- Reduced-motion support and a click-through overlay that preserves the car image and charging cable.
- Controls and help in English, Spanish, Portuguese, French, German, Italian and Dutch. Rain settings survive full-card export/import and entity-free sharing.

**Configure:** Edit → Overview → Rain over the vehicle. For a binary sensor, choose Rain sensor · yes/no, select the entity and use its rain state (default on). Use current conditions, not forecasts, rain probability or daily accumulated precipitation. Visual intensity does not estimate actual rainfall.

**Validation:** 72 automated tests and official HACS checks passed on the beta; the maintainer validated the refined animation. Existing cards keep rain disabled until configured. No migration or vehicle commands. Update from HACS and reload the frontend.

## Español

Lluvia opcional sobre la imagen del vehículo, validada durante las betas 1.6.0.

- Origen meteorológico, sensor binario de lluvia o sensor numérico de precipitación actual, con estado o umbral configurable.
- Intensidad visual ligera, normal o intensa, animada o estática. Tres capas de profundidad con distintas longitudes, transparencias y velocidades, fases desfasadas, distribución irregular estable y bordes suaves.
- Restricción opcional a cuando el coche está en casa, ajuste manual de coche bajo techo y sensor opcional de cobertura.
- Sin lectura reciente válida no muestra lluvia. Antigüedad máxima de 180 minutos por defecto, configurable; la revisión por minuto retira efectos caducados.
- Vista previa etiquetada como ejemplo para probar sin lluvia real. Ignora sensores, ubicación y techo; desactivarla después de probar.
- Respeta movimiento reducido y no intercepta pulsaciones; conserva imagen y manguera de carga.
- Controles y ayudas en inglés, español, portugués, francés, alemán, italiano y neerlandés. La configuración se conserva al exportar/importar y compartir sin entidades.

**Configurar:** Editar → Inicio → Lluvia sobre el vehículo. Para un sensor binario, elige Sensor de lluvia · sí/no, selecciona la entidad y configura el estado de lluvia (on por defecto). Usa condiciones actuales, no previsiones, probabilidad ni lluvia diaria acumulada. La intensidad visual no estima la lluvia real.

**Validación:** 72 pruebas automáticas y validación oficial HACS superadas en la beta; el mantenedor ha validado la animación mejorada. Las tarjetas existentes mantienen la lluvia desactivada hasta configurarla. Sin migración ni órdenes al vehículo. Actualiza desde HACS y recarga la interfaz.
