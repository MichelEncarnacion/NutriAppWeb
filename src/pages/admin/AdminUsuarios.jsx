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
    const [confirmarEliminar, setConfirmarEliminar] = useState(null);

    // Modal crear usuario
    const FORM_NUEVO = { email: "", password: "", nombre: "", tipo_usuario: "freemium", es_admin: false };
    const [modalCrear, setModalCrear] = useState(false);
    const [formNuevo, setFormNuevo] = useState(FORM_NUEVO);
    const [creando, setCreando] = useState(false);
    const [errorCrear, setErrorCrear] = useState(null);

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

    const crearUsuario = async () => {
        setCreando(true);
        setErrorCrear(null);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-crear-usuario`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${session?.access_token}`,
                        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify(formNuevo),
                }
            );
            const data = await res.json();
            if (!res.ok) { setErrorCrear(data.error ?? "Error desconocido"); return; }
            setModalCrear(false);
            setFormNuevo(FORM_NUEVO);
            cargar();
        } catch (e) {
            setErrorCrear(String(e));
        } finally {
            setCreando(false);
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
                    <button
                        onClick={() => { setFormNuevo(FORM_NUEVO); setErrorCrear(null); setModalCrear(true); }}
                        className="px-4 py-2 bg-[#A855F7] text-white font-bold font-display text-sm rounded-xl hover:bg-[#C084FC] transition-all"
                    >
                        + Nuevo usuario
                    </button>
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
            {/* ── Modal crear usuario ───────────────────────────────────── */}
            {modalCrear && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
                        onClick={() => setModalCrear(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="w-full max-w-md rounded-2xl border border-[#2D3748] flex flex-col" style={{ background: "#161B22" }}>

                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2D3748]">
                                <h3 className="text-white font-bold font-display text-sm">Nuevo usuario</h3>
                                <button
                                    onClick={() => setModalCrear(false)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-[#7D8590] hover:text-white transition-colors"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >✕</button>
                            </div>

                            {/* Body */}
                            <div className="flex flex-col gap-4 px-5 py-5">

                                {/* Toggle admin/usuario */}
                                <div className="flex gap-2 p-1 rounded-xl" style={{ background: "#1C2330" }}>
                                    {[{ label: "Usuario normal", val: false }, { label: "Administrador", val: true }].map(({ label, val }) => (
                                        <button
                                            key={String(val)}
                                            onClick={() => setFormNuevo((f) => ({ ...f, es_admin: val }))}
                                            className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                                            style={{
                                                background: formNuevo.es_admin === val ? (val ? "rgba(240,165,0,0.15)" : "rgba(168,85,247,0.15)") : "transparent",
                                                color: formNuevo.es_admin === val ? (val ? "#F0A500" : "#A855F7") : "#7D8590",
                                                border: formNuevo.es_admin === val ? `1px solid ${val ? "rgba(240,165,0,0.3)" : "rgba(168,85,247,0.3)"}` : "1px solid transparent",
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="text-xs text-[#7D8590] mb-1.5 block">Email</label>
                                    <input
                                        type="email"
                                        placeholder="usuario@ejemplo.com"
                                        value={formNuevo.email}
                                        onChange={(e) => setFormNuevo((f) => ({ ...f, email: e.target.value }))}
                                        className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#A855F7] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-[#7D8590] mb-1.5 block">Contraseña temporal</label>
                                    <input
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={formNuevo.password}
                                        onChange={(e) => setFormNuevo((f) => ({ ...f, password: e.target.value }))}
                                        className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#A855F7] transition-colors"
                                    />
                                </div>

                                {!formNuevo.es_admin && (
                                    <>
                                        <div>
                                            <label className="text-xs text-[#7D8590] mb-1.5 block">Nombre</label>
                                            <input
                                                type="text"
                                                placeholder="Nombre del usuario"
                                                value={formNuevo.nombre}
                                                onChange={(e) => setFormNuevo((f) => ({ ...f, nombre: e.target.value }))}
                                                className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#A855F7] transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-[#7D8590] mb-1.5 block">Tipo de usuario</label>
                                            <select
                                                value={formNuevo.tipo_usuario}
                                                onChange={(e) => setFormNuevo((f) => ({ ...f, tipo_usuario: e.target.value }))}
                                                className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#A855F7] transition-colors"
                                            >
                                                {["freemium", "demo", "premium"].map((t) => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                {errorCrear && (
                                    <div className="bg-[rgba(255,107,107,.1)] border border-[rgba(255,107,107,.3)] text-[#FF6B6B] rounded-xl px-3 py-2.5 text-xs">
                                        {errorCrear}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 px-5 py-4 border-t border-[#2D3748]">
                                <button
                                    onClick={() => setModalCrear(false)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#7D8590] hover:text-white border border-[#2D3748] hover:border-[#4A5568] transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={crearUsuario}
                                    disabled={creando || !formNuevo.email || !formNuevo.password}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                                    style={{ background: formNuevo.es_admin ? "#F0A500" : "#A855F7" }}
                                >
                                    {creando ? "Creando…" : formNuevo.es_admin ? "Crear admin" : "Crear usuario"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}