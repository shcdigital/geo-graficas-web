// Materias disponibles para el filtro del catálogo y el desplegable del editor.
// Fuente única: src/data/materias.json (la edita también el panel de admin).

import materiasData from "./materias.json";

export interface MateriaInfo {
  materia: string;
  emoji: string;
}

export const MATERIAS: MateriaInfo[] = (materiasData as { materias: MateriaInfo[] }).materias;
