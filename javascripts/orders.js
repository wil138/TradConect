// orders.js - Versión SPA
window.orders = {
    ordersData: [
    {
        "id": "ORD-9901",
        "client": "Distribuidora La Universal",
        "initial": "DU",
        "date": "24 Feb, 2024",
        "items": 48,
        "total": 2684.22,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9902",
        "client": "Distribuidora La Universal",
        "initial": "DU",
        "date": "22 Oct, 2024",
        "items": 52,
        "total": 3699.42,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9903",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "24 Oct, 2024",
        "items": 40,
        "total": 2835.84,
        "status": "Enviado"
    },
    {
        "id": "ORD-9904",
        "client": "Ferretería El Martillo",
        "initial": "FE",
        "date": "25 Jan, 2024",
        "items": 15,
        "total": 1997.38,
        "status": "Entregado"
    },
    {
        "id": "ORD-9905",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "18 Sep, 2024",
        "items": 39,
        "total": 3563.73,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9906",
        "client": "Distribuidora La Universal",
        "initial": "DU",
        "date": "09 Jun, 2024",
        "items": 18,
        "total": 1351.51,
        "status": "Entregado"
    },
    {
        "id": "ORD-9907",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "05 Sep, 2024",
        "items": 22,
        "total": 1489.46,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9908",
        "client": "Ingeniería Masaya",
        "initial": "IM",
        "date": "15 Mar, 2024",
        "items": 59,
        "total": 7418.33,
        "status": "Enviado"
    },
    {
        "id": "ORD-9909",
        "client": "Construcciones Modernas",
        "initial": "CM",
        "date": "01 Sep, 2024",
        "items": 50,
        "total": 6774.24,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9910",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "06 Nov, 2024",
        "items": 7,
        "total": 548.77,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9911",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "21 Jun, 2024",
        "items": 12,
        "total": 1184.29,
        "status": "Entregado"
    },
    {
        "id": "ORD-9912",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "14 Oct, 2024",
        "items": 31,
        "total": 3171.25,
        "status": "Enviado"
    },
    {
        "id": "ORD-9913",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "21 Mar, 2025",
        "items": 6,
        "total": 760.54,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9914",
        "client": "Agropecuaria Central",
        "initial": "AG",
        "date": "05 Jan, 2025",
        "items": 43,
        "total": 2299.94,
        "status": "Entregado"
    },
    {
        "id": "ORD-9915",
        "client": "Soluciones Industriales",
        "initial": "SI",
        "date": "26 Nov, 2024",
        "items": 15,
        "total": 1023.38,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9916",
        "client": "Suministros León",
        "initial": "SU",
        "date": "10 Oct, 2024",
        "items": 54,
        "total": 6545.4,
        "status": "Entregado"
    },
    {
        "id": "ORD-9917",
        "client": "Construcciones Modernas",
        "initial": "CM",
        "date": "08 Jan, 2025",
        "items": 11,
        "total": 1377.31,
        "status": "Enviado"
    },
    {
        "id": "ORD-9918",
        "client": "Agropecuaria Central",
        "initial": "AG",
        "date": "25 Feb, 2025",
        "items": 11,
        "total": 1131.6,
        "status": "Enviado"
    },
    {
        "id": "ORD-9919",
        "client": "Construcciones Modernas",
        "initial": "CM",
        "date": "18 Oct, 2024",
        "items": 10,
        "total": 563.87,
        "status": "Enviado"
    },
    {
        "id": "ORD-9920",
        "client": "Soluciones Industriales",
        "initial": "SI",
        "date": "21 Dec, 2024",
        "items": 19,
        "total": 1622.18,
        "status": "Enviado"
    },
    {
        "id": "ORD-9921",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "04 Feb, 2025",
        "items": 18,
        "total": 1306.22,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9922",
        "client": "Distribuidora La Universal",
        "initial": "DU",
        "date": "30 Aug, 2024",
        "items": 10,
        "total": 669.35,
        "status": "Enviado"
    },
    {
        "id": "ORD-9923",
        "client": "Ingeniería Masaya",
        "initial": "IM",
        "date": "11 Feb, 2025",
        "items": 25,
        "total": 1462.72,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9924",
        "client": "Construcciones Modernas",
        "initial": "CM",
        "date": "25 Aug, 2024",
        "items": 16,
        "total": 1123.93,
        "status": "Enviado"
    },
    {
        "id": "ORD-9925",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "22 Sep, 2024",
        "items": 34,
        "total": 3454.55,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9926",
        "client": "Ferretería El Martillo",
        "initial": "FE",
        "date": "11 Feb, 2025",
        "items": 12,
        "total": 618.1,
        "status": "Enviado"
    },
    {
        "id": "ORD-9927",
        "client": "Ingeniería Masaya",
        "initial": "IM",
        "date": "31 Mar, 2025",
        "items": 20,
        "total": 2292.27,
        "status": "Enviado"
    },
    {
        "id": "ORD-9928",
        "client": "Distribuidora La Universal",
        "initial": "DU",
        "date": "11 Dec, 2024",
        "items": 14,
        "total": 1398.48,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9929",
        "client": "Suministros León",
        "initial": "SU",
        "date": "08 Jan, 2025",
        "items": 56,
        "total": 2899.64,
        "status": "Entregado"
    },
    {
        "id": "ORD-9930",
        "client": "Ingeniería Masaya",
        "initial": "IM",
        "date": "10 Nov, 2024",
        "items": 37,
        "total": 4736.06,
        "status": "Entregado"
    },
    {
        "id": "ORD-9931",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "26 Jan, 2024",
        "items": 51,
        "total": 3251.34,
        "status": "Entregado"
    },
    {
        "id": "ORD-9932",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "25 Feb, 2024",
        "items": 56,
        "total": 6368.94,
        "status": "Entregado"
    },
    {
        "id": "ORD-9933",
        "client": "Distribuidora La Universal",
        "initial": "DU",
        "date": "08 Mar, 2025",
        "items": 27,
        "total": 2005.42,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9934",
        "client": "Agropecuaria Central",
        "initial": "AG",
        "date": "05 Sep, 2024",
        "items": 14,
        "total": 991.08,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9935",
        "client": "Ferretería El Martillo",
        "initial": "FE",
        "date": "27 Mar, 2024",
        "items": 9,
        "total": 1138.63,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9936",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "29 Jan, 2024",
        "items": 50,
        "total": 3338.64,
        "status": "Entregado"
    },
    {
        "id": "ORD-9937",
        "client": "Suministros León",
        "initial": "SU",
        "date": "14 Aug, 2024",
        "items": 19,
        "total": 1576.94,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9938",
        "client": "Soluciones Industriales",
        "initial": "SI",
        "date": "06 Feb, 2024",
        "items": 33,
        "total": 3672.19,
        "status": "Enviado"
    },
    {
        "id": "ORD-9939",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "23 Mar, 2024",
        "items": 57,
        "total": 3253.97,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9940",
        "client": "Ingeniería Masaya",
        "initial": "IM",
        "date": "18 Aug, 2024",
        "items": 14,
        "total": 1780.88,
        "status": "Entregado"
    },
    {
        "id": "ORD-9941",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "18 Feb, 2025",
        "items": 55,
        "total": 6216.9,
        "status": "Entregado"
    },
    {
        "id": "ORD-9942",
        "client": "Suministros León",
        "initial": "SU",
        "date": "20 May, 2024",
        "items": 50,
        "total": 5856.24,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9943",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "28 Apr, 2024",
        "items": 36,
        "total": 3843.06,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9944",
        "client": "Distribuidora La Universal",
        "initial": "DU",
        "date": "16 Apr, 2025",
        "items": 5,
        "total": 513.88,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9945",
        "client": "Ferretería El Martillo",
        "initial": "FE",
        "date": "02 Jan, 2025",
        "items": 10,
        "total": 1389.4,
        "status": "Entregado"
    },
    {
        "id": "ORD-9946",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "27 Apr, 2024",
        "items": 6,
        "total": 818.84,
        "status": "Enviado"
    },
    {
        "id": "ORD-9947",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "16 Feb, 2025",
        "items": 49,
        "total": 6129.79,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9948",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "26 Mar, 2024",
        "items": 26,
        "total": 3490.39,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9949",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "11 May, 2025",
        "items": 47,
        "total": 3846.6,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9950",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "13 Dec, 2024",
        "items": 8,
        "total": 734.24,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9951",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "09 Oct, 2024",
        "items": 33,
        "total": 2729.95,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9952",
        "client": "Suministros León",
        "initial": "SU",
        "date": "08 Feb, 2025",
        "items": 5,
        "total": 482.88,
        "status": "Enviado"
    },
    {
        "id": "ORD-9953",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "17 Jan, 2024",
        "items": 20,
        "total": 2131.1,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9954",
        "client": "Ingeniería Masaya",
        "initial": "IM",
        "date": "01 May, 2025",
        "items": 40,
        "total": 4416.68,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9955",
        "client": "Ferretería El Martillo",
        "initial": "FE",
        "date": "24 Mar, 2024",
        "items": 6,
        "total": 676.47,
        "status": "Entregado"
    },
    {
        "id": "ORD-9956",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "18 Jan, 2024",
        "items": 32,
        "total": 4774.38,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9957",
        "client": "Distribuidora La Universal",
        "initial": "DU",
        "date": "10 Mar, 2024",
        "items": 32,
        "total": 2075.45,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9958",
        "client": "Distribuidora La Universal",
        "initial": "DU",
        "date": "08 Feb, 2024",
        "items": 28,
        "total": 2036.61,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9959",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "31 Mar, 2025",
        "items": 22,
        "total": 2118.06,
        "status": "Entregado"
    },
    {
        "id": "ORD-9960",
        "client": "Ingeniería Masaya",
        "initial": "IM",
        "date": "08 Dec, 2024",
        "items": 34,
        "total": 4505.87,
        "status": "Entregado"
    },
    {
        "id": "ORD-9961",
        "client": "Construcciones Modernas",
        "initial": "CM",
        "date": "21 Feb, 2025",
        "items": 5,
        "total": 503.3,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9962",
        "client": "Suministros León",
        "initial": "SU",
        "date": "26 May, 2024",
        "items": 33,
        "total": 4032.99,
        "status": "Entregado"
    },
    {
        "id": "ORD-9963",
        "client": "Agropecuaria Central",
        "initial": "AG",
        "date": "17 Feb, 2025",
        "items": 38,
        "total": 3118.7,
        "status": "Enviado"
    },
    {
        "id": "ORD-9964",
        "client": "Construcciones Modernas",
        "initial": "CM",
        "date": "23 Dec, 2024",
        "items": 52,
        "total": 2767.94,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9965",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "19 Sep, 2024",
        "items": 28,
        "total": 3569.37,
        "status": "Enviado"
    },
    {
        "id": "ORD-9966",
        "client": "Agropecuaria Central",
        "initial": "AG",
        "date": "04 Feb, 2024",
        "items": 7,
        "total": 714.66,
        "status": "Entregado"
    },
    {
        "id": "ORD-9967",
        "client": "Distribuidora La Universal",
        "initial": "DU",
        "date": "18 Apr, 2025",
        "items": 30,
        "total": 3007.62,
        "status": "Enviado"
    },
    {
        "id": "ORD-9968",
        "client": "Suministros León",
        "initial": "SU",
        "date": "12 Nov, 2024",
        "items": 30,
        "total": 3898.54,
        "status": "Entregado"
    },
    {
        "id": "ORD-9969",
        "client": "Ferretería El Martillo",
        "initial": "FE",
        "date": "20 Jan, 2025",
        "items": 22,
        "total": 1356.14,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9970",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "03 Jan, 2025",
        "items": 26,
        "total": 3294.48,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9971",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "01 Nov, 2024",
        "items": 6,
        "total": 498.97,
        "status": "Entregado"
    },
    {
        "id": "ORD-9972",
        "client": "Agropecuaria Central",
        "initial": "AG",
        "date": "05 Apr, 2025",
        "items": 35,
        "total": 2805.04,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9973",
        "client": "Construcciones Modernas",
        "initial": "CM",
        "date": "07 Mar, 2025",
        "items": 20,
        "total": 2669.37,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9974",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "03 Feb, 2024",
        "items": 15,
        "total": 1695.07,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9975",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "11 May, 2024",
        "items": 8,
        "total": 898.44,
        "status": "Entregado"
    },
    {
        "id": "ORD-9976",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "19 Dec, 2024",
        "items": 42,
        "total": 2102.39,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9977",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "29 Sep, 2024",
        "items": 19,
        "total": 2150.04,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9978",
        "client": "Construcciones Modernas",
        "initial": "CM",
        "date": "17 May, 2024",
        "items": 31,
        "total": 4480.66,
        "status": "Entregado"
    },
    {
        "id": "ORD-9979",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "17 Mar, 2024",
        "items": 47,
        "total": 5046.92,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9980",
        "client": "Suministros León",
        "initial": "SU",
        "date": "05 Feb, 2025",
        "items": 28,
        "total": 3750.2,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9981",
        "client": "Ferretería El Martillo",
        "initial": "FE",
        "date": "11 Feb, 2025",
        "items": 32,
        "total": 3430.63,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9982",
        "client": "Agropecuaria Central",
        "initial": "AG",
        "date": "23 May, 2024",
        "items": 60,
        "total": 8742.6,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9983",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "18 Aug, 2024",
        "items": 12,
        "total": 913.36,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9984",
        "client": "Ingeniería Masaya",
        "initial": "IM",
        "date": "04 May, 2024",
        "items": 50,
        "total": 5680.16,
        "status": "Entregado"
    },
    {
        "id": "ORD-9985",
        "client": "Ingeniería Masaya",
        "initial": "IM",
        "date": "18 Mar, 2025",
        "items": 6,
        "total": 478.7,
        "status": "Enviado"
    },
    {
        "id": "ORD-9986",
        "client": "Agropecuaria Central",
        "initial": "AG",
        "date": "05 Apr, 2024",
        "items": 19,
        "total": 1390.8,
        "status": "Entregado"
    },
    {
        "id": "ORD-9987",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "01 Apr, 2025",
        "items": 58,
        "total": 6003.9,
        "status": "Entregado"
    },
    {
        "id": "ORD-9988",
        "client": "Ingeniería Masaya",
        "initial": "IM",
        "date": "04 Oct, 2024",
        "items": 37,
        "total": 4771.56,
        "status": "Entregado"
    },
    {
        "id": "ORD-9989",
        "client": "Distribuidora La Universal",
        "initial": "DU",
        "date": "01 Sep, 2024",
        "items": 27,
        "total": 1572.71,
        "status": "Enviado"
    },
    {
        "id": "ORD-9990",
        "client": "Ferretería El Martillo",
        "initial": "FE",
        "date": "02 Oct, 2024",
        "items": 31,
        "total": 1673.59,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9991",
        "client": "Agropecuaria Central",
        "initial": "AG",
        "date": "18 Mar, 2025",
        "items": 45,
        "total": 6145.31,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9992",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "23 Jan, 2024",
        "items": 41,
        "total": 4767.24,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9993",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "11 Jan, 2025",
        "items": 20,
        "total": 1879.29,
        "status": "Entregado"
    },
    {
        "id": "ORD-9994",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "09 Sep, 2024",
        "items": 48,
        "total": 6600.14,
        "status": "Enviado"
    },
    {
        "id": "ORD-9995",
        "client": "Constructora Norte",
        "initial": "CO",
        "date": "22 Jan, 2024",
        "items": 37,
        "total": 2087.9,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9996",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "07 Dec, 2024",
        "items": 20,
        "total": 2570.84,
        "status": "Pendiente"
    },
    {
        "id": "ORD-9997",
        "client": "Suministros León",
        "initial": "SU",
        "date": "20 Feb, 2024",
        "items": 52,
        "total": 6881.79,
        "status": "Enviado"
    },
    {
        "id": "ORD-9998",
        "client": "Materiales del Pacífico",
        "initial": "MP",
        "date": "13 Feb, 2025",
        "items": 51,
        "total": 5185.05,
        "status": "Cancelado"
    },
    {
        "id": "ORD-9999",
        "client": "Soluciones Industriales",
        "initial": "SI",
        "date": "28 Apr, 2025",
        "items": 44,
        "total": 5399.68,
        "status": "Cancelado"
    },
    {
        "id": "ORD-10000",
        "client": "Ferretería La Grapadora",
        "initial": "FG",
        "date": "28 Jan, 2025",
        "items": 42,
        "total": 2779.31,
        "status": "Cancelado"
    }
],

    
    currentFilter: 'todos',
    
    init: function() {
        console.log("Orders: Inicializando");
        this.renderOrders();
        this.setupEvents();
    },
    
    renderOrders: function() {
        const tableBody = document.getElementById('orders-table-body');
        if (!tableBody) return;
        
        const filtered = this.currentFilter === 'todos' 
            ? this.ordersData 
            : this.ordersData.filter(order => order.status === this.currentFilter);
        
        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6"><div class="empty-state">No hay pedidos</div></td></tr>`;
            return;
        }
        
        tableBody.innerHTML = filtered.map(order => {
            const statusClass = `badge-${order.status.toLowerCase()}`;
            return `
                <tr>
                    <td><a href="#" class="order-id">${order.id}</a></td>
                    <td><div class="client-info"><div class="avatar-circle">${order.initial}</div><span>${order.client}</span></div></td>
                    <td>${order.date}</td>
                    <td class="items-count">${order.items}</td>
                    <td class="price-cell">$${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td><span class="badge ${statusClass}">${order.status}</span></td>
                </tr>
            `;
        }).join('');
    },
    
    filterOrders: function(filter) {
        this.currentFilter = filter;
        this.renderOrders();
    },
    
    setupEvents: function() {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filterValue = button.getAttribute('data-filter');
                this.filterOrders(filterValue);
            });
        });
    }
};