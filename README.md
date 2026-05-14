# Sistema de Gestión de Alumnos - Backend 🚀

Este es el backend del sistema de gestión de alumnos, desarrollado con **Java 17/21** y **Spring Boot 3**. La aplicación permite gestionar usuarios, alumnos, modalidades, proyectos y asistencias de forma centralizada.

## 🛠️ Tecnologías y Herramientas

* **Lenguaje:** Java 21
* **Framework:** Spring Boot 3.2.5
* **Gestión de Dependencias:** Maven
* **Base de Datos:** MySQL / MariaDB (Local)
* **Persistencia:** Spring Data JPA con Hibernate
* **Mapeo de Objetos (DTOs):** MapStruct (para una separación limpia entre entidades y datos de salida)
* **Productividad:** Lombok (para reducir código repetitivo)
* **Seguridad:** Spring Security (Configurado para permitir acceso total en desarrollo)

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
1.  **JDK 21** o superior.
2.  **Maven** 3.8+.
3.  **MySQL** o **XAMPP** (MariaDB) corriendo localmente.

## 🚀 Configuración e Instalación

### 1. Base de Datos
1.  Abre tu gestor de base de datos (phpMyAdmin, MySQL Workbench, etc.).
2.  Crea una base de datos llamada `gestion_alumnos`.
3.  Ejecuta el script SQL de creación de tablas e inserción de datos que se encuentra en la carpeta.
> **Nota:** El proyecto cuenta con un **Trigger** en la tabla `asignaciones` para controlar que no se supere el cupo máximo de alumnos por proyecto.

### 2. Configuración del Proyecto
Edita el archivo `src/main/resources/application.properties` con tus credenciales locales:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/gestion_alumnos
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
# Importante para MariaDB
spring.jpa.database-platform=org.hibernate.dialect.MariaDBDialect
spring.jpa.hibernate.ddl-auto=none

# Sistema de Gestión de Alumnos - Frontend 🚀

## **Ionic Framework** 7+
## **Angular** 17+
## **TypeScript**