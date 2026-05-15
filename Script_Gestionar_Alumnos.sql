CREATE DATABASE IF NOT EXISTS gestion_alumnos;

USE gestion_alumnos;

-- Desactivar revisión de llaves foráneas temporalmente para limpieza
SET FOREIGN_KEY_CHECKS = 0;

-- Activar revisión de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================
-- 1. TABLA USUARIOS
-- =========================================
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('alumno', 'administrador')),
    nombre_real VARCHAR(100) NOT NULL,
    foto_usuario VARCHAR(255) DEFAULT NULL
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
    cupo_maximo INT DEFAULT 5 NOT NULL,
    estado VARCHAR(20) DEFAULT 'en curso' CHECK (estado IN ('en curso', 'finalizado', 'pausado')),
    foto_proyecto VARCHAR(255) DEFAULT NULL
);

-- =========================================
-- 5. TABLA ASIGNACIONES
-- =========================================
CREATE TABLE IF NOT EXISTS asignacion (
    alumno_id INT,
    proyecto_id INT,
    PRIMARY KEY (alumno_id, proyecto_id),
    FOREIGN KEY (alumno_id) REFERENCES alumno(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyecto(id) ON DELETE CASCADE
);

-- =========================================
-- 6. TRIGGER CUPOS PROYECTOS
-- =========================================
DROP TRIGGER IF EXISTS evitar_exceso_cupo;
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
-- 8. TABLA HORARIOS
-- =========================================
CREATE TABLE IF NOT EXISTS horario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT,
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,
    FOREIGN KEY (alumno_id) REFERENCES alumno(id) ON DELETE CASCADE
);

-- =========================================
-- 9. TABLA ASISTENCIA
-- =========================================
CREATE TABLE IF NOT EXISTS asistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT,
    fecha DATE DEFAULT (CURRENT_DATE),
    presente TINYINT(1) DEFAULT 0,
    FOREIGN KEY (alumno_id) REFERENCES alumno(id) ON DELETE CASCADE
);

-- =========================================
-- INSERCIÓN DE DATOS
-- =========================================

INSERT IGNORE INTO modalidad (nombre) VALUES ('Presencial'), ('Online'), ('Semipresencial');

-- 1 admin + 11 alumnos
INSERT IGNORE INTO usuario (nombre_usuario, contrasena_hash, rol, nombre_real) VALUES
('admin_jose',    'hash_secure_123', 'administrador', 'José Rodríguez'),
('maria_garcia',  'hash_student_99', 'alumno',        'María García'),
('carlos_ruiz',   'hash_student_88', 'alumno',        'Carlos Ruiz'),
('ana_perez',     'hash_student_77', 'alumno',        'Ana Pérez'),
('luis_mendoza',  'hash_student_66', 'alumno',        'Luis Mendoza'),
('sofia_torres',  'hash_student_55', 'alumno',        'Sofía Torres'),
('miguel_castro', 'hash_student_44', 'alumno',        'Miguel Castro'),
('laura_jimenez', 'hash_student_33', 'alumno',        'Laura Jiménez'),
('pablo_moreno',  'hash_student_22', 'alumno',        'Pablo Moreno'),
('elena_navarro', 'hash_student_11', 'alumno',        'Elena Navarro'),
('david_romero',  'hash_student_10', 'alumno',        'David Romero'),
('clara_santos',  'hash_student_09', 'alumno',        'Clara Santos');

-- alumno.usuario_id apunta a usuarios 2-12 → alumno_id 1-11
INSERT IGNORE INTO alumno (usuario_id, modalidad_id) VALUES
(2,  1),   -- alumno_id 1  → María       Presencial
(3,  2),   -- alumno_id 2  → Carlos      Online
(4,  1),   -- alumno_id 3  → Ana         Presencial
(5,  3),   -- alumno_id 4  → Luis        Semipresencial
(6,  2),   -- alumno_id 5  → Sofía       Online
(7,  1),   -- alumno_id 6  → Miguel      Presencial
(8,  3),   -- alumno_id 7  → Laura       Semipresencial
(9,  2),   -- alumno_id 8  → Pablo       Online
(10, 1),   -- alumno_id 9  → Elena       Presencial
(11, 3),   -- alumno_id 10 → David       Semipresencial
(12, 2);   -- alumno_id 11 → Clara       Online

-- 8 proyectos con los tres estados
INSERT IGNORE INTO proyecto (titulo, descripcion, cupo_maximo, estado) VALUES
('Sistema de Gestión IA',      'Desarrollo de un core basado en redes neuronales',             3,  'en curso'),    -- id 1
('App Móvil Reciclaje',        'Aplicación para incentivar el reciclaje urbano',               5,  'en curso'),    -- id 2
('Portal E-learning',          'Plataforma educativa para zonas rurales',                      10, 'finalizado'),  -- id 3
('Dashboard Analítica Web',    'Panel de métricas en tiempo real con charts interactivos',     4,  'en curso'),    -- id 4
('API REST Inventario',        'Backend de gestión de stock para pequeños comercios',          6,  'pausado'),     -- id 5
('Bot Telegram Recordatorios', 'Bot que envía recordatorios de tareas y eventos por Telegram', 3,  'en curso'),    -- id 6
('Rediseño UX App Bancaria',   'Mejora de experiencia de usuario en app financiera',           5,  'finalizado'),  -- id 7
('Scraper Ofertas Empleo',     'Herramienta que agrega ofertas de empleo de varias webs',      4,  'pausado');     -- id 8

-- Asignaciones (respetando cupos; alumno_id=1 tiene activo+finalizado para ver las 3 secciones)
INSERT IGNORE INTO asignacion (alumno_id, proyecto_id) VALUES
(1,  1),   -- María    → activo
(1,  3),   -- María    → finalizado
(2,  1),   -- Carlos   → activo
(2,  4),   -- Carlos   → activo
(3,  2),   -- Ana      → activo
(3,  7),   -- Ana      → finalizado
(4,  2),   -- Luis     → activo
(4,  5),   -- Luis     → pausado
(5,  4),   -- Sofía    → activo
(5,  6),   -- Sofía    → activo
(6,  6),   -- Miguel   → activo
(6,  8),   -- Miguel   → pausado
(7,  2),   -- Laura    → activo
(7,  3),   -- Laura    → finalizado
(8,  4),   -- Pablo    → activo
(9,  5),   -- Elena    → pausado
(10, 7),   -- David    → finalizado
(10, 8),   -- David    → pausado
(11, 6);   -- Clara    → activo

-- Comentarios
INSERT IGNORE INTO comentario (proyecto_id, usuario_id, texto) VALUES
(1, 1, 'He subido el primer bosquejo del modelo a la nube.'),
(1, 1, '¿Alguien puede revisar la API de conexión?'),
(2, 1, 'Excelente progreso con el diseño de la interfaz.'),
(3, 1, 'Proyecto cerrado con éxito. ¡Buen trabajo a todos!'),
(4, 1, 'Necesitamos decidir qué librería de charts usar.'),
(4, 1, 'He creado el repositorio en GitHub, os paso el enlace.'),
(5, 1, 'Pausado temporalmente por falta de recursos.'),
(6, 1, 'El bot ya responde comandos básicos en el servidor de pruebas.'),
(7, 1, 'Las pruebas de usabilidad dieron resultados muy positivos.'),
(8, 1, 'En espera de acceso a las APIs de las webs objetivo.');

-- Horarios
INSERT IGNORE INTO horario (alumno_id, dia_semana, hora_inicio, hora_fin) VALUES
(1,  'Lunes',     '09:00', '13:00'),
(2,  'Martes',    '15:00', '19:00'),
(3,  'Miércoles', '09:00', '13:00'),
(4,  'Jueves',    '10:00', '14:00'),
(5,  'Viernes',   '08:00', '12:00'),
(6,  'Lunes',     '15:00', '19:00'),
(7,  'Martes',    '09:00', '13:00'),
(8,  'Miércoles', '16:00', '20:00'),
(9,  'Jueves',    '09:00', '13:00'),
(10, 'Viernes',   '10:00', '14:00'),
(11, 'Lunes',     '08:00', '12:00');

-- Asistencia: hoy y últimos 2 días
INSERT IGNORE INTO asistencia (alumno_id, fecha, presente) VALUES
(1,  CURDATE(), 1), (2,  CURDATE(), 1), (3,  CURDATE(), 0), (4,  CURDATE(), 1),
(5,  CURDATE(), 1), (6,  CURDATE(), 0), (7,  CURDATE(), 1), (8,  CURDATE(), 1),
(9,  CURDATE(), 0), (10, CURDATE(), 1), (11, CURDATE(), 1),
(1,  CURDATE() - INTERVAL 1 DAY, 1), (2,  CURDATE() - INTERVAL 1 DAY, 0),
(3,  CURDATE() - INTERVAL 1 DAY, 1), (4,  CURDATE() - INTERVAL 1 DAY, 1),
(5,  CURDATE() - INTERVAL 1 DAY, 1), (6,  CURDATE() - INTERVAL 1 DAY, 1),
(7,  CURDATE() - INTERVAL 1 DAY, 0), (8,  CURDATE() - INTERVAL 1 DAY, 1),
(9,  CURDATE() - INTERVAL 1 DAY, 1), (10, CURDATE() - INTERVAL 1 DAY, 0),
(11, CURDATE() - INTERVAL 1 DAY, 1),
(1,  CURDATE() - INTERVAL 2 DAY, 0), (2,  CURDATE() - INTERVAL 2 DAY, 1),
(3,  CURDATE() - INTERVAL 2 DAY, 1), (4,  CURDATE() - INTERVAL 2 DAY, 0),
(5,  CURDATE() - INTERVAL 2 DAY, 1), (6,  CURDATE() - INTERVAL 2 DAY, 1),
(7,  CURDATE() - INTERVAL 2 DAY, 1), (8,  CURDATE() - INTERVAL 2 DAY, 0),
(9,  CURDATE() - INTERVAL 2 DAY, 1), (10, CURDATE() - INTERVAL 2 DAY, 1),
(11, CURDATE() - INTERVAL 2 DAY, 1);


ALTER TABLE usuario MODIFY COLUMN foto_usuario LONGTEXT;
ALTER TABLE proyecto MODIFY COLUMN foto_proyecto LONGTEXT;
ALTER TABLE proyecto ADD COLUMN video_url VARCHAR(500) DEFAULT NULL;
