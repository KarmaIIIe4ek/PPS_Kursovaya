import type React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { ChemicalSubstance, ChemicalType } from '../../app/types';
import { ChemicalDropdown } from '../../components/chemical-dropdown';
import { Flask } from '../../components/flask';
import { MixingFlask } from '../../components/mixing-flask';
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Button,
  Input,
  Checkbox
} from '@heroui/react';
import { FiCheck, FiInfo, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useFinishUserTaskAttemptMutation } from '../../app/services/taskApi';

export const VirtualLab: React.FC = () => {
  const navigate = useNavigate();
  const [finishAttempt] = useFinishUserTaskAttemptMutation();
  
  // Состояния для эксперимента
  const [flasks, setFlasks] = useState<Array<{id: string; substance: ChemicalSubstance}>>([]);
  const [mixture, setMixture] = useState<ChemicalSubstance[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [isExperimentComplete, setIsExperimentComplete] = useState(false);
  const [hasTargetProduct, setHasTargetProduct] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [mixingFlaskKey, setMixingFlaskKey] = useState<number>(0);
  const [comment, setComment] = useState('');
  const boundsRef = useRef<HTMLDivElement>(null);

  // Таймер для отслеживания времени
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (startTime && !isExperimentComplete) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [startTime, isExperimentComplete]);

  // Проверка наличия целевого продукта (NaCl)
  useEffect(() => {
    console.log(mixture)
    const hasNaCl = mixture.some(chem => chem.formula === '2NaCl');
    setHasTargetProduct(hasNaCl);
  }, [mixture]);

  const handleSelectChemical = useCallback((type: ChemicalType, chemical: ChemicalSubstance) => {
    if (isExperimentComplete) return;
    if (!startTime) setStartTime(new Date());
    
    const id = `flask-${Date.now()}`;
    setFlasks(prev => [...prev, { id, substance: chemical }]);
  }, [isExperimentComplete, startTime]);

  const handleRemoveFlask = useCallback((id: string) => {
    setFlasks(prev => prev.filter(f => f.id !== id));
  }, []);

  const calculateScore = useCallback(() => {
    if (!startTime) return 0;
    
    const minutes = Math.floor(elapsedTime / 60);
    const flaskCount = flasks.length;
    let calculatedScore = 10;

    // Штраф за время (максимум -4 балла)
    if (minutes > 10) {
      const timePenalty = Math.min(4, Math.floor((minutes - 10) / 10) * 2);
      calculatedScore -= timePenalty;
    }

    // Штраф за лишние пробирки (максимум -4 балла)
    if (flaskCount > 2) {
      const flaskPenalty = Math.min(4, flaskCount - 2);
      calculatedScore -= flaskPenalty;
    }

    return Math.max(0, calculatedScore);
  }, [elapsedTime, flasks.length, startTime]);

  const handleCompleteExperiment = useCallback(async () => {
    if (isExperimentComplete) return;
    
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setIsExperimentComplete(true);
    
    try {
      await finishAttempt({
        id_task: 1,
        score: calculatedScore,
        comment_user: comment
      }).unwrap();
    } catch (error) {
      console.error('Failed to finish attempt:', error);
    }
  }, [isExperimentComplete, calculateScore, comment, finishAttempt]);

  const handleResetMixingFlask = useCallback(() => {
    setMixture([]);
    setScore(null);
    setIsExperimentComplete(false);
    setFlasks([]);
    setStartTime(null);
    setElapsedTime(0);
    setComment('');
    setHasTargetProduct(false);
  }, []);

  const handleDropToMixingFlask = useCallback((substance: ChemicalSubstance, id: string) => {
    if (isExperimentComplete) return false;
    if (!startTime) setStartTime(new Date());
    
    setMixture(prev => [...prev, substance]);
    handleRemoveFlask(id);
    return true;
  }, [isExperimentComplete, startTime, handleRemoveFlask]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-default-50 p-4 gap-4 h-[100%]">

        <div className="grid grid-cols-5 gap-4">
          <ChemicalDropdown 
            type="simple" 
            onSelect={(chem) => handleSelectChemical('simple', chem)} 
            disabled={isExperimentComplete}
          />
          <ChemicalDropdown 
            type="oxides" 
            onSelect={(chem) => handleSelectChemical('oxides', chem)} 
            disabled={isExperimentComplete}
          />
          <ChemicalDropdown 
            type="acids" 
            onSelect={(chem) => handleSelectChemical('acids', chem)} 
            disabled={isExperimentComplete}
          />
          <ChemicalDropdown 
            type="salts" 
            onSelect={(chem) => handleSelectChemical('salts', chem)} 
            disabled={isExperimentComplete}
          />
          <ChemicalDropdown 
            type="hydroxides" 
            onSelect={(chem) => handleSelectChemical('hydroxides', chem)} 
            disabled={isExperimentComplete}
          />
        </div>

        <div className="flex gap-4 flex-1">
          <Card className="flex-1" ref={boundsRef}>
            <CardBody className="relative p-6 h-full">
              <div className="absolute inset-0 p-6 flex h-full">
                <div className="flex-1 grid grid-cols-6 gap-6 auto-rows-min content-start p-4">
                  {flasks.map(flask => (
                    <Flask 
                      key={flask.id}
                      chemical={flask.substance}
                      onDragEnd={(pos) => {
                        if (boundsRef.current && !isExperimentComplete) {
                          const mixingFlask = document.getElementById('mixing-flask');
                          if (mixingFlask) {
                            const flaskRect = mixingFlask.getBoundingClientRect();
                            if (pos.x >= flaskRect.left && pos.x <= flaskRect.right && 
                                pos.y >= flaskRect.top && pos.y <= flaskRect.bottom) {
                              handleDropToMixingFlask(flask.substance, flask.id);
                            }
                          }
                        }
                      }}
                      boundsRef={boundsRef}
                      onRemove={() => handleRemoveFlask(flask.id)}
                    />
                  ))}
                </div>

                <div className="absolute bottom-8 right-8 z-10">
                  <MixingFlask 
                    key={`mixing-flask-${mixingFlaskKey}`}
                    mixture={mixture} 
                    setMixture={setMixture}
                    onComplete={handleCompleteExperiment}
                    score={score}
                    isLocked={isExperimentComplete}
                  />
                  <Button
                    onClick={handleResetMixingFlask}
                    color="warning"
                    variant="flat"
                    startContent={<FiRefreshCw />}
                    className="mt-2 w-full"
                    size="sm"
                    disabled={isExperimentComplete}
                  >
                    Сбросить колбу
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="w-80 flex flex-col">
            <CardHeader className="flex items-center gap-2">
              <FiInfo className="text-secondary" />
              <h2 className="text-lg font-semibold">Задание: Реакция соединения</h2>
            </CardHeader>
            <Divider />
            <CardBody className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="font-medium">Цель:</h3>
                  <p className="text-default-600 text-sm">
                    Провести реакцию: Na + Cl<sub>2</sub> → NaCl
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Критерии оценки:</h3>
                  <ul className="list-disc list-inside text-default-600 text-sm space-y-1">
                    <li>Идеальное время: до 10 минут</li>
                    <li>Идеальное количество веществ: 2 (Na и Cl<sub>2</sub>)</li>
                    <li>Штраф за время: -2 балла за каждые 10 минут сверх лимита</li>
                    <li>Штраф за вещества: -1 балл за каждое лишнее вещество</li>
                  </ul>
                </div>

                <Divider />

                <div className="space-y-2">
                  <Checkbox 
                    isSelected={hasTargetProduct}
                    isDisabled
                  >
                    Получен NaCl
                  </Checkbox>
                  <p className="text-default-600 text-sm">
                    Время: {startTime ? formatTime(elapsedTime) : '0:00'}
                  </p>
                  <p className="text-default-600 text-sm">
                    Использовано пробирок: {flasks.length}
                  </p>
                </div>

                {!isExperimentComplete && (
                  <Input
                    label="Комментарий (необязательно)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-4"
                  />
                )}

                {isExperimentComplete && (
                  <div className="bg-warning-50 p-3 rounded-lg border border-warning-200 mt-4">
                    <h3 className="font-medium text-warning-800">Эксперимент завершен!</h3>
                    <p className="text-warning-600">
                      Оценка: {score}/10
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-default-200">
                {isExperimentComplete ? (
                  <Button
                    onClick={() => navigate('/makeTask')}
                    color="success"
                    variant="solid"
                    startContent={<FiCheck />}
                    className="w-full"
                  >
                    Просмотр результатов
                  </Button>
                ) : (
                  <Button
                    onClick={handleCompleteExperiment}
                    color="success"
                    variant="solid"
                    startContent={<FiCheck />}
                    className="w-full"
                    isDisabled={!hasTargetProduct}
                  >
                    Завершить эксперимент
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DndProvider>
  );
};