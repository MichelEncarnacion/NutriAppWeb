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
export function useActivePlan() {
  const { session } = useAuth()
  const uid = session?.user?.id

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activePlan', uid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planes')
        .select('contenido_json, fecha_inicio, fecha_fin')
        .eq('perfil_id', uid)
        .eq('es_activo', true)
        .eq('estado', 'listo')
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data ?? null
    },
    enabled: Boolean(uid),
    staleTime: 5 * 60 * 1000, // 5 minutes — plan rarely changes mid-session
  })

  const diaActual = data?.fecha_inicio
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
    plan: data?.contenido_json ?? null,
    fechaInicio: data?.fecha_inicio ?? null,
    fechaFin: data?.fecha_fin ?? null,
    diaActual,
    isLoading,
    error: error ?? null,
    refetch,
  }
}
