// Materias disponibles para el filtro del catálogo.
// Editá esta lista para agregar o cambiar materias y sus emojis.
// El filtro siempre las muestra aunque no haya publicaciones con esa materia.

export interface MateriaInfo {
  materia: string;
  emoji: string;
}

export const MATERIAS: MateriaInfo[] = [
  { materia: "Matemática", emoji: "🧮" },
  { materia: "Lengua y Literatura", emoji: "📚" },
  { materia: "Historia", emoji: "📜" },
  { materia: "Ciencias Naturales", emoji: "🔬" },
  { materia: "Geografía", emoji: "🌍" },
  { materia: "Escritura", emoji: "✏️" },
  { materia: "Datos y Estadística", emoji: "📊" },
  { materia: "Laboratorio", emoji: "🧪" },
];
