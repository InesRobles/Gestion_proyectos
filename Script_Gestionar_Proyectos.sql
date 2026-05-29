CREATE DATABASE IF NOT EXISTS gestion_alumnos;

USE gestion_alumnos;

-- Desactivar revisión de llaves foráneas temporalmente para limpieza
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS horario;
DROP TABLE IF EXISTS asistencia;
DROP TABLE IF EXISTS registro_actividad;
DROP TABLE IF EXISTS comentario;
DROP TABLE IF EXISTS asignacion;
DROP TABLE IF EXISTS proyecto_documento;
DROP TABLE IF EXISTS proyecto_imagen;
DROP TABLE IF EXISTS proyecto;
DROP TABLE IF EXISTS tarea_completada;
DROP TABLE IF EXISTS tarea_proyecto;
DROP TABLE IF EXISTS alumno;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS modalidad;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================
-- 1. TABLA USUARIOS
-- =========================================
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('alumno', 'admin')),
    nombre_real VARCHAR(100) NOT NULL,
    foto_usuario LONGTEXT DEFAULT NULL
);

-- =========================================
-- 2. TABLA MODALIDADES
-- =========================================
CREATE TABLE IF NOT EXISTS modalidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- =========================================
-- 3. TABLA ALUMNOS
-- =========================================
CREATE TABLE IF NOT EXISTS alumno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE,
    modalidad_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (modalidad_id) REFERENCES modalidad(id)
);

-- =========================================
-- 4. TABLA PROYECTOS
-- =========================================
CREATE TABLE IF NOT EXISTS proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'en curso' CHECK (estado IN ('en curso', 'finalizado', 'pausado')),
    foto_proyecto LONGTEXT DEFAULT NULL,
    video_url VARCHAR(500) DEFAULT NULL,
    creador_id INT NULL,
    enlace_github VARCHAR(255) DEFAULT NULL,
    memoria LONGTEXT DEFAULT NULL,
    privado TINYINT(1) DEFAULT 0,
    FOREIGN KEY (creador_id) REFERENCES usuario(id) ON DELETE SET NULL
);

-- =========================================
-- 5. TABLA ASIGNACIONES
-- =========================================
CREATE TABLE IF NOT EXISTS asignacion (
    alumno_id INT,
    proyecto_id INT,
    rol VARCHAR(20) NOT NULL DEFAULT 'lector' CHECK (rol IN ('editor', 'lector')),
    PRIMARY KEY (alumno_id, proyecto_id),
    FOREIGN KEY (alumno_id) REFERENCES alumno(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyecto(id) ON DELETE CASCADE
);

-- =========================================
-- 6. TABLA COMENTARIOS
-- =========================================
CREATE TABLE IF NOT EXISTS comentario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT,
    usuario_id INT,
    texto VARCHAR(500) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyecto(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- =========================================
-- TABLA TAREAS DE PROYECTO
-- =========================================
CREATE TABLE IF NOT EXISTS tarea_proyecto (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id  INT NOT NULL,
    titulo       VARCHAR(200) NOT NULL,
    orden        INT NOT NULL DEFAULT 0,
    FOREIGN KEY (proyecto_id) REFERENCES proyecto(id) ON DELETE CASCADE
);

-- =========================================
-- TABLA PROGRESO ALUMNO POR TAREA
-- =========================================
CREATE TABLE IF NOT EXISTS tarea_completada (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id  INT NOT NULL,
    alumno_id INT NOT NULL,
    completada TINYINT(1) NOT NULL DEFAULT 0,
    UNIQUE KEY uq_tarea_alumno (tarea_id, alumno_id),
    FOREIGN KEY (tarea_id)  REFERENCES tarea_proyecto(id) ON DELETE CASCADE,
    FOREIGN KEY (alumno_id) REFERENCES alumno(id)         ON DELETE CASCADE
);

-- =========================================
-- TABLAS AUXILIARES DE RECURSOS DE PROYECTO
-- =========================================
CREATE TABLE IF NOT EXISTS proyecto_documento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    contenido LONGTEXT NOT NULL,
    FOREIGN KEY (proyecto_id) REFERENCES proyecto(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS proyecto_imagen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    contenido LONGTEXT NOT NULL,
    FOREIGN KEY (proyecto_id) REFERENCES proyecto(id) ON DELETE CASCADE
);

-- =========================================
-- INSERCIÓN DE DATOS
-- =========================================
INSERT IGNORE INTO modalidad (nombre) VALUES ('Presencial'), ('Online'), ('Semipresencial');

-- 11 alumnos (contraseña: 123456)
INSERT IGNORE INTO usuario (nombre_usuario, contrasena_hash, rol, nombre_real) VALUES
('maria_garcia',  '$2a$10$yqg771C40ZfV3gK1y4bTme4zK1v9rB2lqTzU1o1.y7V1tO1hV.yqO', 'alumno',        'María García'),
('carlos_ruiz',   '$2a$10$yqg771C40ZfV3gK1y4bTme4zK1v9rB2lqTzU1o1.y7V1tO1hV.yqO', 'alumno',        'Carlos Ruiz'),
('ana_perez',     '$2a$10$yqg771C40ZfV3gK1y4bTme4zK1v9rB2lqTzU1o1.y7V1tO1hV.yqO', 'alumno',        'Ana Pérez'),
('luis_mendoza',  '$2a$10$yqg771C40ZfV3gK1y4bTme4zK1v9rB2lqTzU1o1.y7V1tO1hV.yqO', 'alumno',        'Luis Mendoza'),
('sofia_torres',  '$2a$10$yqg771C40ZfV3gK1y4bTme4zK1v9rB2lqTzU1o1.y7V1tO1hV.yqO', 'alumno',        'Sofía Torres'),
('miguel_castro', '$2a$10$yqg771C40ZfV3gK1y4bTme4zK1v9rB2lqTzU1o1.y7V1tO1hV.yqO', 'alumno',        'Miguel Castro'),
('laura_jimenez', '$2a$10$yqg771C40ZfV3gK1y4bTme4zK1v9rB2lqTzU1o1.y7V1tO1hV.yqO', 'alumno',        'Laura Jiménez'),
('pablo_moreno',  '$2a$10$yqg771C40ZfV3gK1y4bTme4zK1v9rB2lqTzU1o1.y7V1tO1hV.yqO', 'alumno',        'Pablo Moreno'),
('elena_navarro', '$2a$10$yqg771C40ZfV3gK1y4bTme4zK1v9rB2lqTzU1o1.y7V1tO1hV.yqO', 'alumno',        'Elena Navarro'),
('david_romero',  '$2a$10$yqg771C40ZfV3gK1y4bTme4zK1v9rB2lqTzU1o1.y7V1tO1hV.yqO', 'alumno',        'David Romero'),
('clara_santos',  '$2a$10$yqg771C40ZfV3gK1y4bTme4zK1v9rB2lqTzU1o1.y7V1tO1hV.yqO', 'alumno',        'Clara Santos');

-- alumno.usuario_id apunta a usuarios 1-11 → alumno_id 1-11
INSERT IGNORE INTO alumno (usuario_id, modalidad_id) VALUES
(1,  1),   -- alumno_id 1  → María       Presencial
(2,  2),   -- alumno_id 2  → Carlos      Online
(3,  1),   -- alumno_id 3  → Ana         Presencial
(4,  3),   -- alumno_id 4  → Luis        Semipresencial
(5,  2),   -- alumno_id 5  → Sofía       Online
(6,  1),   -- alumno_id 6  → Miguel      Presencial
(7,  3),   -- alumno_id 7  → Laura       Semipresencial
(8,  2),   -- alumno_id 8  → Pablo       Online
(9,  1),   -- alumno_id 9  → Elena       Presencial
(10, 3),   -- alumno_id 10 → David       Semipresencial
(11, 2);   -- alumno_id 11 → Clara       Online
