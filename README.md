# Pedimento de Órdenes de Venta -- Aplicación Web

Aplicación desarrollada como **prueba técnica de desarrollo web para InfoFast** cuyo
objetivo es construir una interfaz que permita generar pedidos de venta
consumiendo información desde servicios web externos.

La aplicación pretende evaluar habilidades en:

-   Desarrollo Frontend
-   Consumo de APIs
-   Validación de formularios
-   Manipulación dinámica del DOM
-   Desarrollo Backend
-   Persistencia de datos en base de datos

------------------------------------------------------------------------
![Portada app](images/Interfaz_app.png)


# Descripción general

La aplicación permite crear un **pedimento de orden de venta** mediante
un formulario web donde el usuario puede:

-   Seleccionar un cliente desde un servicio web
-   Seleccionar una fecha y hora de entrega
-   Agregar múltiples productos dinámicamente
-   Definir cantidades
-   Calcular subtotales y totales automáticamente
-   Guardar el pedido en una base de datos

Los datos de clientes y productos se obtienen desde un **servicio web
externo autenticado**.

------------------------------------------------------------------------

# Arquitectura del sistema

La solución se divide en tres capas principales.

## 1. Frontend

Desarrollado con:

-   HTML5
-   CSS3
-   JavaScript

Responsabilidades:

-   Renderizar la interfaz
-   Manejar la interacción del usuario
-   Validar el formulario
-   Agregar/eliminar productos dinámicamente
-   Calcular subtotales y total
-   Enviar el pedido al backend

Biblioteca utilizada:

-   **Flatpickr** para el selector de fecha y hora.

------------------------------------------------------------------------

## 2. Backend

Implementado con **PHP**.

Funciones:

-   Consumir servicios web externos
-   Proteger credenciales mediante endpoints proxy
-   Recibir pedidos del frontend
-   Guardar pedidos en base de datos

Endpoints:

    api/proxy_clientes.php
    api/proxy_productos.php
    api/guardar_pedido.php

Los proxies permiten evitar exponer credenciales del servicio en el
frontend.

------------------------------------------------------------------------

## 3. Base de datos

Se utiliza **SQLite** por simplicidad de configuración.
Ya que la base de datos es un ejercicio sencillo.

### Tabla pedidos

  Campo            Tipo
  ---------------- ---------
  id               INTEGER
  cliente_id       TEXT
  cliente_nombre   TEXT
  fecha_entrega    TEXT
  total            REAL

### Tabla pedido_detalle

  Campo             Tipo
  ----------------- ---------
  id                INTEGER
  pedido_id         INTEGER
  producto_id       TEXT
  producto_nombre   TEXT
  cantidad          INTEGER
  precio_unitario   REAL

------------------------------------------------------------------------

# Estructura del proyecto

    pedido-ventas/
    │
    ├── index.php
    ├── style.css
    ├── app.js
    │
    ├── api/
    │   ├── proxy_clientes.php
    │   ├── proxy_productos.php
    │   └── guardar_pedido.php
    │
    ├── db.php
    ├── init_db.php
    │
    └── pedidos.db

------------------------------------------------------------------------

# Servicios Web Consumidos

La aplicación consume dos endpoints proporcionados.

### Clientes

POST\
https://www.infofast.com.mx/Erick/service/clientes/

### Productos

POST\
https://www.infofast.com.mx/Erick/service/productos/

------------------------------------------------------------------------

# Autenticación del servicio

Las peticiones requieren enviar credenciales en el body:

    user = user_pruebas
    pwd = Pru3B@5.

Formato requerido:

    application/x-www-form-urlencoded

------------------------------------------------------------------------

# Ejemplo de petición usando Postman

Configuración:

**Método**

POST

**URL**

https://www.infofast.com.mx/Erick/service/clientes/

**Body**

x-www-form-urlencoded

  KEY    VALUE
  ------ --------------
  user   user_pruebas
  pwd    Pru3B@5.

Respuesta del servicio:

    [
      {
        "id_cliente": "1170",
        "nombre": "YADI"
      }
    ]

------------------------------------------------------------------------

# Funcionalidades implementadas

✔ Consulta de clientes desde servicio web\
✔ Consulta de productos desde servicio web\
✔ Selector de fecha y hora con calendario\
✔ Agregar múltiples productos dinámicamente\
✔ Eliminación dinámica de productos\
✔ Cálculo automático de subtotales\
✔ Cálculo automático de total\
✔ Validación del formulario\
✔ Registro del pedido en base de datos\
✔ Confirmación visual al usuario

------------------------------------------------------------------------

# Validaciones implementadas

Antes de guardar el pedido se valida que:

-   Se haya seleccionado un cliente
-   Se haya seleccionado una fecha
-   La fecha sea mayor a la fecha actual
-   Se haya agregado al menos un producto
-   La cantidad sea mayor a 0

------------------------------------------------------------------------

# Flujo de funcionamiento

1.  La aplicación carga en el navegador.
2.  Se consumen los servicios de clientes y productos.
3.  El usuario selecciona cliente y fecha de entrega.
4.  Se agregan productos al pedido.
5.  El sistema calcula subtotales y total.
6.  El pedido se envía al backend.
7.  El backend guarda la información en SQLite.
8.  Se muestra confirmación al usuario.

------------------------------------------------------------------------

# Tecnologías utilizadas

Frontend

-   HTML5
-   CSS3
-   JavaScript

Bibliotecas

-   Flatpickr

Backend

-   PHP

Base de datos

-   SQLite

Herramientas

-   Postman
-   VS Code

------------------------------------------------------------------------

# Cómo ejecutar el proyecto

## 1. Crear la base de datos

    php init_db.php

Esto generará el archivo:

    pedidos.db

------------------------------------------------------------------------

## 2. Iniciar servidor local

Desde la carpeta del proyecto:

    php -S localhost:8000

------------------------------------------------------------------------

## 3. Abrir la aplicación

En el navegador:

    http://localhost:8000

------------------------------------------------------------------------

# Mejoras futuras

-   Implementar autenticación de usuarios
-   Agregar historial de pedidos
-   Implementar paginación de productos
-   Migrar backend a framework (Laravel / Node)
-   Implementar API REST para pedidos

------------------------------------------------------------------------
## Evidencia de consumo del API

![Postman Clientes](images/Interfaz_clientes.png)
![Postman Productos](images/Interfaz_productos.png)


------------------------------------------------------------------------
# Autor

Kaleb Torres