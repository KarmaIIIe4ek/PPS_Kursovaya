import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChemicalSubstance } from '../../app/types';
import { CHEMICAL_COLORS } from '../../enum/reactions';
import { checkReaction } from '../../logic/chemicalEngine';
import type { ChemicalReaction } from '../../logic/chemicalReactions';
import {
  Button,
  Chip,
  Progress,
  Tooltip
} from '@heroui/react';
import { FiTrash2, FiCheck, FiPower } from 'react-icons/fi';
import { FaFlask } from 'react-icons/fa';

const REACTION_DURATIONS = {
  'instant': 0.3,
  'fast': 3,
  'moderate': 20,
  'slow': 60,
  'very slow': 1800
};

export const MixingFlask: React.FC<{
  mixture: ChemicalSubstance[];
  setMixture: (newMixture: ChemicalSubstance[]) => void;
  onComplete: () => void;
  score: number | null;
  isLocked?: boolean;
}> = ({ mixture, setMixture, onComplete, score, isLocked = false }) => {
  const [isReacting, setIsReacting] = React.useState(false);
  const [isHeating, setIsHeating] = React.useState(false);
  const [currentReaction, setCurrentReaction] = React.useState<ChemicalReaction | null>(null);
  const [reactionInfo, setReactionInfo] = React.useState<{
    description: string;
    progress: number;
  } | null>(null);
  const animationFrameRef = React.useRef<number>();
  const reactionTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Функция для переключения горелки
  const toggleHeating = () => {
    if (isLocked) return; // Блокируем при isLocked
    setIsHeating(!isHeating);
    if (!isHeating && currentReaction) {
      const requiresHeat = ['moderate', 'slow', 'very slow'].includes(currentReaction.duration);
      if (requiresHeat) {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
        setIsReacting(false);
        setCurrentReaction(null);
        setReactionInfo(null);
      }
    }
  };

  const getReactionDuration = (duration: keyof typeof REACTION_DURATIONS) => {
    const baseDuration = REACTION_DURATIONS[duration];
    return isHeating ? baseDuration / 3 : baseDuration;
  };

  const handleClear = () => {
    if (isLocked) return; // Блокируем при isLocked
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    
    animationFrameRef.current = undefined;
    reactionTimeoutRef.current = undefined;
  
    setReactionInfo(null);
    setCurrentReaction(null);
    setIsReacting(false);
    setMixture([]);
    setIsHeating(false); 
  };

  const handleComplete = () => {
    if (isLocked) return; // Блокируем при isLocked
    onComplete();
  };

  const checkNonReactingLayers = () => {
    if (mixture.length < 2) return false;
    for (let i = 0; i < mixture.length; i++) {
      for (let j = i + 1; j < mixture.length; j++) {
        const substances = [mixture[i].formula, mixture[j].formula];
        if (checkReaction(substances)) {
          return false;
        }
      }
    }
    return true;
  };

  const shouldShowLayers = checkNonReactingLayers();

  const renderLiquid = () => {
    if (shouldShowLayers) {
      return mixture.filter(chem => !chem.formula.includes('↓')).map((chem, index) => {
        const layerHeight = 100 / mixture.length;
        const layerBottom = index * layerHeight;
        
        return (
          <motion.div
            key={`layer-${chem.formula}-${index}`}
            initial={{ height: 0 }}
            animate={{ 
              height: `${layerHeight}%`,
              bottom: `${layerBottom}%`
            }}
            className={`absolute w-full ${CHEMICAL_COLORS[chem.formula.replace(/[↑↓]/g, '')] || 'bg-blue-300'}`}
            style={{
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
              zIndex: mixture.length - index,
              borderTop: index > 0 ? '1px solid rgba(255,255,255,0.3)' : 'none'
            }}
            transition={{ duration: 0.5 }}
          />
        );
      });
    } else {
      return mixture.filter(chem => !chem.formula.includes('↓')).map((chem, index) => (
        <motion.div
          key={`liquid-${chem.formula}-${index}`}
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          className={`absolute top-0 w-full ${CHEMICAL_COLORS[chem.formula.replace(/[↑↓]/g, '')] || 'bg-blue-300'}`}
          style={{ 
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
            zIndex: index,
            opacity: 0.9 - (index * 0.2)
          }}
        />
      ));
    }
  }

  const hasPrecipitate = mixture.some(chem => chem.formula.includes('↓'));
  const hasGas = mixture.some(chem => chem.formula.includes('↑'));

  const formatFormula = (formula: string) => {
    if (formula.includes('↑')) return <span className="text-blue-600">{formula}</span>;
    if (formula.includes('↓')) return <span className="text-green-600">{formula}</span>;
    return formula;
  };

  const completeReaction = (reaction: ChemicalReaction) => {
    const newSubstances = reaction.products.map(p => {
      const cleanFormula = p.replace(/[↑↓]/g, '');
      return mixture.find(m => m.formula === cleanFormula) || 
        { formula: p, name: cleanFormula, type: 'salts' };
    });
    
    setMixture(newSubstances);
    setIsReacting(false);
    setCurrentReaction(null);
    setReactionInfo(prev => prev ? { ...prev, progress: 1 } : null);
  };

  const startNewReaction = (reaction: ChemicalReaction) => {
    const requiresHeat = ['moderate', 'slow', 'very slow'].includes(reaction.duration);
    if (requiresHeat && !isHeating) {
      // Реакция требует нагрева, но горелка выключена - не запускаем
      return false;
    }
    // Очистка предыдущих анимаций
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);

    setIsReacting(true);
    setCurrentReaction(reaction);
    setReactionInfo({
      description: reaction.description,
      progress: 0
    });

    const duration = REACTION_DURATIONS[reaction.duration] * 1000;
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / duration);
      setReactionInfo(prev => prev ? { ...prev, progress } : null);

      if (now < endTime) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        completeReaction(reaction);
      }
    };

    if (reaction.duration === 'instant') {
      completeReaction(reaction);
    } else {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
      reactionTimeoutRef.current = setTimeout(() => {
        completeReaction(reaction);
      }, duration);
    }
  };

  const checkAndStartReaction = (substances: string[]) => {
    const reaction = checkReaction(substances);
    if (reaction) {
      startNewReaction(reaction);
      return true;
    }
    return false;
  };

  // Эффект для обработки реакций
  React.useEffect(() => {
    if (mixture.length < 1) {
      // Если смесь пуста, сбрасываем все состояния
      if (isReacting) {
        setIsReacting(false);
        setCurrentReaction(null);
        setReactionInfo(null);
      }
      return;
    }

    const substances = mixture.map(m => m.formula);
    
    // Если реакция уже идет
    if (isReacting) {
      // Проверяем, возможна ли новая реакция с обновленной смесью
      const hasNewReaction = checkAndStartReaction(substances);
      
      // Если новой реакции нет, продолжаем текущую
      if (!hasNewReaction && currentReaction) {
        // Проверяем, остались ли реагенты текущей реакции в смеси
        const hasAllReagents = currentReaction.reactants.every(reactant => 
          substances.includes(reactant)
        );
        
        // Если каких-то реагентов нет, прерываем реакцию
        if (!hasAllReagents) {
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
          setIsReacting(false);
          setCurrentReaction(null);
          setReactionInfo(null);
        }
      }
    } else {
      // Если реакции нет, просто проверяем новую
      checkAndStartReaction(substances);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    };
  }, [mixture, isHeating]);

  // Анимация пузырьков газа
  const renderGasBubbles = () => {
    if (!hasGas) return null;

    return (
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-15" style={{zIndex:15}}>
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute bg-white rounded-full opacity-70"
            initial={{ 
              bottom: '10%',
              left: `${15 + Math.random() * 70}%`,
              width: `${5 + Math.random() * 6}px`,
              height: `${5 + Math.random() * 6}px`,
              opacity: 0.5 + Math.random() * 0.5
            }}
            animate={{
              bottom: '100%',
              opacity: 0,
              transition: {
                duration: 1 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "linear"
              }
            }}
          />
        ))}
      </div>
    );
  };

  // Анимация осадка
  const renderPrecipitate = () => {
    if (!hasPrecipitate) return null;

    return (
      <motion.div
        className="absolute bottom-0 w-full z-15"
        style={{zIndex:15}}
        initial={{ height: 0 }}
        animate={{ height: '10%' }}
        transition={{ duration: 1 }}
      >
        <div className="absolute bottom-0 w-full h-full bg-gray-300 bg-opacity-80 rounded-t-full">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute bg-white rounded-full opacity-80"
              style={{
                width: `${1 + Math.random() * 3}px`,
                height: `${1 + Math.random() * 3}px`,
                bottom: `${Math.random() * 70}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  // Анимация испарения
  const renderVapor = () => {
    if (!hasGas) return null;

    return (
      <div className="absolute left-0 w-full h-full overflow-hidden" style={{zIndex:15}}>
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`vapor-${i}`}
            className="absolute bg-white rounded-full blur-sm z-15"
            initial={{ 
              top: '60%',
              left: `${30 + Math.random() * 20}%`,
              width: `${10 + Math.random() * 20}px`,
              height: `${5 + Math.random() * 10}px`,
              opacity: 0
            }}
            animate={{
              top: '-10%',
              opacity: [0, 0.7, 0],
              transition: {
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeOut"
              }
            }}
          />
        ))}
      </div>
    );
  };

  const renderBurnerFlame = () => {
    if (!isHeating) return null;

    return (
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-16 h-16">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`flame-${i}`}
            className="absolute bg-orange-500 rounded-full"
            initial={{
              bottom: '0%',
              left: `${10 + i * 15}%`,
              width: `${10 + Math.random() * 10}px`,
              height: '20px',
              opacity: 0.7
            }}
            animate={{
              height: [`${20 + Math.random() * 20}px`, `${10 + Math.random() * 10}px`],
              opacity: [0.7, 0.9, 0.7],
              transition: {
                duration: 0.5 + Math.random(),
                repeat: Infinity,
                repeatType: 'reverse'
              }
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div id="mixing-flask" className="relative w-50 h-[200] flex flex-col items-center">
      <Chip 
        color={isLocked ? "default" : "primary"}
        variant="flat" 
        startContent={<FaFlask className={isLocked ? "text-default" : "text-primary"} />}
        className="mb-4 select-none pointer-events-none touch-none"
        draggable="false"
      >
        {isLocked ? "Колба заблокирована" : "Колба для смешивания"}
      </Chip>
      
      <div className="relative w-36 h-64">
        <div className="absolute top-0 left-1/2 transform bg-opacity-60 -translate-x-1/2 w-10 h-8 bg-blue-100 border-2 border-b-0 border-t-0 border-default-300" />
        
        <div className={`absolute top-8 w-full h-56 bg-blue-100 ${isLocked ? "bg-opacity-30" : "bg-opacity-60"}`} 
              style={{ clipPath: 'polygon(36% 0%, 64% 0%, 100% 100%, 0% 100%)' }}>
          
          <AnimatePresence>
            {renderLiquid()}
          </AnimatePresence>

          {renderPrecipitate()}
          {renderGasBubbles()}
          {renderVapor()}
        </div>

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-8 left-0 border-l-2 border-default-300 h-[88%]"
            style={{
              width: '36%',
              transform: 'skewX(-13deg)',
              transformOrigin: 'left bottom'
            }}
          />
          
          <div className="absolute top-8 right-0 h-[88%] border-r-2 border-default-300"
            style={{
              width: '36%',
              transform: 'skewX(13deg)',
              transformOrigin: 'right bottom'
            }}
          />
          
          <div className="absolute bottom-0 left-0 w-full border-b-2 border-default-300" />
        </div>

        {renderBurnerFlame()}

        {reactionInfo && (
          <div className="absolute -bottom-8 left-0 right-0">
            <Progress 
              value={reactionInfo.progress * 100} 
              color="success" 
              size="sm"
              className="w-full"
            />
          </div>
        )}
      </div>

      {reactionInfo && (
        <Tooltip content={reactionInfo.description} placement="bottom">
          <Chip 
            color="warning" 
            variant="flat" 
            className="mt-2 max-w-[200px] truncate"
          >
            {reactionInfo.description} ({Math.round(reactionInfo.progress * 100)}%)
          </Chip>
        </Tooltip>
      )}

      <div className="mt-4 text-center min-h-8">
        {mixture.length > 0 && (
          <Chip variant="dot" color="primary" className="px-3">
            {mixture.map((chem, index) => (
              <span key={chem.formula}>
                {formatFormula(chem.formula)}
                {index < mixture.length - 1 && <span className="mx-1">+</span>}
              </span>
            ))}
          </Chip>
        )}
      </div>

      <Button
        onClick={toggleHeating}
        color={isHeating ? "warning" : "default"}
        variant="flat"
        startContent={<FiPower />}
        className="mt-4"
        disabled={isLocked}
      >
        {isHeating ? 'Выключить горелку' : 'Включить горелку'}
      </Button>
    </div>
  );
};