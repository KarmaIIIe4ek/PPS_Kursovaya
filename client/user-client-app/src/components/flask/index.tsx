import type React from 'react';
import { motion } from 'framer-motion';
import type { ChemicalSubstance } from '../../app/types';
import { CHEMICAL_COLORS } from '../../enum/reactions';
import { Button, Tooltip } from '@heroui/react';
import { FiX, FiDroplet } from 'react-icons/fi';

export const Flask: React.FC<{
  chemical: ChemicalSubstance;
  onDragEnd: (position: { x: number; y: number }) => void;
  boundsRef: React.RefObject<HTMLDivElement>;
  onRemove: () => void;
}> = ({ chemical, onDragEnd, boundsRef, onRemove }) => {
  return (
    <motion.div
      drag
      dragConstraints={boundsRef}
      dragElastic={0.1}
      dragMomentum={false}
      onDragEnd={(_, info) => onDragEnd({ x: info.point.x, y: info.point.y })}
      className="flex flex-col items-center w-20 h-50 cursor-grab active:cursor-grabbing select-none"
      whileTap={{ scale: 1.05 }}
      whileHover={{ y: -5 }}
    >
      {/* Пробирка */}
      <div className="relative w-16 h-32">
        {/* Горлышко */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-4 bg-default-100 border-2 border-b-0 border-default-300 rounded-t-lg z-10" />
        
        {/* Основная часть */}
        <div className="absolute top-4 w-full h-28 bg-default-100 border-2 border-t-0 border-default-300 rounded-b-lg shadow-sm">
          {/* Жидкость */}
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            className={`absolute bottom-0 w-full ${CHEMICAL_COLORS[chemical.formula] || 'bg-primary-400'} rounded-b-md transition-colors duration-300`}
            style={{
              backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.1), transparent)'
            }}
          />
          
          {/* Эффект стекла */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-white bg-opacity-20 rounded-full filter blur-[1px]" />
          </div>
        </div>
      </div>
      
      {/* Подпись и кнопка удаления */}
      <Tooltip content={chemical.name} placement="bottom" delay={500}>
        <div className="mt-2 flex items-center bg-default-100 px-2 py-1 rounded-full shadow-sm border border-default-200">
          <FiDroplet className={`text-${CHEMICAL_COLORS[chemical.formula]?.replace('bg-', '') || 'primary'} mr-1`} />
          <span className="text-sm font-medium text-default-700 mr-1">
            {chemical.formula}
          </span>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-xs"
            aria-label="Remove flask"
          >
            <FiX />
          </Button>
        </div>
      </Tooltip>
    </motion.div>
  );
};