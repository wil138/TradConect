# Reglas de Desarrollo AI - TradConect

## Stack Tecnológico
- **Lenguaje**: JavaScript (ES6+) para la lógica del lado del cliente.
- **Estructura**: HTML5 semántico para la maquetación de las páginas.
- **Estilos**: CSS3 personalizado con variables para mantener la consistencia visual.
- **Iconos**: Font Awesome 6.0 para la iconografía del sitio.
- **Fuentes**: Google Fonts (Inter) para una tipografía moderna y legible.
- **Visualización de Datos**: Chart.js para los tableros de control y gráficos analíticos.
- **Organización**: Separación clara entre archivos HTML (raíz), CSS (carpeta Styles/) y JS (carpeta javascripts/).

## Reglas de Uso de Librerías y Estructura
- **HTML**: Mantener los archivos HTML limpios y utilizar etiquetas semánticas (`<header>`, `<main>`, `<aside>`, `<footer>`).
- **CSS**: Utilizar variables CSS (`:root`) para colores y espaciados. Los archivos deben residir en la carpeta `Styles/`.
- **JavaScript**: Utilizar funciones modulares y evitar contaminar el scope global. Los archivos deben residir en la carpeta `javascripts/`.
- **Gráficos**: Utilizar **Chart.js** para todas las visualizaciones, asegurando que sean responsivas mediante la configuración `responsive: true`.
- **Interactividad**: Priorizar la manipulación del DOM nativa (`document.getElementById`, `querySelector`) para mantener el proyecto ligero.

## Principios Generales
- **Simplicidad**: Mantener el código elegante y evitar librerías innecesarias.
- **Responsividad**: Cada página debe ser totalmente adaptable a dispositivos móviles.
- **Mantenibilidad**: Comentar las secciones clave del código JS y CSS para facilitar futuras modificaciones.