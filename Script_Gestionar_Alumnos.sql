-- =========================================
-- 1. TABLA USUARIOS
-- =========================================
CREATE TABLE usuarios (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_usuario VARCHAR2(50) NOT NULL UNIQUE,
    contrasena_hash VARCHAR2(255) NOT NULL,
    rol VARCHAR2(20) NOT NULL
        CHECK (rol IN ('alumno', 'administrador')),
    nombre_real VARCHAR2(100) NOT NULL
);

-- =========================================
-- 2. TABLA MODALIDADES
-- =========================================
CREATE TABLE modalidades (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(50) NOT NULL UNIQUE
);

-- =========================================
-- 3. TABLA ALUMNOS
-- =========================================
CREATE TABLE alumnos (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id NUMBER UNIQUE,
    modalidad_id NUMBER,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (modalidad_id) REFERENCES modalidades(id)
);

-- =========================================
-- 4. TABLA PROYECTOS
-- =========================================
CREATE TABLE proyectos (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR2(100) NOT NULL,
    descripcion VARCHAR2(500),
    cupo_maximo NUMBER DEFAULT 5 NOT NULL,
    estado VARCHAR2(20) DEFAULT 'en curso'
        CHECK (estado IN ('en curso', 'finalizado', 'pausado'))
);

-- =========================================
-- 5. TABLA ASIGNACIONES
-- =========================================
CREATE TABLE asignaciones (
    alumno_id NUMBER,
    proyecto_id NUMBER,
    PRIMARY KEY (alumno_id, proyecto_id),
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id)
);

-- =========================================
-- 6. TRIGGER CUPOS PROYECTOS
-- =========================================
CREATE OR REPLACE TRIGGER evitar_exceso_cupo
BEFORE INSERT ON asignaciones
FOR EACH ROW
DECLARE
    v_total NUMBER;
    v_cupo NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM asignaciones
    WHERE proyecto_id = :NEW.proyecto_id;

    SELECT cupo_maximo INTO v_cupo
    FROM proyectos
    WHERE id = :NEW.proyecto_id;

    IF v_total >= v_cupo THEN
        RAISE_APPLICATION_ERROR(-20001,
        'Error: El proyecto ha alcanzado su límite de alumnos');
    END IF;
END;
/
-- IMPORTANTE: la barra "/" es obligatoria en Oracle

-- =========================================
-- 7. TABLA COMENTARIOS
-- =========================================
CREATE TABLE comentarios (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    proyecto_id NUMBER,
    usuario_id NUMBER,
    texto VARCHAR2(500) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =========================================
-- 8. TABLA HORARIOS
-- =========================================
CREATE TABLE horarios (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    alumno_id NUMBER,
    dia_semana VARCHAR2(20) NOT NULL,
    hora_inicio VARCHAR2(10) NOT NULL,
    hora_fin VARCHAR2(10) NOT NULL,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
);

-- =========================================
-- 9. TABLA ASISTENCIA
-- =========================================
CREATE TABLE asistencia (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    alumno_id NUMBER,
    fecha DATE DEFAULT SYSDATE,
    presente NUMBER(1) DEFAULT 0,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
);

-- =========================================
-- INSERCIÓN DE DATOS DE PRUEBA (ORACLE)
-- =========================================

-- 1. MODALIDADES
INSERT INTO modalidades (nombre) VALUES ('Presencial');
INSERT INTO modalidades (nombre) VALUES ('Online');
INSERT INTO modalidades (nombre) VALUES ('Semipresencial');

-- 2. USUARIOS 
-- (Contraseñas de ejemplo en texto plano para fines ilustrativos, en real sería el hash)
INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol, nombre_real) 
VALUES ('admin_jose', 'hash_secure_123', 'administrador', 'José Rodríguez');

INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol, nombre_real) 
VALUES ('maria_garcia', 'hash_student_99', 'alumno', 'María García');

INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol, nombre_real) 
VALUES ('carlos_ruiz', 'hash_student_88', 'alumno', 'Carlos Ruiz');

INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol, nombre_real) 
VALUES ('ana_perez', 'hash_student_77', 'alumno', 'Ana Pérez');

INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol, nombre_real) 
VALUES ('luis_mendoza', 'hash_student_66', 'alumno', 'Luis Mendoza');

-- 3. ALUMNOS 
-- Relacionamos los usuarios con rol 'alumno' (IDs 2, 3, 4, 5) y modalidades
INSERT INTO alumnos (usuario_id, modalidad_id) VALUES (2, 1); -- María en Presencial
INSERT INTO alumnos (usuario_id, modalidad_id) VALUES (3, 2); -- Carlos en Online
INSERT INTO alumnos (usuario_id, modalidad_id) VALUES (4, 1); -- Ana en Presencial
INSERT INTO alumnos (usuario_id, modalidad_id) VALUES (5, 3); -- Luis en Semipresencial

-- 4. PROYECTOS
INSERT INTO proyectos (titulo, descripcion, cupo_maximo, estado) 
VALUES ('Sistema de Gestión IA', 'Desarrollo de un core basado en redes neuronales', 3, 'en curso');

INSERT INTO proyectos (titulo, descripcion, cupo_maximo, estado) 
VALUES ('App Móvil Reciclaje', 'Aplicación para incentivar el reciclaje urbano', 5, 'en curso');

INSERT INTO proyectos (titulo, descripcion, cupo_maximo, estado) 
VALUES ('Portal E-learning', 'Plataforma educativa para zonas rurales', 10, 'finalizado');

-- 5. ASIGNACIONES
-- Proyecto 1 (IA): María y Carlos
INSERT INTO asignaciones (alumno_id, proyecto_id) VALUES (1, 1);
INSERT INTO asignaciones (alumno_id, proyecto_id) VALUES (2, 1);

-- Proyecto 2 (App): Ana y Luis
INSERT INTO asignaciones (alumno_id, proyecto_id) VALUES (3, 2);
INSERT INTO asignaciones (alumno_id, proyecto_id) VALUES (4, 2);

-- 6. COMENTARIOS
INSERT INTO comentarios (proyecto_id, usuario_id, texto) 
VALUES (1, 1, 'He subido el primer bosquejo del modelo a la nube.');

INSERT INTO comentarios (proyecto_id, usuario_id, texto) 
VALUES (1, 1, '¿Alguien puede revisar la API de conexión?');

INSERT INTO comentarios (proyecto_id, usuario_id, texto) 
VALUES (2, 1, 'Excelente progreso con el diseño de la interfaz.');

-- 7. HORARIOS
-- Horario de María
INSERT INTO horarios (alumno_id, dia_semana, hora_inicio, hora_fin) 
VALUES (1, 'Lunes', '09:00', '13:00');

-- Horario de Carlos
INSERT INTO horarios (alumno_id, dia_semana, hora_inicio, hora_fin) 
VALUES (2, 'Martes', '15:00', '19:00');

-- 8. ASISTENCIA
INSERT INTO asistencia (alumno_id, fecha, presente) VALUES (1, SYSDATE, 1);
INSERT INTO asistencia (alumno_id, fecha, presente) VALUES (2, SYSDATE, 1);
INSERT INTO asistencia (alumno_id, fecha, presente) VALUES (3, SYSDATE, 0); -- Ausente
INSERT INTO asistencia (alumno_id, fecha, presente) VALUES (4, SYSDATE, 1);