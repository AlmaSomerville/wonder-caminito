// Formatos en español para el panel
export const ESTADO = { PENDING: "Pendiente", CONFIRMED: "Confirmada", CANCELLED: "Cancelada", COMPLETED: "Completada" };

export const ESTADO_COLOR = {
  PENDING: "bg-peach text-terracotta",
  CONFIRMED: "bg-turquoise/15 text-[#2b8a80]",
  CANCELLED: "bg-black/5 text-rock/60",
  COMPLETED: "bg-rock text-sand",
};

export function fecha(d) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

export function mes(key) {
  const [y, m] = key.split("-");
  const s = new Date(+y, +m - 1, 15).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
