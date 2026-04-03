// Gestión de usuarios
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import AdminLayout from "../../components/AdminLayout";

export default function AdminUsuarios() {
    const { session } = useAuth();
    const [users, setUsers] = useState([]);
    const [filtro, setFiltro] = useState("todos");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [regenerando, setRegenerando] = useState({});
    const [eliminando, setEliminando] = useState({});
    const [confirmarEliminar, setConfirmarEliminar] = useState(null); // id del usuario a eliminar

    const cargar = async () => {
        let q = supabase.from("perfiles").select("*").order("fecha_registro", { ascending: false });
        if (filtro !== "todos") q = q.eq("tipo_usuario", filtro);
        const { data } = await q;
        setUsers(data ?? []);
        setLoading(false);
    };

    useEffect(() => { cargar(); }, [filtro]);

    const cambiarTipo = async (id, tipo) => {
        const { error } = await supabase.from("perfiles").update({ tipo_usuario: tipo }).eq("id", id);
        if (error) console.error("Error cambiando tipo:", error.message);
        cargar();
    };

    const eliminarUsuario = async (id) => {
        setEliminando((p) => ({ ...p, [id]: true }));
        try {
            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-eliminar-usuario`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${session?.access_token}`,
                        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({ user_id: id }),
                }
            );
            if (res.ok) {
                setUsers((prev) => prev.filter((u) => u.id !== id));
            } else {
                const data = await res.json();
                console.error("Error eliminando usuario:", data.error);
            }
        } catch (e) {
            console.error("Error eliminando usuario:", e);
        } finally {
            setEliminando((p) => { const n = { ...p }; delete n[id]; return n; });
            setConfirmarEliminar(null);
        }
    };

    const regenerarPlan = async (id) => {
        setRegenerando((p) => ({ ...p, [id]: "loading" }));
        let hasError = true;
        try {
            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generar-plan`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${session?.access_token}`,
                        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({ target_perfil_id: id }),
                }
            );
            hasError = !res.ok;
        } catch {
            hasError = true;
        }
        setRegenerando((p) => ({ ...p, [id]: hasError ? "error" : "ok" }));
        setTimeout(() => setRegenerando((p) => { const n = { ...p }; delete n[id]; return n; }), 3000);
    };

    const filtrados = users.filter((u) =>
        (u.nombre ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout titulo="Gestión de usuarios">
            <div className="flex flex-col gap-4">

                {/* Filtros */}
                <div className="flex gap-3 items-center flex-wrap">
                    <input
                        placeholder="Buscar por nombre o email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-[#161B22] border border-[#2D3748] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#A855F7] w-64 transition-colors"
                    />
                    {["todos", "demo", "freemium", "premium"].map((f) => (
                        <button key={f} onClick={() => setFiltro(f)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border
                ${filtro === f
                                    ? "border-[#A855F7] bg-[rgba(168,85,247,.12)] text-[#A855F7]"
                                    : "border-[#2D3748] text-[#7D8590] hover:border-[#A855F7]"
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                    <span className="text-xs text-[#7D8590] ml-auto">{filtrados.length} usuarios</span>
                </div>

                {/* Tabla */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                        <thead className="bg-[#1C2330]">
                            <tr className="text-[#7D8590] text-left">
                                {["Nombre", "Email", "Tipo", "Registro", "Estado", "Acciones"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-xs font-bold tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2D3748]">
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-[#2D3748] rounded animate-pulse" /></td></tr>
                                ))
                                : filtrados.map((u) => (
                                    <tr key={u.id} className="hover:bg-[rgba(255,255,255,.02)] transition-colors">
                                        <td className="px-4 py-3 text-white font-semibold">{u.nombre ?? "—"}</td>
                                        <td className="px-4 py-3 text-[#7D8590] text-xs">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={u.tipo_usuario}
                                                onChange={(e) => cambiarTipo(u.id, e.target.value)}
                                                className="bg-[#1C2330] border border-[#2D3748] text-white text-xs rounded-lg px-2 py-1 outline-none"
                                            >
                                                {["demo", "freemium", "premium"].map((t) => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-[#7D8590] text-xs">
                                            {new Date(u.fecha_registro).toLocaleDateString("es-MX")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-bold text-[#3DDC84]">● Activo</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 items-center">
                                                <button
                                                    onClick={() => regenerarPlan(u.id)}
                                                    disabled={!!regenerando[u.id]}
                                                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all disabled:opacity-60
                                                        ${regenerando[u.id] === "ok"
                                                            ? "bg-[rgba(61,220,132,.12)] text-[#3DDC84]"
                                                            : regenerando[u.id] === "error"
                                                                ? "bg-[rgba(255,107,107,.12)] text-[#FF6B6B]"
                                                                : "bg-[rgba(88,166,255,.12)] text-[#58A6FF] hover:bg-[rgba(88,166,255,.2)]"
                                                        }`}
                                                >
                                                    {regenerando[u.id] === "loading" ? "Generando…"
                                                        : regenerando[u.id] === "ok" ? "✓ Listo"
                                                        : regenerando[u.id] === "error" ? "✗ Error"
                                                        : "Regenerar Plan"}
                                                </button>
                                                {confirmarEliminar === u.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => eliminarUsuario(u.id)}
                                                            disabled={eliminando[u.id]}
                                                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[rgba(255,107,107,.2)] text-[#FF6B6B] hover:bg-[rgba(255,107,107,.35)] transition-all disabled:opacity-60"
                                                        >
                                                            {eliminando[u.id] ? "Eliminando…" : "Confirmar"}
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmarEliminar(null)}
                                                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#1C2330] text-[#7D8590] hover:text-white transition-all"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmarEliminar(u.id)}
                                                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[rgba(255,107,107,.08)] text-[#FF6B6B] hover:bg-[rgba(255,107,107,.2)] transition-all"
                                                    >
                                                        Eliminar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}