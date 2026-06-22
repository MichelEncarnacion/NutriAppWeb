// Gestión de usuarios
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import AdminLayout from "../../components/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input, { Field } from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

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
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3 items-center">
                        <Input
                            accent="purple"
                            placeholder="Buscar por nombre o email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 min-w-0"
                        />
                        <Button
                            variant="admin"
                            onClick={() => { setFormNuevo(FORM_NUEVO); setErrorCrear(null); setModalCrear(true); }}
                            className="whitespace-nowrap flex-shrink-0"
                        >
                            + Nuevo
                        </Button>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                        {["todos", "demo", "freemium", "premium"].map((f) => (
                            <button key={f} onClick={() => setFiltro(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                    ${filtro === f
                                        ? "border-brand-purple bg-brand-purple/15 text-brand-purple"
                                        : "border-dark-600 text-text-muted hover:border-brand-purple"
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                        <span className="text-xs text-text-muted ml-auto">{filtrados.length} usuarios</span>
                    </div>
                </div>

                {/* Tabla */}
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                        <thead className="bg-dark-700">
                            <tr className="text-text-muted text-left">
                                {["Nombre", "Email", "Tipo", "Registro", "Estado", "Acciones"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-xs font-bold tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-600">
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-dark-600 rounded animate-pulse" /></td></tr>
                                ))
                                : filtrados.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3 text-text-primary font-semibold">{u.nombre ?? "—"}</td>
                                        <td className="px-4 py-3 text-text-muted text-xs">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <Input
                                                accent="purple"
                                                as="select"
                                                value={u.tipo_usuario}
                                                onChange={(e) => cambiarTipo(u.id, e.target.value)}
                                                className="text-xs px-2 py-1 w-auto rounded-lg"
                                            >
                                                {["demo", "freemium", "premium"].map((t) => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </Input>
                                        </td>
                                        <td className="px-4 py-3 text-text-muted text-xs">
                                            {new Date(u.fecha_registro).toLocaleDateString("es-MX")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge tone="green" className="normal-case">● Activo</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 items-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => regenerarPlan(u.id)}
                                                    disabled={!!regenerando[u.id]}
                                                    className={
                                                        regenerando[u.id] === "ok"
                                                            ? "text-brand-green bg-brand-green/10"
                                                            : regenerando[u.id] === "error"
                                                                ? "text-brand-red bg-brand-red/10"
                                                                : "text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20"
                                                    }
                                                >
                                                    {regenerando[u.id] === "loading" ? "Generando…"
                                                        : regenerando[u.id] === "ok" ? "✓ Listo"
                                                        : regenerando[u.id] === "error" ? "✗ Error"
                                                        : "Regenerar Plan"}
                                                </Button>
                                                {confirmarEliminar === u.id ? (
                                                    <>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => eliminarUsuario(u.id)}
                                                            disabled={eliminando[u.id]}
                                                            className="bg-brand-red/20 hover:bg-brand-red/35"
                                                        >
                                                            {eliminando[u.id] ? "Eliminando…" : "Confirmar"}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setConfirmarEliminar(null)}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => setConfirmarEliminar(u.id)}
                                                    >
                                                        Eliminar
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    </div>
                </Card>
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
                        <Card className="w-full max-w-md rounded-xl flex flex-col p-0">

                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
                                <h3 className="text-text-primary font-bold font-display text-sm">Nuevo usuario</h3>
                                <button
                                    onClick={() => setModalCrear(false)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-text-muted hover:text-text-primary hover:bg-dark-700 transition-colors"
                                >✕</button>
                            </div>

                            {/* Body */}
                            <div className="flex flex-col gap-4 px-5 py-5">

                                {/* Toggle admin/usuario */}
                                <div className="flex gap-2 p-1 rounded-xl bg-dark-700">
                                    {[{ label: "Usuario normal", val: false }, { label: "Administrador", val: true }].map(({ label, val }) => (
                                        <button
                                            key={String(val)}
                                            onClick={() => setFormNuevo((f) => ({ ...f, es_admin: val }))}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                                                formNuevo.es_admin === val
                                                    ? val
                                                        ? "bg-brand-orange/15 text-brand-orange border-brand-orange/30"
                                                        : "bg-brand-purple/15 text-brand-purple border-brand-purple/30"
                                                    : "bg-transparent text-text-muted border-transparent"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                <Field label="Email">
                                    <Input
                                        accent="purple"
                                        type="email"
                                        placeholder="usuario@ejemplo.com"
                                        value={formNuevo.email}
                                        onChange={(e) => setFormNuevo((f) => ({ ...f, email: e.target.value }))}
                                    />
                                </Field>

                                <Field label="Contraseña temporal">
                                    <Input
                                        accent="purple"
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={formNuevo.password}
                                        onChange={(e) => setFormNuevo((f) => ({ ...f, password: e.target.value }))}
                                    />
                                </Field>

                                <Field label="Nombre">
                                    <Input
                                        accent="purple"
                                        type="text"
                                        placeholder="Nombre completo"
                                        value={formNuevo.nombre}
                                        onChange={(e) => setFormNuevo((f) => ({ ...f, nombre: e.target.value }))}
                                    />
                                </Field>

                                {!formNuevo.es_admin && (
                                    <Field label="Tipo de usuario">
                                        <Input
                                            accent="purple"
                                            as="select"
                                            value={formNuevo.tipo_usuario}
                                            onChange={(e) => setFormNuevo((f) => ({ ...f, tipo_usuario: e.target.value }))}
                                        >
                                            {["freemium", "demo", "premium"].map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </Input>
                                    </Field>
                                )}

                                {errorCrear && (
                                    <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red rounded-xl px-3 py-2.5 text-xs">
                                        {errorCrear}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 px-5 py-4 border-t border-dark-600">
                                <Button variant="secondary" onClick={() => setModalCrear(false)} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button
                                    variant={formNuevo.es_admin ? "secondary" : "admin"}
                                    onClick={crearUsuario}
                                    disabled={creando || !formNuevo.email || !formNuevo.password}
                                    className={`flex-1 ${formNuevo.es_admin ? "bg-brand-orange text-black hover:bg-brand-orange/85 border-0" : ""}`}
                                >
                                    {creando ? "Creando…" : formNuevo.es_admin ? "Crear admin" : "Crear usuario"}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}