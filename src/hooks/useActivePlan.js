// src/hooks/useActivePlan.js
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * Fetches the user's active nutrition plan.
 *
 * Returns:
 *   plan        — contenido_json object: { meta_diaria, dias[] } or null
 *   fechaInicio — 'YYYY-MM-DD' string or null
 *   fechaFin    — 'YYYY-MM-DD' string or null
 *   diaActual   — integer 1–15 based on today vs fechaInicio
 *   isLoading   — boolean
 *   error       — Error or null
 *   refetch     — function to manually re-fetch
 */
const STALE_GENERATING_MS = 10 * 60 * 1000 // 10 minutos

export function useActivePlan() {
  const { session } = useAuth()
  const uid = session?.user?.id

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activePlan', uid],
    queryFn: async () => {
      // Buscar plan listo activo
      const { data: listo, error } = await supabase
        .from('planes')
        .select('contenido_json, fecha_inicio, fecha_fin')
        .eq('perfil_id', uid)
        .eq('es_activo', true)
        .eq('estado', 'listo')
        .limit(1)
        .maybeSingle()
      if (error) throw error
      if (listo) return { plan: listo, stuckGenerating: false }

      // Detectar plan atascado en "generando" por más de 10 minutos
      const cutoff = new Date(Date.now() - STALE_GENERATING_MS).toISOString()
      const { data: atascado } = await supabase
        .from('planes')
        .select('id, created_at')
        .eq('perfil_id', uid)
        .eq('estado', 'generando')
        .lt('created_at', cutoff)
        .limit(1)
        .maybeSingle()

      return { plan: null, stuckGenerating: Boolean(atascado) }
    },
    enabled: Boolean(uid),
    staleTime: 5 * 60 * 1000,
  })

  const diaActual = data?.plan?.fecha_inicio
    ? Math.min(
        Math.max(
          Math.floor(
            (Date.now() - new Date(data.fecha_inicio + "T00:00:00").getTime()) /
              86_400_000
          ) + 1,
          1
        ),
        15
      )
    : 1

  return {
    plan: data?.plan?.contenido_json ?? null,
    fechaInicio: data?.plan?.fecha_inicio ?? null,
    fechaFin: data?.plan?.fecha_fin ?? null,
    stuckGenerating: data?.stuckGenerating ?? false,
    diaActual,
    isLoading,
    error: error ?? null,
    refetch,
  }
}
