# VE Builder Card 1.7.5

## English

### What's new
- Charging sources in Costs and savings support live power (W/kW) and daily accumulated energy (kWh/Wh), with flexible sensor and input_number selection in the visual editor.
- In daily energy mode, **total charged** is shown above a **full-width stacked bar** with coloured solar and grid segments and a legend of kWh and percentage.
- Missing readings do not invent data; tiny mismatches between complete readings are normalised. Daily bars remain visible while the car is idle; power bars retain their animated flow.
- Fixed the inherited top margin on the stacked bar segments that left a visible grey stripe at the top. The full height is now filled.
- Existing dashboards and calculations are preserved; no Home Assistant configuration changes are made by the update.

### Validation
Automated Check and HACS validation passed in beta.5. The final appearance, including full-height bars, was explicitly confirmed by the user in Home Assistant prior to stable publication.

## Español

### Novedades
- Fuentes de carga en Gastos y ahorro admite potencia instantánea (W/kW) y energía diaria (kWh/Wh), con selectores compatibles con sensores y ayudantes input_number.
- En modo energía diaria se muestra el **total cargado encima de una barra completa**, con segmentos solar y red por colores y leyenda de kWh y porcentajes.
- Las lecturas ausentes no generan valores inventados; las pequeñas diferencias de redondeo se ajustan si todas las fuentes tienen datos. Las barras de energía diaria se muestran también en reposo, y las de potencia conservan su animación.
- Corregida la separación superior gris causada por un margen genérico heredado; los segmentos llenan ahora toda la altura de la barra.
- Sin modificaciones automáticas de los paneles ni de los cálculos existentes.

### Validación
Las pruebas automáticas Check y HACS pasaron en beta.5. El usuario confirmó expresamente en Home Assistant el diseño final y la corrección de la franja gris antes de esta publicación estable.
