import type React from 'react';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChemicalSubstance, ExperimentResult } from '../../app/types';

const CHEMICAL_COLORS: Record<string, string> = {
    'Na': 'bg-yellow-200',
    'Zn': 'bg-gray-300',
    'H₂SO₄': 'bg-red-100',
    'HCl': 'bg-green-100',
    'CuSO₄': 'bg-blue-200',
    'NaOH': 'bg-purple-100',
    'KOH': 'bg-indigo-100',
    'NaCl': 'bg-gray-100',
    'H₂O': 'bg-blue-100',
    'Na₂SO₄': 'bg-blue-50',
    'Cu(OH)₂': 'bg-blue-300',
    'ZnCl₂': 'bg-gray-200',
    'H₂': 'bg-pink-100'
  };

interface MixingAreaProps {
  onDrop: (chemical: ChemicalSubstance) => void;
  currentMixture: ChemicalSubstance[];
  onClear: () => void;
  onComplete: () => void;
  experimentResult?: ExperimentResult;
}

export const MixingArea: React.FC<MixingAreaProps> = ({ 
  onDrop, 
  currentMixture, 
  onClear,
  onComplete,
  experimentResult
}) => {
  const areaRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const chemicalData = e.dataTransfer.getData('chemical');
    if (chemicalData) {
      const chemical: ChemicalSubstance = JSON.parse(chemicalData);
      onDrop(chemical);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      ref={areaRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative border-2 border-gray-300 rounded-lg p-4 h-full flex flex-col"
    >
      <h3 className="text-xl font-semibold mb-4 text-center">Колба для смешивания</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence>
          {currentMixture.length > 0 ? (
            <motion.div 
              key="mixture"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-32 h-40 relative"
            >
              <div className="absolute inset-0 bg-blue-50 rounded-b-full border-2 border-gray-300">
                {currentMixture.map((chem, index) => (
                  <motion.div
                    key={`${chem.formula}-${index}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${100 / currentMixture.length}%` }}
                    className={`absolute bottom-0 w-full ${CHEMICAL_COLORS[chem.formula] || 'bg-blue-200'} rounded-b-full`}
                    style={{ 
                      bottom: `${(index * 100) / currentMixture.length}%`,
                      height: `${100 / currentMixture.length}%`
                    }}
                  />
                ))}
              </div>
              <div className="absolute -bottom-6 left-0 right-0 text-center">
                {currentMixture.map(chem => chem.formula).join(' + ')}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400"
            >
              Перетащите вещества сюда
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопка завершения */}
      <button
        onClick={onComplete}
        disabled={experimentResult?.completed}
        className={`mt-4 px-4 py-2 rounded-lg ${experimentResult?.completed ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'} text-white`}
      >
        {experimentResult?.completed ? 'Задание завершено' : 'Завершить эксперимент'}
      </button>

      {experimentResult && (
        <div className="mt-2 text-center">
          <p>Реакций проведено: {experimentResult.reactions}</p>
          <p className="font-bold">Оценка: {experimentResult.score}/10</p>
        </div>
      )}
    </div>
  );
};