-- Desactivar revisión de llaves foráneas temporalmente para limpieza
SET FOREIGN_KEY_CHECKS = 0;

-- Borrado de tablas previas para ejecución limpia
DROP TABLE IF EXISTS asistencia, horario, comentario, asignacione, proyecto, alumno, modalidad, usuario;

-- Activar revisión de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================
-- 1. TABLA USUARIOS
-- =========================================
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('alumno', 'administrador')),
    nombre_real VARCHAR(100) NOT NULL
);

-- =========================================
-- 2. TABLA MODALIDADES
-- =========================================
CREATE TABLE modalidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- =========================================
-- 3. TABLA ALUMNOS
-- =========================================
CREATE TABLE alumno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE,
    modalidad_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (modalidad_id) REFERENCES modalidad(id)
);

-- =========================================
-- 4. TABLA PROYECTOS
-- =========================================
CREATE TABLE proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    cupo_maximo INT DEFAULT 5 NOT NULL,
    estado VARCHAR(20) DEFAULT 'en curso' CHECK (estado IN ('en curso', 'finalizado', 'pausado'))
);

-- =========================================
-- 5. TABLA ASIGNACIONES
-- =========================================
CREATE TABLE asignacion (
    alumno_id INT,
    proyecto_id INT,
    PRIMARY KEY (alumno_id, proyecto_id),
    FOREIGN KEY (alumno_id) REFERENCES alumno(id),
    FOREIGN KEY (proyecto_id) REFERENCES proyecto(id)
);

-- =========================================
-- 6. TRIGGER CUPOS PROYECTOS
-- =========================================
DELIMITER //
CREATE TRIGGER evitar_exceso_cupo
BEFORE INSERT ON asignacion
FOR EACH ROW
BEGIN
    DECLARE v_total INT;
    DECLARE v_cupo INT;
    SELECT COUNT(*) INTO v_total FROM asignacion WHERE proyecto_id = NEW.proyecto_id;
    SELECT cupo_maximo INTO v_cupo FROM proyecto WHERE id = NEW.proyecto_id;
    IF v_total >= v_cupo THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El proyecto ha alcanzado su límite de alumnos';
    END IF;
END//
DELIMITER ;

-- =========================================
-- 7. TABLA COMENTARIOS
-- =========================================
CREATE TABLE comentario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT,
    usuario_id INT,
    texto VARCHAR(500) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyecto(id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- =========================================
-- 8. TABLA HORARIOS
-- =========================================
CREATE TABLE horario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT,
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,
    FOREIGN KEY (alumno_id) REFERENCES alumno(id)
);

-- =========================================
-- 9. TABLA ASISTENCIA
-- =========================================
CREATE TABLE asistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT,
    fecha DATE DEFAULT (CURRENT_DATE),
    presente TINYINT(1) DEFAULT 0,
    FOREIGN KEY (alumno_id) REFERENCES alumno(id)
);

-- =========================================
-- INSERCIÓN DE DATOS
-- =========================================

INSERT INTO modalidad (nombre) VALUES ('Presencial'), ('Online'), ('Semipresencial');

INSERT INTO usuario (nombre_usuario, contrasena_hash, rol, nombre_real) VALUES 
('admin_jose', 'hash_secure_123', 'administrador', 'José Rodríguez'),
('maria_garcia', 'hash_student_99', 'alumno', 'María García'),
('carlos_ruiz', 'hash_student_88', 'alumno', 'Carlos Ruiz'),
('ana_perez', 'hash_student_77', 'alumno', 'Ana Pérez'),
('luis_mendoza', 'hash_student_66', 'alumno', 'Luis Mendoza');

-- Alumnos (IDs 2 al 5 de usuarios son alumnos)
INSERT INTO alumno (usuario_id, modalidad_id) VALUES (2, 1), (3, 2), (4, 1), (5, 3);

INSERT INTO proyecto (titulo, descripcion, cupo_maximo, estado) VALUES 
('Sistema de Gestión IA', 'Desarrollo de un core basado en redes neuronales', 3, 'en curso'),
('App Móvil Reciclaje', 'Aplicación para incentivar el reciclaje urbano', 5, 'en curso'),
('Portal E-learning', 'Plataforma educativa para zonas rurales', 10, 'finalizado');

-- Asignaciones (IDs de alumnos 1, 2, 3, 4 recién creados)
INSERT INTO asignacion (alumno_id, proyecto_id) VALUES (1, 1), (2, 1), (3, 2), (4, 2);

INSERT INTO comentario (proyecto_id, usuario_id, texto) VALUES 
(1, 1, 'He subido el primer bosquejo del modelo a la nube.'),
(1, 1, '¿Alguien puede revisar la API de conexión?'),
(2, 1, 'Excelente progreso con el diseño de la interfaz.');

INSERT INTO horario (alumno_id, dia_semana, hora_inicio, hora_fin) VALUES 
(1, 'Lunes', '09:00', '13:00'),
(2, 'Martes', '15:00', '19:00');

INSERT INTO asistencia (alumno_id, fecha, presente) VALUES 
(1, CURDATE(), 1), (2, CURDATE(), 1), (3, CURDATE(), 0), (4, CURDATE(), 1);