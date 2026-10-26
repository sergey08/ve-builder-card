[English](QA.en.md) · **Español**

# Validación antes de publicar

## Automatizado

Ejecutar `npm run check`. Verifica valores ausentes, barras fuera de rango, unidades de presión, imágenes, independencia de configuraciones y controles compatibles. Estas pruebas no sustituyen las de interfaz.

## Home Assistant real — pendiente

1. Instalar el recurso en un panel de pruebas; conservar el prototipo.
2. Crear dos copias desde el selector; comprobar que editar una no cambia la otra.
3. Abrir un campo, cambiar presentación y reenviar `setConfig`: deben conservarse los apartados abiertos y el desplazamiento.
4. Probar añadir, duplicar, ordenar y borrar campos, grupos y bloques.
5. Comprobar conector desconectado, conectado con 0 W y cargando; preferencia de movimiento reducido.
6. Cambiar potencia y batería mientras se mantiene abierto el mapa: debe conservar zoom y componente.
7. Mover un deslizador mientras llegan actualizaciones; debe guardar una vez y mostrar el error si falla.
8. Revisar los cuatro sensores de presión; valores ausentes y unidades incorrectas.
9. Revisar precios de electricidad y gasóleo y el comentario inferior.
10. Probar temas claro/oscuro y anchos 360, 768 y 1440 px; teclado y lector de pantalla.
11. Probar una orden solo con una entidad de pruebas, sin ejecutar acciones reales sobre el vehículo.
12. Instalar y actualizar desde HACS en una instalación limpia.

## Criterios de primera publicación

No declarar una versión estable hasta completar esta lista. El repositorio necesita README, licencia, manifest, distribución, release y documentación de compatibilidad. No incluir configuraciones privadas ni credenciales.

- Verificar idioma automático y selección español/inglés; conservar títulos y notas personalizados al cambiar de idioma.
