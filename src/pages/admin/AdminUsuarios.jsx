// Gestión de usuarios
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

export default function AdminUsuarios() {
    const [users, setUsers] = useState([]);
    const [filtro, setFiltro] = useState("todos");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const cargar = async () => {
        let q = supabase.from("perfiles").select("*").order("fecha_registro", { ascending: false });
        if (filtro !== "todos") q = q.eq("tipo_usuario", filtro);
        const { data } = await q;
        setUsers(data ?? []);
        setLoading(false);
    };

    useEffect(() => { cargar(); }, [filtro]);

    const cambiarTipo = async (id, tipo) => {
        await supabase.from("perfiles").update({ tipo_usuario: tipo }).eq("id", id);
        cargar();
    };

    const toggleActivo = async (id, activo) => {
        await supabase.from("perfiles").update({ activo: !activo }).eq("id", id);
        cargar();
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
                    <table className="w-full text-sm">
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
                                            <span className={`text-xs font-bold ${u.activo ? "text-[#3DDC84]" : "text-[#FF6B6B]"}`}>
                                                {u.activo ? "● Activo" : "○ Inactivo"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleActivo(u.id, u.activo)}
                                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all
                            ${u.activo
                                                        ? "bg-[rgba(255,107,107,.12)] text-[#FF6B6B] hover:bg-[rgba(255,107,107,.2)]"
                                                        : "bg-[rgba(61,220,132,.12)] text-[#3DDC84] hover:bg-[rgba(61,220,132,.2)]"
                                                    }`}
                                            >
                                                {u.activo ? "Desactivar" : "Activar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}