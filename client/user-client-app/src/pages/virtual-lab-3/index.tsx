import type React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Divider, 
  Button,
  Input,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@heroui/react';
import { FiCheck, FiInfo, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { ChemicalDropdown } from '../../components/chemical-dropdown';
import { Flask } from '../../components/flask';
import { MixingFlask } from '../../components/mixing-flask';
import type { ChemicalSubstance, ChemicalType } from '../../app/types';
import { 
  useFinishUserTaskAttemptMutation,
} from '../../app/services/taskApi';
import { useGetSelfAtemptQuery } from '../../app/services/resultsApi';

const TARGET_REACTIONS = [
  {
    reactants: ["NaOH", "HCl"],
    products: ["NaCl", "H₂O"],
    description: "Гидроксид натрия + соляная кислота",
    completed: false,
  },
  {
    reactants: ["CuSO₄", "2NaOH"],
    products: ["Na₂SO₄", "Cu(OH)₂↓"],
    description: "Сульфат меди(II) + гидроксид натрия",
    completed: false,
  },
  {
    reactants: ["CuSO₄", "2KOH"],
    products: ["K₂SO₄", "Cu(OH)₂↓"],
    description: "Сульфат меди(II) + гидроксид калия",
    completed: false,
  },
  {
    reactants: ["H₂SO₄", "2NaOH"],
    products: ["Na₂SO₄", "2H₂O"],
    description: "Серная кислота + гидроксид натрия",
    completed: false,
  },
  {
    reactants: ["H₂SO₄", "2KOH"],
    products: ["K₂SO₄", "2H₂O"],
    description: "Серная кислота + гидроксид калия",
    completed: false,
  },
  {
    reactants: ["HCl", "KOH"],
    products: ["KCl", "H₂O"],
    description: "Соляная кислота + гидроксид калия",
    completed: false,
  },
  {
    reactants: ["Cu(OH)₂", "H₂SO₄"],
    products: ["CuSO₄", "2H₂O"],
    description: "Гидроксид меди(II) + серная кислота",
    completed: false,
  },
  {
    reactants: ["ZnSO₄", "2NaOH"],
    products: ["Na₂SO₄", "Zn(OH)₂↓"],
    description: "Сульфат цинка + гидроксид натрия",
    completed: false,
  },
  {
    reactants: ["FeSO₄", "2NaOH"],
    products: ["Na₂SO₄", "Fe(OH)₂↓"],
    description: "Сульфат железа(II) + гидроксид натрия",
    completed: false,
  },
];

export const VirtualLab3: React.FC = () => {
  const navigate = useNavigate();
  const [finishAttempt] = useFinishUserTaskAttemptMutation();
  const { data: attemptsData } = useGetSelfAtemptQuery();
  
  // Состояния для эксперимента
  const [flasks, setFlasks] = useState<Array<{id: string; substance: ChemicalSubstance}>>([]);
  const [mixture, setMixture] = useState<ChemicalSubstance[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [isExperimentComplete, setIsExperimentComplete] = useState(false);
  const [completedReactions, setCompletedReactions] = useState(TARGET_REACTIONS.map(r => ({...r, completed: false})));
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [mixingFlaskKey, setMixingFlaskKey] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const boundsRef = useRef<HTMLDivElement>(null);

  // Проверяем есть ли завершенные попытки
  const hasCompletedAttempt = attemptsData?.some(
    attempt => attempt.task.id_task === 3 && attempt.status === 'completed'
  );

  // Устанавливаем начальное время из последней попытки (если есть)
  useEffect(() => {
    if (attemptsData) {
      const currentAttempt = attemptsData.find(
        attempt => attempt.task.id_task === 3 && attempt.status === 'in_progress'
      );
      
      if (currentAttempt?.attempts[0].date_start) {
        setStartTime(new Date(currentAttempt.attempts[0].date_start));
      }
    }
  }, [attemptsData]);

  // Таймер для отслеживания времени
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (startTime && !isExperimentComplete) {
      setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [startTime, isExperimentComplete]);

  // Проверка завершенных реакций
  useEffect(() => {
    if (mixture.length >= 2) {
      const newCompletedReactions = [...completedReactions];
      let updated = false;
      
      for (let i = 0; i < newCompletedReactions.length; i++) {
        const reaction = newCompletedReactions[i];
        if (!reaction.completed) {
          const hasProducts = reaction.products.every(p => 
            mixture.some(m => m.formula === p));
          
          if (hasProducts) {
            newCompletedReactions[i].completed = true;
            updated = true;
          }
        }
      }
      
      if (updated) {
        setCompletedReactions(newCompletedReactions);
      }
    }
  }, [mixture]);

  const handleSelectChemical = useCallback((type: ChemicalType, chemical: ChemicalSubstance) => {
    if (isExperimentComplete || hasCompletedAttempt) return;
    if (!startTime) setStartTime(new Date());
    
    const id = `flask-${Date.now()}`;
    setFlasks(prev => [...prev, { id, substance: chemical }]);
  }, [isExperimentComplete, startTime, hasCompletedAttempt]);

  const handleRemoveFlask = useCallback((id: string) => {
    setFlasks(prev => prev.filter(f => f.id !== id));
  }, []);

  const calculateScore = useCallback(() => {
    if (!startTime) return 0;
    
    const minutes = Math.floor(elapsedTime / 60);
    const flaskCount = flasks.length;
    const completedCount = completedReactions.filter(r => r.completed).length;
    let calculatedScore = Math.floor((completedCount / TARGET_REACTIONS.length) * 10);

    // Штраф за время (максимум -3 балла)
    if (minutes > 15) {
      const timePenalty = Math.min(3, Math.floor((minutes - 15) / 5));
      calculatedScore -= timePenalty;
    }

    // Штраф за лишние пробирки (максимум -3 балла)
    if (flaskCount > TARGET_REACTIONS.length * 2) {
      const flaskPenalty = Math.min(3, Math.floor((flaskCount - TARGET_REACTIONS.length * 2) / 2));
      calculatedScore -= flaskPenalty;
    }

    return Math.max(0, calculatedScore);
  }, [elapsedTime, flasks.length, startTime, completedReactions]);

  const handleCompleteExperiment = useCallback(async () => {
    if (isExperimentComplete || hasCompletedAttempt) return;
    
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setIsExperimentComplete(true);
    
    try {
      await finishAttempt({
        id_task: 3,
        score: calculatedScore,
        comment_user: comment
      }).unwrap();
    } catch (error) {
      console.error('Failed to finish attempt:', error);
    }
  }, [isExperimentComplete, calculateScore, comment, finishAttempt, hasCompletedAttempt]);

  const handleResetMixingFlask = useCallback(() => {
    if (hasCompletedAttempt) return;
    setMixture([]);
    setMixingFlaskKey(prev => prev + 1);
  }, [hasCompletedAttempt]);

  const handleDropToMixingFlask = useCallback((substance: ChemicalSubstance, id: string) => {
    if (isExperimentComplete || hasCompletedAttempt) return false;
    if (!startTime) setStartTime(new Date());
    
    setMixture(prev => [...prev, substance]);
    handleRemoveFlask(id);
    return true;
  }, [isExperimentComplete, startTime, handleRemoveFlask, hasCompletedAttempt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Показываем модальное окно при наличии завершенной попытки
  useEffect(() => {
    if (hasCompletedAttempt) {
      setShowCompletionModal(true);
    }
  }, [hasCompletedAttempt]);

  const allReactionsCompleted = completedReactions.every(r => r.completed);

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Модальное окно о завершенном задании */}
      <Modal isOpen={showCompletionModal} onClose={() => setShowCompletionModal(false)}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <FiAlertCircle className="text-warning" />
            <span>Задание уже выполнено</span>
          </ModalHeader>
          <ModalBody>
            <p>Вы уже успешно завершили это задание. Повторное выполнение невозможно.</p>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="primary" 
              onPress={() => navigate('/makeTask')}
            >
              Вернуться к списку заданий
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div className="flex flex-col bg-default-50 p-4 gap-4 h-[90vh]">

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
            <CardBody className="relative p-6 ">
              <div className="absolute inset-0 p-6 flex ">
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
              <h2 className="text-lg font-semibold">Задание: Реакции обмена</h2>
            </CardHeader>
            <Divider />
            <CardBody className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="font-medium">Цель:</h3>
                  <p className="text-default-600 text-sm">
                    Провести реакции обмена между:
                  </p>
                  <ul className="list-disc list-inside text-default-600 text-sm mt-1 space-y-1">
                    <li>Кислотами и щелочами</li>
                    <li>Солями и щелочами</li>
                    <li>Нерастворимыми основаниями и кислотами</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">Критерии оценки:</h3>
                  <ul className="list-disc list-inside text-default-600 text-sm space-y-1">
                    <li>Идеальное время: до 15 минут</li>
                    <li>Не более 2 пробирок на каждую реакцию</li>
                    <li>Необходимо провести все 9 реакций</li>
                  </ul>
                </div>

                <Divider />

                <div className="space-y-2">
                  <div className="max-h-60 overflow-y-auto pr-2">
                    <p className='mb-5'> Провести реакции:</p>
                    {TARGET_REACTIONS.map((reaction, index) => (
                      <Checkbox 
                        key={index}
                        isSelected={completedReactions[index].completed}
                        isDisabled
                        className="block mb-2"
                      >
                        {reaction.description}
                      </Checkbox>
                    ))}
                  </div>
                  <p className="text-default-600 text-sm">
                    Время: {startTime ? formatTime(elapsedTime) : '0:00'}
                  </p>
                  <p className="text-default-600 text-sm">
                    Прогресс: {completedReactions.filter(r => r.completed).length} / {TARGET_REACTIONS.length}
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
                    isDisabled={!allReactionsCompleted}
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