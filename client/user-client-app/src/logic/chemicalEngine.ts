import type { ChemicalReaction } from "./chemicalReactions";
import { CHEMICAL_REACTIONS } from "./chemicalReactions";

export function checkReaction(substances: string[]): ChemicalReaction | null {
  // Нормализация ввода (удаление коэффициентов)
  const normalize = (formula: string) => formula.replace(/^\d+/, '');
  const normalizedInput = substances.map(normalize).sort();
  
  for (const reaction of CHEMICAL_REACTIONS) {
    const normalizedReactants = reaction.reactants.map(normalize).sort();
    
    // Проверка на соответствие без учета коэффициентов
    if (JSON.stringify(normalizedReactants) === JSON.stringify(normalizedInput)) {
      return reaction;
    }
  }
  
  return null;
}