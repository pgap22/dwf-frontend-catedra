import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../store/authStore";

export default function ClientePerfil() {
  const { user, fetchUser } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  const initials = useMemo(() => {
    const name = user?.nombre || user?.name || "";
    const parts = name.trim().split(/\s+/);
    if (!parts.length) return "?";
    const first = parts[0]?.[0] || "";
    const last = parts[parts.length - 1]?.[0] || "";
    return (first + (parts.length > 1 ? last : "")).toUpperCase();
  }, [user]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user?.correo || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  if (!user) {
    return <p className="p-6 text-gray-500 italic">Cargando...</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>

      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>

          {/* Datos */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.nombre || "—"}
            </h2>
            <p className="text-gray-600">{user?.correo}</p>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                Rol: {user?.rol || "—"}
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={copyEmail}
              className="bg-white text-gray-900 border border-gray-300 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Copiar correo"
            >
              {copied ? "¡Copiado!" : "Copiar correo"}
            </button>
            <button
              onClick={fetchUser}
              className="bg-white text-gray-900 border border-gray-300 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Refrescar"
            >
              Refrescar
            </button>
          </div>
        </div>

        {/* Grid de campos */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="ID" value={String(user?.id ?? "—")} />
          <Field label="Nombre" value={user?.nombre || "—"} />
          <Field label="Correo" value={user?.correo || "—"} />
          <Field label="Rol" value={user?.rol || "—"} />
        </div>
      </section>

      {/* Debug opcional */}
      {/* <details
        className="text-sm"
        onClick={(e) => {
          // para que no salte de posición al abrir/cerrar
          e.preventDefault();
          setShowJson((s) => !s);
        }}
      >
        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
          {showJson ? "Ocultar JSON (debug)" : "Ver JSON (debug)"}
        </summary>
        {showJson && (
          <pre className="mt-2 bg-gray-900 text-green-300 p-4 rounded-md overflow-x-auto text-xs shadow-inner">
            {JSON.stringify(user, null, 2)}
          </pre>
        )}
      </details> */}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  );
}
