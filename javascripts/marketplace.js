// marketplace.js - Módulo completo con carrito integrado
window.marketplace = {
    products: [
    {
        "id": 1,
        "name": "Cemento Canal 42.5kg",
        "price": 12.5,
        "originalPrice": 15.99,
        "vendor": "HOLCIM NICARAGUA",
        "category": "Construcción",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500",
        "isOffer": true,
        "discount": 22
    },
    {
        "id": 2,
        "name": "Bloque de Concreto 15x20x40",
        "price": 0.85,
        "originalPrice": 1.2,
        "vendor": "Bloquera Central",
        "category": "Construcción",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1576995853123-5b10305d93c0?w=500",
        "isOffer": true,
        "discount": 29
    },
    {
        "id": 3,
        "name": "Ladrillo Cuarterón",
        "price": 0.45,
        "originalPrice": 0.65,
        "vendor": "Ladrillera Nacional",
        "category": "Construcción",
        "origin": "Tipitapa",
        "img": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=500",
        "isOffer": true,
        "discount": 31
    },
    {
        "id": 4,
        "name": "Arena de Río (m3)",
        "price": 18.5,
        "originalPrice": 25.0,
        "vendor": "Agregados del Pacífico",
        "category": "Construcción",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500",
        "isOffer": true,
        "discount": 26
    },
    {
        "id": 5,
        "name": "Café Matagalpa Orgánico",
        "price": 9.99,
        "originalPrice": 14.99,
        "vendor": "Cafetaleros del Norte",
        "category": "Alimentos",
        "origin": "Matagalpa",
        "img": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500",
        "isOffer": true,
        "discount": 33
    },
    {
        "id": 6,
        "name": "Cacao Orgánico 500g",
        "price": 8.5,
        "originalPrice": 12.0,
        "vendor": "Cacaotero Nicaragüense",
        "category": "Alimentos",
        "origin": "Waslala",
        "img": "https://images.unsplash.com/photo-1511381939415-e44015466834?w=500",
        "isOffer": true,
        "discount": 29
    },
    {
        "id": 7,
        "name": "Miel de Abeja Pura 1kg",
        "price": 11.99,
        "originalPrice": 16.5,
        "vendor": "Apícola Las Colinas",
        "category": "Alimentos",
        "origin": "Jinotega",
        "img": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500",
        "isOffer": true,
        "discount": 27
    },
    {
        "id": 8,
        "name": "Hamaca de Masaya",
        "price": 35.0,
        "originalPrice": 55.0,
        "vendor": "Tejidos Nicaragüenses",
        "category": "Artesanías",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500",
        "isOffer": true,
        "discount": 36
    },
    {
        "id": 9,
        "name": "Cerámica de San Juan",
        "price": 25.99,
        "originalPrice": 35.0,
        "vendor": "Artesanías Doña Elena",
        "category": "Artesanías",
        "origin": "San Juan de Oriente",
        "img": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500",
        "isOffer": true,
        "discount": 26
    },
    {
        "id": 10,
        "name": "Pintura Látex Premium",
        "price": 42.5,
        "originalPrice": 55.0,
        "vendor": "Pinturas Centroamérica",
        "category": "Acabados",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500",
        "isOffer": true,
        "discount": 23
    },
    {
        "id": 11,
        "name": "Juego de Llaves Mecánicas",
        "price": 45.0,
        "originalPrice": 69.99,
        "vendor": "Tools Nicaragua",
        "category": "Herramientas",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500",
        "isOffer": true,
        "discount": 36
    },
    {
        "id": 12,
        "name": "Codos PVC 1/2 (10 pza)",
        "price": 3.99,
        "originalPrice": 5.99,
        "vendor": "Tuboplus",
        "category": "Plomería",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1585704032915-c3400ca1f963?w=500",
        "isOffer": true,
        "discount": 33
    },
    {
        "id": 13,
        "name": "Crema de Cacao Corporal",
        "price": 12.99,
        "originalPrice": 18.0,
        "vendor": "Cosmética Natural",
        "category": "Belleza",
        "origin": "Granada",
        "img": "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500",
        "isOffer": true,
        "discount": 28
    },
    {
        "id": 14,
        "name": "Vino de Coyol Premium",
        "price": 18.99,
        "originalPrice": 25.0,
        "vendor": "Licores Tradicionales",
        "category": "Bebidas",
        "origin": "León",
        "img": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500",
        "isOffer": true,
        "discount": 24
    },
    {
        "id": 15,
        "name": "Silla de Mimbre",
        "price": 45.0,
        "originalPrice": 69.99,
        "vendor": "Muebles Artesanales",
        "category": "Muebles",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "isOffer": true,
        "discount": 36
    },
    {
        "id": 16,
        "name": "Anillo de Plata con Jade",
        "price": 55.0,
        "originalPrice": 85.0,
        "vendor": "Joyas Nicaragüenses",
        "category": "Joyería",
        "origin": "Ometepe",
        "img": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
        "isOffer": true,
        "discount": 35
    },
    {
        "id": 17,
        "name": "Güipil Tradicional",
        "price": 45.0,
        "originalPrice": 65.0,
        "vendor": "Textiles Doña Chila",
        "category": "Textiles",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500",
        "isOffer": true,
        "discount": 31
    },
    {
        "id": 18,
        "name": "Cajeta de Leche",
        "price": 3.5,
        "originalPrice": 5.5,
        "vendor": "Dulces Doña Chela",
        "category": "Alimentos",
        "origin": "León",
        "img": "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=500",
        "isOffer": true,
        "discount": 36
    },
    {
        "id": 19,
        "name": "Hierro Corrugado 3/8",
        "price": 8.75,
        "originalPrice": null,
        "vendor": "SINSA",
        "category": "Construcción",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1533035350251-aa8b8e208d95?w=500",
        "isOffer": false
    },
    {
        "id": 20,
        "name": "Alambre de Amarre #18",
        "price": 2.5,
        "originalPrice": null,
        "vendor": "Aceros del Valle",
        "category": "Construcción",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500",
        "isOffer": false
    },
    {
        "id": 21,
        "name": "Clavos 2.5 (lb)",
        "price": 1.85,
        "originalPrice": null,
        "vendor": "Ferretería Central",
        "category": "Construcción",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1581092160562-40aa08e7882c?w=500",
        "isOffer": false
    },
    {
        "id": 22,
        "name": "Malla Electrosoldada",
        "price": 22.5,
        "originalPrice": null,
        "vendor": "Mallas Industriales",
        "category": "Construcción",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500",
        "isOffer": false
    },
    {
        "id": 23,
        "name": "Rosquillas (12 und)",
        "price": 3.99,
        "originalPrice": null,
        "vendor": "Panadería Sabor Nica",
        "category": "Alimentos",
        "origin": "Estelí",
        "img": "https://images.unsplash.com/photo-1627308597925-bd8279a3b895?w=500",
        "isOffer": false
    },
    {
        "id": 24,
        "name": "Queso Fresco 500g",
        "price": 4.5,
        "originalPrice": null,
        "vendor": "Lácteos San Ramón",
        "category": "Alimentos",
        "origin": "Boaco",
        "img": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500",
        "isOffer": false
    },
    {
        "id": 25,
        "name": "Cajeta de Coco",
        "price": 2.5,
        "originalPrice": null,
        "vendor": "Dulces Doña Chela",
        "category": "Alimentos",
        "origin": "León",
        "img": "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=500",
        "isOffer": false
    },
    {
        "id": 26,
        "name": "Nacatamal (6 und)",
        "price": 15.0,
        "originalPrice": null,
        "vendor": "Comida Tradicional",
        "category": "Alimentos",
        "origin": "Granada",
        "img": "https://images.unsplash.com/photo-1574486268266-0fef1ca33e6c?w=500",
        "isOffer": false
    },
    {
        "id": 27,
        "name": "Pintura Látex Blanca",
        "price": 85.0,
        "originalPrice": null,
        "vendor": "SHERWIN WILLIAMS",
        "category": "Acabados",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500",
        "isOffer": false
    },
    {
        "id": 28,
        "name": "Cerámica Piso 40x40",
        "price": 12.99,
        "originalPrice": null,
        "vendor": "Cerámica Nacional",
        "category": "Acabados",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500",
        "isOffer": false
    },
    {
        "id": 29,
        "name": "Zula de Baño",
        "price": 35.0,
        "originalPrice": null,
        "vendor": "Sanitarios del Istmo",
        "category": "Acabados",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
        "isOffer": false
    },
    {
        "id": 30,
        "name": "Taladro Percutor 800W",
        "price": 110.0,
        "originalPrice": null,
        "vendor": "DEWALT",
        "category": "Herramientas",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500",
        "isOffer": false
    },
    {
        "id": 31,
        "name": "Sierra Circular 1800W",
        "price": 95.0,
        "originalPrice": null,
        "vendor": "Makita Tools",
        "category": "Herramientas",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500",
        "isOffer": false
    },
    {
        "id": 32,
        "name": "Cinta Métrica 5m",
        "price": 3.99,
        "originalPrice": null,
        "vendor": "Stanley Tools",
        "category": "Herramientas",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=500",
        "isOffer": false
    },
    {
        "id": 33,
        "name": "Nivel Laser",
        "price": 45.0,
        "originalPrice": null,
        "vendor": "Bosch Tools",
        "category": "Herramientas",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1581092160562-40aa08e7882c?w=500",
        "isOffer": false
    },
    {
        "id": 34,
        "name": "Tubería PVC 1/2",
        "price": 2.15,
        "originalPrice": null,
        "vendor": "DURMAN",
        "category": "Plomería",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1585704032915-c3400ca1f963?w=500",
        "isOffer": false
    },
    {
        "id": 35,
        "name": "Llave de Paso 1/2",
        "price": 5.5,
        "originalPrice": null,
        "vendor": "Helvex Nicaragua",
        "category": "Plomería",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1585704032915-c3400ca1f963?w=500",
        "isOffer": false
    },
    {
        "id": 36,
        "name": "Flexible de Agua 30cm",
        "price": 3.25,
        "originalPrice": null,
        "vendor": "Tuboexpress",
        "category": "Plomería",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1585704032915-c3400ca1f963?w=500",
        "isOffer": false
    },
    {
        "id": 37,
        "name": "Manta de Algondón",
        "price": 28.0,
        "originalPrice": null,
        "vendor": "Textiles Nicaragüenses",
        "category": "Textiles",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500",
        "isOffer": false
    },
    {
        "id": 38,
        "name": "Cortina de Lino",
        "price": 35.0,
        "originalPrice": null,
        "vendor": "Textiles Doña Chila",
        "category": "Textiles",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500",
        "isOffer": false
    },
    {
        "id": 39,
        "name": "Jabón de Cacao y Miel",
        "price": 5.99,
        "originalPrice": null,
        "vendor": "Cosmética Natural",
        "category": "Belleza",
        "origin": "Granada",
        "img": "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500",
        "isOffer": false
    },
    {
        "id": 40,
        "name": "Aceite de Coco Virgen",
        "price": 8.5,
        "originalPrice": null,
        "vendor": "Cosmética Natural",
        "category": "Belleza",
        "origin": "Rivas",
        "img": "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500",
        "isOffer": false
    },
    {
        "id": 41,
        "name": "Champú de Sábila",
        "price": 7.99,
        "originalPrice": null,
        "vendor": "Herbal Nicaragua",
        "category": "Belleza",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500",
        "isOffer": false
    },
    {
        "id": 42,
        "name": "Rón Flor de Caña 7 años",
        "price": 22.5,
        "originalPrice": null,
        "vendor": "Licores Nicaragüenses",
        "category": "Bebidas",
        "origin": "Chinandega",
        "img": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500",
        "isOffer": false
    },
    {
        "id": 43,
        "name": "Cerveza Toña (12 pack)",
        "price": 14.99,
        "originalPrice": null,
        "vendor": "Cervecería Nacional",
        "category": "Bebidas",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500",
        "isOffer": false
    },
    {
        "id": 44,
        "name": "Mesa de Centro Mimbre",
        "price": 65.0,
        "originalPrice": null,
        "vendor": "Muebles Artesanales",
        "category": "Muebles",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "isOffer": false
    },
    {
        "id": 45,
        "name": "Sillón Mecedora",
        "price": 85.0,
        "originalPrice": null,
        "vendor": "Muebles Artesanales",
        "category": "Muebles",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "isOffer": false
    },
    {
        "id": 46,
        "name": "Pulsera de Hilo y Jade",
        "price": 15.0,
        "originalPrice": null,
        "vendor": "Joyas Nicaragüenses",
        "category": "Joyería",
        "origin": "Ometepe",
        "img": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
        "isOffer": false
    },
    {
        "id": 47,
        "name": "Collar de Semillas",
        "price": 12.0,
        "originalPrice": null,
        "vendor": "Artesanías Indígenas",
        "category": "Joyería",
        "origin": "Rivas",
        "img": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
        "isOffer": false
    },
    {
        "id": 48,
        "name": "Lámina Galvanizada",
        "price": 18.5,
        "originalPrice": null,
        "vendor": "Metales del Istmo",
        "category": "Metales",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1533035350251-aa8b8e208d95?w=500",
        "isOffer": false
    },
    {
        "id": 49,
        "name": "Tubo Cuadrado 1x1",
        "price": 9.99,
        "originalPrice": null,
        "vendor": "Aceros del Valle",
        "category": "Metales",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1533035350251-aa8b8e208d95?w=500",
        "isOffer": false
    },
    {
        "id": 50,
        "name": "Cable Eléctrico #12",
        "price": 0.85,
        "originalPrice": null,
        "vendor": "Eléctrica Nacional",
        "category": "Electrónica",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500",
        "isOffer": false
    },
    {
        "id": 51,
        "name": "Interruptor Simple",
        "price": 1.25,
        "originalPrice": null,
        "vendor": "Eléctrica Nacional",
        "category": "Electrónica",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500",
        "isOffer": false
    },
    {
        "id": 52,
        "name": "Herramienta Pro 52",
        "price": 36.0,
        "originalPrice": null,
        "vendor": "Ferremix",
        "category": "Herramientas",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500",
        "isOffer": false
    },
    {
        "id": 53,
        "name": "Producto Genérico Plomería 53",
        "price": 36.5,
        "originalPrice": null,
        "vendor": "TuboNica",
        "category": "Plomería",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1585704032915-c3400ca1f963?w=500",
        "isOffer": false
    },
    {
        "id": 54,
        "name": "Producto Genérico Belleza 54",
        "price": 37.0,
        "originalPrice": null,
        "vendor": "Natural Nica",
        "category": "Belleza",
        "origin": "Granada",
        "img": "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500",
        "isOffer": false
    },
    {
        "id": 55,
        "name": "Producto Genérico Bebidas 55",
        "price": 37.5,
        "originalPrice": null,
        "vendor": "Licores del Sur",
        "category": "Bebidas",
        "origin": "Granada",
        "img": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500",
        "isOffer": false
    },
    {
        "id": 56,
        "name": "Producto Genérico Muebles 56",
        "price": 38.0,
        "originalPrice": null,
        "vendor": "Mueblería Central",
        "category": "Muebles",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "isOffer": false
    },
    {
        "id": 57,
        "name": "Producto Genérico Joyería 57",
        "price": 38.5,
        "originalPrice": null,
        "vendor": "Plata Real",
        "category": "Joyería",
        "origin": "Ometepe",
        "img": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
        "isOffer": false
    },
    {
        "id": 58,
        "name": "Producto Genérico Metales 58",
        "price": 39.0,
        "originalPrice": null,
        "vendor": "Aceros Nica",
        "category": "Metales",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1533035350251-aa8b8e208d95?w=500",
        "isOffer": false
    },
    {
        "id": 59,
        "name": "Producto Genérico Electrónica 59",
        "price": 39.5,
        "originalPrice": null,
        "vendor": "Voltio S.A.",
        "category": "Electrónica",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500",
        "isOffer": false
    },
    {
        "id": 60,
        "name": "Material de Obra 60",
        "price": 40.0,
        "originalPrice": null,
        "vendor": "SINSA",
        "category": "Construcción",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500",
        "isOffer": false
    },
    {
        "id": 61,
        "name": "Snack Regional 61",
        "price": 40.5,
        "originalPrice": null,
        "vendor": "Distribuidora Nacional",
        "category": "Alimentos",
        "origin": "Matagalpa",
        "img": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500",
        "isOffer": false
    },
    {
        "id": 62,
        "name": "Producto Genérico Artesanías 62",
        "price": 41.0,
        "originalPrice": null,
        "vendor": "Mercado de Artesanías",
        "category": "Artesanías",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1590001158193-79013ac99161?w=500",
        "isOffer": false
    },
    {
        "id": 63,
        "name": "Producto Genérico Acabados 63",
        "price": 41.5,
        "originalPrice": null,
        "vendor": "ConstruMarket",
        "category": "Acabados",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500",
        "isOffer": false
    },
    {
        "id": 64,
        "name": "Herramienta Pro 64",
        "price": 42.0,
        "originalPrice": null,
        "vendor": "Ferremix",
        "category": "Herramientas",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500",
        "isOffer": false
    },
    {
        "id": 65,
        "name": "Producto Genérico Plomería 65",
        "price": 42.5,
        "originalPrice": null,
        "vendor": "TuboNica",
        "category": "Plomería",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1585704032915-c3400ca1f963?w=500",
        "isOffer": false
    },
    {
        "id": 66,
        "name": "Producto Genérico Belleza 66",
        "price": 43.0,
        "originalPrice": null,
        "vendor": "Natural Nica",
        "category": "Belleza",
        "origin": "Granada",
        "img": "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500",
        "isOffer": false
    },
    {
        "id": 67,
        "name": "Producto Genérico Bebidas 67",
        "price": 43.5,
        "originalPrice": null,
        "vendor": "Licores del Sur",
        "category": "Bebidas",
        "origin": "Granada",
        "img": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500",
        "isOffer": false
    },
    {
        "id": 68,
        "name": "Producto Genérico Muebles 68",
        "price": 44.0,
        "originalPrice": null,
        "vendor": "Mueblería Central",
        "category": "Muebles",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "isOffer": false
    },
    {
        "id": 69,
        "name": "Producto Genérico Joyería 69",
        "price": 44.5,
        "originalPrice": null,
        "vendor": "Plata Real",
        "category": "Joyería",
        "origin": "Ometepe",
        "img": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
        "isOffer": false
    },
    {
        "id": 70,
        "name": "Producto Genérico Metales 70",
        "price": 45.0,
        "originalPrice": null,
        "vendor": "Aceros Nica",
        "category": "Metales",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1533035350251-aa8b8e208d95?w=500",
        "isOffer": false
    },
    {
        "id": 71,
        "name": "Producto Genérico Electrónica 71",
        "price": 45.5,
        "originalPrice": null,
        "vendor": "Voltio S.A.",
        "category": "Electrónica",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500",
        "isOffer": false
    },
    {
        "id": 72,
        "name": "Material de Obra 72",
        "price": 46.0,
        "originalPrice": null,
        "vendor": "SINSA",
        "category": "Construcción",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500",
        "isOffer": false
    },
    {
        "id": 73,
        "name": "Snack Regional 73",
        "price": 46.5,
        "originalPrice": null,
        "vendor": "Distribuidora Nacional",
        "category": "Alimentos",
        "origin": "Matagalpa",
        "img": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500",
        "isOffer": false
    },
    {
        "id": 74,
        "name": "Producto Genérico Artesanías 74",
        "price": 47.0,
        "originalPrice": null,
        "vendor": "Mercado de Artesanías",
        "category": "Artesanías",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1590001158193-79013ac99161?w=500",
        "isOffer": false
    },
    {
        "id": 75,
        "name": "Producto Genérico Acabados 75",
        "price": 47.5,
        "originalPrice": null,
        "vendor": "ConstruMarket",
        "category": "Acabados",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500",
        "isOffer": false
    },
    {
        "id": 76,
        "name": "Herramienta Pro 76",
        "price": 48.0,
        "originalPrice": null,
        "vendor": "Ferremix",
        "category": "Herramientas",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500",
        "isOffer": false
    },
    {
        "id": 77,
        "name": "Producto Genérico Plomería 77",
        "price": 48.5,
        "originalPrice": null,
        "vendor": "TuboNica",
        "category": "Plomería",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1585704032915-c3400ca1f963?w=500",
        "isOffer": false
    },
    {
        "id": 78,
        "name": "Producto Genérico Belleza 78",
        "price": 49.0,
        "originalPrice": null,
        "vendor": "Natural Nica",
        "category": "Belleza",
        "origin": "Granada",
        "img": "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500",
        "isOffer": false
    },
    {
        "id": 79,
        "name": "Producto Genérico Bebidas 79",
        "price": 49.5,
        "originalPrice": null,
        "vendor": "Licores del Sur",
        "category": "Bebidas",
        "origin": "Granada",
        "img": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500",
        "isOffer": false
    },
    {
        "id": 80,
        "name": "Producto Genérico Muebles 80",
        "price": 50.0,
        "originalPrice": null,
        "vendor": "Mueblería Central",
        "category": "Muebles",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "isOffer": false
    },
    {
        "id": 81,
        "name": "Producto Genérico Joyería 81",
        "price": 50.5,
        "originalPrice": null,
        "vendor": "Plata Real",
        "category": "Joyería",
        "origin": "Ometepe",
        "img": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
        "isOffer": false
    },
    {
        "id": 82,
        "name": "Producto Genérico Metales 82",
        "price": 51.0,
        "originalPrice": null,
        "vendor": "Aceros Nica",
        "category": "Metales",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1533035350251-aa8b8e208d95?w=500",
        "isOffer": false
    },
    {
        "id": 83,
        "name": "Producto Genérico Electrónica 83",
        "price": 51.5,
        "originalPrice": null,
        "vendor": "Voltio S.A.",
        "category": "Electrónica",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500",
        "isOffer": false
    },
    {
        "id": 84,
        "name": "Material de Obra 84",
        "price": 52.0,
        "originalPrice": null,
        "vendor": "SINSA",
        "category": "Construcción",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500",
        "isOffer": false
    },
    {
        "id": 85,
        "name": "Snack Regional 85",
        "price": 52.5,
        "originalPrice": null,
        "vendor": "Distribuidora Nacional",
        "category": "Alimentos",
        "origin": "Matagalpa",
        "img": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500",
        "isOffer": false
    },
    {
        "id": 86,
        "name": "Producto Genérico Artesanías 86",
        "price": 53.0,
        "originalPrice": null,
        "vendor": "Mercado de Artesanías",
        "category": "Artesanías",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1590001158193-79013ac99161?w=500",
        "isOffer": false
    },
    {
        "id": 87,
        "name": "Producto Genérico Acabados 87",
        "price": 53.5,
        "originalPrice": null,
        "vendor": "ConstruMarket",
        "category": "Acabados",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500",
        "isOffer": false
    },
    {
        "id": 88,
        "name": "Herramienta Pro 88",
        "price": 54.0,
        "originalPrice": null,
        "vendor": "Ferremix",
        "category": "Herramientas",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500",
        "isOffer": false
    },
    {
        "id": 89,
        "name": "Producto Genérico Plomería 89",
        "price": 54.5,
        "originalPrice": null,
        "vendor": "TuboNica",
        "category": "Plomería",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1585704032915-c3400ca1f963?w=500",
        "isOffer": false
    },
    {
        "id": 90,
        "name": "Producto Genérico Belleza 90",
        "price": 55.0,
        "originalPrice": null,
        "vendor": "Natural Nica",
        "category": "Belleza",
        "origin": "Granada",
        "img": "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500",
        "isOffer": false
    },
    {
        "id": 91,
        "name": "Producto Genérico Bebidas 91",
        "price": 55.5,
        "originalPrice": null,
        "vendor": "Licores del Sur",
        "category": "Bebidas",
        "origin": "Granada",
        "img": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500",
        "isOffer": false
    },
    {
        "id": 92,
        "name": "Producto Genérico Muebles 92",
        "price": 56.0,
        "originalPrice": null,
        "vendor": "Mueblería Central",
        "category": "Muebles",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "isOffer": false
    },
    {
        "id": 93,
        "name": "Producto Genérico Joyería 93",
        "price": 56.5,
        "originalPrice": null,
        "vendor": "Plata Real",
        "category": "Joyería",
        "origin": "Ometepe",
        "img": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
        "isOffer": false
    },
    {
        "id": 94,
        "name": "Producto Genérico Metales 94",
        "price": 57.0,
        "originalPrice": null,
        "vendor": "Aceros Nica",
        "category": "Metales",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1533035350251-aa8b8e208d95?w=500",
        "isOffer": false
    },
    {
        "id": 95,
        "name": "Producto Genérico Electrónica 95",
        "price": 57.5,
        "originalPrice": null,
        "vendor": "Voltio S.A.",
        "category": "Electrónica",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500",
        "isOffer": false
    },
    {
        "id": 96,
        "name": "Material de Obra 96",
        "price": 58.0,
        "originalPrice": null,
        "vendor": "SINSA",
        "category": "Construcción",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500",
        "isOffer": false
    },
    {
        "id": 97,
        "name": "Snack Regional 97",
        "price": 58.5,
        "originalPrice": null,
        "vendor": "Distribuidora Nacional",
        "category": "Alimentos",
        "origin": "Matagalpa",
        "img": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500",
        "isOffer": false
    },
    {
        "id": 98,
        "name": "Producto Genérico Artesanías 98",
        "price": 59.0,
        "originalPrice": null,
        "vendor": "Mercado de Artesanías",
        "category": "Artesanías",
        "origin": "Masaya",
        "img": "https://images.unsplash.com/photo-1590001158193-79013ac99161?w=500",
        "isOffer": false
    },
    {
        "id": 99,
        "name": "Producto Genérico Acabados 99",
        "price": 59.5,
        "originalPrice": null,
        "vendor": "ConstruMarket",
        "category": "Acabados",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500",
        "isOffer": false
    },
    {
        "id": 100,
        "name": "Herramienta Pro 100",
        "price": 60.0,
        "originalPrice": null,
        "vendor": "Ferremix",
        "category": "Herramientas",
        "origin": "Managua",
        "img": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500",
        "isOffer": false
    }
],

    // ========================================
    // VARIABLES
    // ========================================
    categories: [],
    currentCategory: "Todos",
    searchTerm: "",
    selectedQuantities: {},
    cart: [],

    // Extraer categorías únicas (esto va en init)

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    init: function () {
        console.log('Marketplace: Inicializando');

        // Extraer categorías únicas
        this.categories = ["Todos", ...new Set(this.products.map(p => p.category))];

        // Inicializar cantidades por producto
        this.products.forEach(p => { this.selectedQuantities[p.id] = 1; });

        // Cargar carrito guardado
        this.loadCart();

        // Renderizar interfaz
        this.renderCategories();
        this.renderProducts();
        this.setupEvents();
        this.updateCartUI();
    },

    // ========================================
    // EVENTOS
    // ========================================
    setupEvents: function () {
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            const newSearch = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(newSearch, searchInput);
            newSearch.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderProducts();
            });
        }

        window.addEventListener('storage', (e) => {
            if (e.key === 'userRole') this.renderProducts();
        });
    },

    // ========================================
    // UTILIDADES
    // ========================================
    getCategoryIcon: function (cat) {
        const icons = {
            'Todos': 'fa-th-large',
            'Construcción': 'fa-hard-hat',
            'Alimentos': 'fa-utensils',
            'Artesanías': 'fa-hand-sparkles',
            'Textiles': 'fa-tshirt',
            'Acabados': 'fa-paint-roller',
            'Herramientas': 'fa-tools',
            'Plomería': 'fa-wrench',
            'Belleza': 'fa-leaf',
            'Bebidas': 'fa-wine-bottle',
            'Muebles': 'fa-couch',
            'Joyería': 'fa-gem'
        };
        return icons[cat] || 'fa-tag';
    },

    isClientRole: function () {
        const role = localStorage.getItem('userRole') || "client";
        return role === "client";
    },

    showToast: function (message, type = "success") {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            font-size: 0.9rem;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    },

    // ========================================
    // CATEGORÍAS
    // ========================================
    renderCategories: function () {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;

        grid.innerHTML = this.categories.map(cat => `
            <div class="category-card ${this.currentCategory === cat ? 'active' : ''}" data-category="${cat}">
                <div class="category-icon">
                    <i class="fas ${this.getCategoryIcon(cat)}"></i>
                </div>
                <strong>${cat}</strong>
                ${cat !== 'Todos' ? `<small>${this.products.filter(p => p.category === cat).length}</small>` : ''}
            </div>
        `).join('');

        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.getAttribute('data-category');
                this.filterByCategory(category);
            });
        });
    },

    filterByCategory: function (category) {
        this.currentCategory = category;
        this.renderCategories();
        this.renderProducts();
    },

    // ========================================
    // PRODUCTOS
    // ========================================
    renderProducts: function () {
        let filtered = this.currentCategory === "Todos"
            ? [...this.products]
            : this.products.filter(p => p.category === this.currentCategory);

        if (this.searchTerm.trim()) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                p.vendor.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                p.origin.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        filtered.sort((a, b) => (b.isOffer ? 1 : 0) - (a.isOffer ? 1 : 0));

        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-state"><i class="fas fa-search" style="font-size: 3rem;"></i><p>No se encontraron productos</p></div>`;
            return;
        }

        grid.innerHTML = filtered.map(p => {
            const qty = this.selectedQuantities[p.id] || 1;
            return `
                <div class="product-card" data-id="${p.id}">
                    <div class="product-image">
                        <img src="${p.img}" alt="${p.name}" loading="lazy">
                        ${p.isOffer ? `
                            <div class="offer-badge"><i class="fas fa-fire"></i> Oferta</div>
                            <div class="discount-badge">-${p.discount}%</div>
                        ` : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-vendor">${p.vendor}</div>
                        <div class="product-title">${p.name}</div>
                        <div class="product-origin"><i class="fas fa-map-marker-alt"></i> ${p.origin}</div>
                        <div class="product-price">
                            ${p.isOffer ? `
                                <span class="original-price">$${p.originalPrice.toFixed(2)}</span>
                                <span class="offer-price">$${p.price.toFixed(2)}</span>
                            ` : `
                                <span>$${p.price.toFixed(2)}</span>
                            `}
                        </div>
                        ${this.isClientRole() ? `
                            <div class="quantity-selector">
                                <button class="qty-btn" data-action="decrement" data-id="${p.id}">-</button>
                                <span class="qty-value" style="min-width: 30px; text-align: center;">${qty}</span>
                                <button class="qty-btn" data-action="increment" data-id="${p.id}">+</button>
                            </div>
                            <button class="btn-add" data-id="${p.id}">
                                <i class="fas fa-cart-plus"></i> Añadir al Carrito
                            </button>
                        ` : `
                            <button class="btn-disabled" disabled style="width: 100%; padding: 10px; background: #ccc; border: none; border-radius: 8px; cursor: not-allowed; margin-top: 8px;">
                                <i class="fas fa-store"></i> Modo Proveedor
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        // Eventos de cantidad
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const action = btn.getAttribute('data-action');
                const delta = action === 'increment' ? 1 : -1;
                this.updateQuantity(id, delta);
            });
        });

        // Eventos de añadir al carrito
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                this.addToCart(id, btn);
            });
        });
    },

    updateQuantity: function (id, delta) {
        const newQty = Math.max(1, (this.selectedQuantities[id] || 1) + delta);
        this.selectedQuantities[id] = newQty;
        this.renderProducts();
    },

    // ========================================
    // CARRITO
    // ========================================
    addToCart: function (id, btnElement) {
        if (!this.isClientRole()) {
            this.showToast("Debes cambiar a modo Cliente para comprar", "error");
            return;
        }

        const product = this.products.find(p => p.id === id);
        const quantity = this.selectedQuantities[id] || 1;
        const existing = this.cart.find(item => item.id === id);

        if (existing) {
            existing.quantity += quantity;
        } else {
            this.cart.push({ ...product, quantity: quantity });
        }

        this.saveCart();
        this.updateCartUI();
        this.showToast(`✓ ${quantity} x ${product.name} añadido al carrito`);

        if (btnElement) {
            const originalText = btnElement.innerHTML;
            btnElement.innerHTML = '<i class="fas fa-check"></i> ¡Añadido!';
            btnElement.style.background = '#10b981';
            setTimeout(() => {
                btnElement.innerHTML = originalText;
                btnElement.style.background = '';
            }, 800);
        }
    },

    saveCart: function () {
        localStorage.setItem('marketplaceCart', JSON.stringify(this.cart));
    },

    loadCart: function () {
        const saved = localStorage.getItem('marketplaceCart');
        if (saved) {
            this.cart = JSON.parse(saved);
        }
    },

    updateCartUI: function () {
        // Actualizar contador del carrito
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) cartCountElement.innerText = count;

        const container = document.getElementById('cartItems');
        if (!container) return;

        // Calcular totales
        let subtotalOriginal = 0;
        let ahorroTotal = 0;

        this.cart.forEach(item => {
            const precioActual = item.price;
            const precioOriginal = item.originalPrice || item.price;
            const subtotal = precioActual * item.quantity;
            const ahorro = (precioOriginal - precioActual) * item.quantity;
            subtotalOriginal += subtotal;
            ahorroTotal += ahorro > 0 ? ahorro : 0;
        });

        const totalPagar = subtotalOriginal;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-shopping-bag" style="font-size: 3rem; color: #cbd5e1;"></i>
                    <p style="margin-top: 1rem; color: #64748b;">Tu carrito está vacío</p>
                    <button onclick="window.marketplace.toggleCart()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-arrow-left"></i> Seguir comprando
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = this.cart.map(item => {
                const precioActual = item.price;
                const precioOriginal = item.originalPrice;
                const subtotal = precioActual * item.quantity;
                const ahorro = precioOriginal ? (precioOriginal - precioActual) * item.quantity : 0;

                return `
                    <div class="cart-item" style="display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid #e2e8f0;">
                        <img src="${item.img}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 10px;">
                        <div class="cart-item-info" style="flex: 1;">
                            <div class="cart-item-title" style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
                            <div class="cart-item-vendor" style="font-size: 0.7rem; color: #64748b; margin-bottom: 6px;">${item.vendor}</div>
                            
                            ${item.isOffer ? `
                                <div class="cart-item-price" style="margin-bottom: 8px;">
                                    <span style="text-decoration: line-through; font-size: 0.75rem; color: #94a3b8;">$${precioOriginal.toFixed(2)}</span>
                                    <span style="color: #ef4444; font-weight: 700; margin-left: 6px;">$${precioActual.toFixed(2)}</span>
                                    <span style="background: #fef3c7; padding: 2px 6px; border-radius: 12px; font-size: 0.65rem; margin-left: 6px;">-${item.discount}%</span>
                                </div>
                            ` : `
                                <div class="cart-item-price" style="margin-bottom: 8px;">
                                    <span style="font-weight: 700;">$${precioActual.toFixed(2)}</span>
                                </div>
                            `}
                            
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <button class="cart-qty-btn" data-id="${item.id}" data-delta="-1" style="width: 28px; height: 28px; border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer;">-</button>
                                    <span style="min-width: 30px; text-align: center; font-weight: 500;">${item.quantity}</span>
                                    <button class="cart-qty-btn" data-id="${item.id}" data-delta="1" style="width: 28px; height: 28px; border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer;">+</button>
                                </div>
                                <div style="font-weight: 700; color: #1e293b;">
                                    $${subtotal.toFixed(2)}
                                </div>
                            </div>
                            
                            ${ahorro > 0 ? `
                                <div style="font-size: 0.7rem; color: #10b981; margin-top: 6px;">
                                    <i class="fas fa-tag"></i> Ahorro: $${ahorro.toFixed(2)}
                                </div>
                            ` : ''}
                        </div>
                        <button class="cart-remove-btn" data-id="${item.id}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.1rem;">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
            }).join('');

            // Eventos del carrito
            document.querySelectorAll('.cart-qty-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    const delta = parseInt(btn.dataset.delta);
                    this.updateCartQuantity(id, delta);
                });
            });

            document.querySelectorAll('.cart-remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeFromCart(parseInt(btn.dataset.id));
                });
            });
        }

        // Actualizar total en el footer
        const cartTotalElement = document.getElementById('cartTotal');
        if (cartTotalElement) {
            cartTotalElement.innerHTML = `$${totalPagar.toFixed(2)}`;
        }

        // Actualizar resumen detallado
        this.updateCartSummary(subtotalOriginal, ahorroTotal, totalPagar);
    },

    updateCartSummary: function (subtotal, ahorro, total) {
        const cartFooter = document.querySelector('.cart-footer');
        if (!cartFooter) return;

        let summaryDiv = document.getElementById('cartSummaryDetails');
        if (!summaryDiv) {
            summaryDiv = document.createElement('div');
            summaryDiv.id = 'cartSummaryDetails';
            summaryDiv.style.cssText = 'margin-bottom: 15px; padding: 12px; background: #f8fafc; border-radius: 12px;';
            const totalRow = cartFooter.querySelector('.total-row');
            if (totalRow) {
                cartFooter.insertBefore(summaryDiv, totalRow);
            }
        }

        summaryDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px;">
                <span style="color: #64748b;">Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${ahorro > 0 ? `
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px; color: #10b981;">
                    <span><i class="fas fa-tags"></i> Descuentos:</span>
                    <span>-$${ahorro.toFixed(2)}</span>
                </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px;">
                <span style="color: #64748b;">Envío:</span>
                <span style="color: #10b981;">Gratis</span>
            </div>
            <div style="border-top: 1px dashed #cbd5e1; margin: 8px 0;"></div>
            <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1rem;">
                <span>Total a pagar:</span>
                <span style="color: #2563eb;">$${total.toFixed(2)}</span>
            </div>
        `;
    },

    updateCartQuantity: function (id, delta) {
        const item = this.cart.find(i => i.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.cart = this.cart.filter(i => i.id !== id);
            }
            this.saveCart();
            this.updateCartUI();
            this.showToast("Carrito actualizado");
        }
    },

    removeFromCart: function (id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartUI();
        this.showToast("Producto eliminado del carrito");
    },

    // ========================================
    // CHECKOUT
    // ========================================
    checkout: function () {
        if (this.cart.length === 0) {
            this.showToast("Tu carrito está vacío", "error");
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);

        alert(`✅ ¡Gracias por tu compra!\n\n📦 Productos: ${itemCount} unidades\n💰 Total: $${total.toFixed(2)}\n\n📧 Te enviaremos la confirmación a tu correo.\n🇳🇮 ¡Gracias por apoyar productos nicaragüenses!`);

        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.toggleCart();
        this.showToast("🎉 Pedido realizado exitosamente");
    },

    // ========================================
    // UI
    // ========================================
    toggleCart: function () {
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('overlay');
        if (cartSidebar) cartSidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
    },

    // ========================================
    // LIMPIEZA
    // ========================================
    destroy: function () {
        console.log('Marketplace: Destruido');
        this.cart = [];
        this.selectedQuantities = {};
    }
};

// ========================================
// EXPONER FUNCIONES GLOBALES
// ========================================
window.filterByCategory = (cat) => window.marketplace?.filterByCategory(cat);
window.updateQuantity = (id, delta) => window.marketplace?.updateQuantity(id, delta);
window.addToCart = (id) => window.marketplace?.addToCart(id);
window.updateCartQuantity = (id, delta) => window.marketplace?.updateCartQuantity(id, delta);
window.removeFromCart = (id) => window.marketplace?.removeFromCart(id);
window.toggleCart = () => window.marketplace?.toggleCart();
window.checkout = () => window.marketplace?.checkout();