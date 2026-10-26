# 1.2.1-beta.1 — Corrección de estilos / Stylesheet fix

## Español

- Corrige una regresión al unir los estilos: una expresión con comas conservaba solo la última hoja y omitía los colores por valor y los estilos del mapa del vehículo.
- Restaura la aplicación de verde, ámbar y rojo y los estilos de aperturas, manteniendo las referencias de presión recomendada.
- Conserva todos los umbrales y configuraciones guardadas; no requiere volver a configurar los campos.
- Añade una prueba de regresión que exige que las seis hojas de estilo estén presentes en la tarjeta distribuida.
- 32 pruebas superadas. Pendiente validación visual tras instalar esta beta.

## English

- Fix a stylesheet composition regression: a comma expression retained only the last stylesheet and omitted value colours and vehicle map styles.
- Restore green, amber and red value colours and opening indicator styles while preserving recommended pressure references.
- Keep saved thresholds and configuration; fields do not need to be configured again.
- Add a regression test requiring all six stylesheets in the distributed card.
- 32 tests pass. Visual validation is pending installation of this beta.
