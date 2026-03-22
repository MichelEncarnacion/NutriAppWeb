-- ============================================================
-- NutriiApp — Fase 1 — Índices
-- Requiere: 02_tablas.sql ejecutado previamente
-- ============================================================

-- perfiles: filtros admin por segmento de usuario
CREATE INDEX idx_perfiles_tipo_usuario
  ON perfiles(tipo_usuario);

-- diagnosticos: join desde perfil
CREATE INDEX idx_diagnosticos_perfil_id
  ON diagnosticos(perfil_id);

-- planes: queries del panel Mi Plan y filtros admin
CREATE INDEX idx_planes_perfil_id
  ON planes(perfil_id);
CREATE INDEX idx_planes_es_activo
  ON planes(es_activo);
CREATE INDEX idx_planes_estado
  ON planes(estado);

-- seguimientos: historial cronológico por usuario
CREATE INDEX idx_seguimientos_perfil_id
  ON seguimientos(perfil_id);
CREATE INDEX idx_seguimientos_created_at
  ON seguimientos(created_at);

-- metricas: queries del panel Progreso (fecha + usuario)
CREATE INDEX idx_metricas_perfil_id
  ON metricas(perfil_id);
CREATE INDEX idx_metricas_fecha
  ON metricas(fecha);

-- lecciones_usuario: estado de lecciones por usuario
CREATE INDEX idx_lecciones_usuario_perfil_id
  ON lecciones_usuario(perfil_id);
CREATE INDEX idx_lecciones_usuario_leccion_id
  ON lecciones_usuario(leccion_id);
CREATE INDEX idx_lecciones_usuario_estado
  ON lecciones_usuario(estado);

-- dispositivos: lookup por device_id para control de sesión
CREATE INDEX idx_dispositivos_perfil_id
  ON dispositivos(perfil_id);
CREATE INDEX idx_dispositivos_device_id
  ON dispositivos(device_id);
CREATE INDEX idx_dispositivos_activo
  ON dispositivos(activo);

-- notificaciones: bandeja de entrada por usuario
CREATE INDEX idx_notificaciones_destinatario_id
  ON notificaciones(destinatario_id);
CREATE INDEX idx_notificaciones_enviada_at
  ON notificaciones(enviada_at);

-- invitaciones_demo: lookup de invitación usada
CREATE INDEX idx_invitaciones_demo_usado_por
  ON invitaciones_demo(usado_por);
