import { useEffect, useState, type FormEvent } from "react";
import { AppointmentCard } from "../components/AppointmentCard";
import { StatCard } from "../components/StatCard";
import {
  actualizarEstado, crearCita, obtenerCitas,
} from "../services/citasApi";

import type { Cita, EstadoCita, NuevaCita } from "../types";

type Filtro = "todas" | EstadoCita;

export function AppointmentsPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevaCita, setNuevaCita] = useState<NuevaCita>({
    mascota: "",
    cliente: "",
    servicio: "",
    fecha: "",
    hora: "",
  });

  useEffect(() => {
    async function cargarCitas() {
      try {
        setCargando(true);
        setCitas(await obtenerCitas());
      } catch (error) {
        setError(error instanceof Error ? error.message : "Ocurrió un error.");
      } finally {
        setCargando(false);
      }
    }

    void cargarCitas();
  }, []);

  async function confirmarCita(id: number) {
    try {
      setError("");
      const actualizada = await actualizarEstado(id, "confirmada");
      setCitas((actuales) =>
        actuales.map((cita) => (cita.id === id ? actualizada : cita)),
      );
      setMensaje("La cita fue confirmada correctamente.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al confirmar.");
    }
  }

  async function agregarCita(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    setMensaje("");
    setGuardando(true);

    try {
      const creada = await crearCita(nuevaCita);
      setCitas((actuales) => [...actuales, creada]);
      setNuevaCita({
        mascota: "",
        cliente: "",
        servicio: "",
        fecha: "",
        hora: "",
      });
      setMostrarFormulario(false);
      setMensaje("La cita fue registrada correctamente.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al crear la cita.");
    } finally {
      setGuardando(false);
    }
  }

  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [mensaje, setMensaje] = useState("");

  const citasFiltradas =
    filtro === "todas" ? citas : citas.filter((cita) => cita.estado === filtro);

  const pendientes = citas.filter((c) => c.estado === "solicitada").length;
  const confirmadas = citas.filter((c) => c.estado === "confirmada").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Agenda de citas</h2>
          <p className="mt-1 text-slate-600">
            Consulta y administra las citas del día.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={mostrarFormulario}
          aria-controls="formulario-nueva-cita"
          onClick={() => {
            setError("");
            setMensaje("");
            setMostrarFormulario((visible) => !visible);
          }}
          className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
        >
          + Nueva cita
        </button>
      </section>

      {mostrarFormulario && (
        <form
          id="formulario-nueva-cita"
          onSubmit={agregarCita}
          className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <h3 className="text-xl font-bold text-slate-900">Registrar cita</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="font-medium text-slate-700">
              Nombre de la mascota
              <input
                required
                maxLength={100}
                value={nuevaCita.mascota}
                onChange={(evento) =>
                  setNuevaCita({ ...nuevaCita, mascota: evento.target.value })
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>
            <label className="font-medium text-slate-700">
              Nombre del cliente
              <input
                required
                maxLength={100}
                value={nuevaCita.cliente}
                onChange={(evento) =>
                  setNuevaCita({ ...nuevaCita, cliente: evento.target.value })
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>
            <label className="font-medium text-slate-700">
              Servicio
              <input
                required
                maxLength={100}
                value={nuevaCita.servicio}
                onChange={(evento) =>
                  setNuevaCita({ ...nuevaCita, servicio: evento.target.value })
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>
            <label className="font-medium text-slate-700">
              Fecha
              <input
                required
                type="date"
                value={nuevaCita.fecha}
                onChange={(evento) =>
                  setNuevaCita({ ...nuevaCita, fecha: evento.target.value })
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>
            <label className="font-medium text-slate-700">
              Hora
              <input
                required
                type="time"
                value={nuevaCita.hora}
                onChange={(evento) =>
                  setNuevaCita({ ...nuevaCita, hora: evento.target.value })
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar cita"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-red-800"
        >
          {error}
        </p>
      )}

      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          titulo="Citas de hoy"
          valor={citas.length}
          color="text-teal-700"
        />
        <StatCard
          titulo="Pendientes"
          valor={pendientes}
          color="text-amber-600"
        />
        <StatCard
          titulo="Confirmadas"
          valor={confirmadas}
          color="text-green-600"
        />
      </section>

      <section className="mt-8">
        <label
          htmlFor="filtro"
          className="mb-2 block font-semibold text-slate-700"
        >
          Filtrar por estado
        </label>
        <select
          id="filtro"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as Filtro)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 sm:w-64"
        >
          <option value="todas">Todas</option>
          <option value="solicitada">Solicitadas</option>
          <option value="confirmada">Confirmadas</option>
          <option value="atendida">Atendidas</option>
          <option value="rechazada">Rechazadas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </section>

      {mensaje && (
        <p
          aria-live="polite"
          className="mt-6 rounded-xl bg-green-100 px-4 py-3 text-green-800"
        >
          {mensaje}
        </p>
      )}

      <section className="mt-6 grid gap-4">
        {cargando ? (
          <p role="status" className="rounded-2xl bg-white p-8 text-center text-slate-500">
            Cargando citas...
          </p>
        ) : citasFiltradas.length > 0 ? (
          citasFiltradas.map((cita) => (
            <AppointmentCard
              key={cita.id}
              cita={cita}
              onConfirmar={confirmarCita}
            />
          ))
        ) : !error ? (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500">
            No se encontraron citas con ese estado.
          </p>
        ) : null}
      </section>
    </main>
  );
}