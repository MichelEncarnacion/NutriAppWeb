// src/pages/Bienvenida.jsx
import { useNavigate } from "react-router-dom";

export default function Bienvenida() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center px-4 font-sans">
            <div className="w-full max-w-sm flex flex-col items-center gap-8 text-center">

                {/* Logo */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[#3DDC84] font-black text-4xl font-display tracking-tight">
                        NutriiApp
                    </span>
                    <p className="text-white text-lg font-semibold font-display leading-snug">
                        Tu plan nutricional personalizado con IA
                    </p>
                </div>

                {/* Subtexto */}
                <p className="text-[#7D8590] text-sm leading-relaxed">
                    Responde 24 preguntas, obtén un plan de 15 días diseñado
                    específicamente para ti. Sin dietas genéricas.
                </p>

                {/* Botones */}
                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={() => navigate("/registro")}
                        className="w-full py-3.5 bg-[#3DDC84] text-black font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all text-sm tracking-wide"
                    >
                        Registrarme
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full py-3.5 border border-[#2D3748] text-[#E6EDF3] font-semibold font-display rounded-xl hover:border-[#3DDC84] hover:text-white transition-all text-sm"
                    >
                        Ya tengo cuenta
                    </button>
                </div>

            </div>
        </div>
    );
}
