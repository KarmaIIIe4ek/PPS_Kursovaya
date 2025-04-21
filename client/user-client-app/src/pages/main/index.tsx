import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import {
  Navbar,
  Button as HeroButton,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Image,
  Avatar,
  Chip,
  Progress,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Badge,
  Accordion,
  AccordionItem,
  Snippet,
  Link,
  Input,
  Checkbox
} from '@heroui/react';
import {
  FiHome,
  FiUser,
  FiStar,
  FiTrendingUp,
  FiLayers,
  FiCode,
  FiDatabase,
  FiCloud,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiPlayCircle,
  FiGithub,
  FiMail,
  FiPhone
} from 'react-icons/fi';
import { FaFlask, FaAtom, FaVial, FaTelegram, FaVk } from 'react-icons/fa';
import { SiReact, SiTypescript, SiNodedotjs, SiPostgresql, SiDocker } from 'react-icons/si';
import { Button } from '../../components/button';
import watermark from '../../public/images/watermark.svg'
import lab_img from '../../public/images/photo-1532094349884-543bc11b234d.jpg'

// Анимационные конфиги
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } }
};

const slideInFromLeft = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const slideInFromRight = {
  hidden: { opacity: 0, x: 50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const ButtonCustom = ({ children, ...props }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("show");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={scaleUp}
    >
      <HeroButton {...props}>
        {children}
      </HeroButton>
    </motion.div>
  );
};

export const Main = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const techRef = useRef(null);
  const experimentsRef = useRef(null);

  const isFeaturesInView = useInView(featuresRef, { once: true });
  const isStatsInView = useInView(statsRef, { once: true });
  const isTechInView = useInView(techRef, { once: true });
  const isExperimentsInView = useInView(experimentsRef, { once: true });

  const featuresControls = useAnimation();
  const statsControls = useAnimation();
  const techControls = useAnimation();
  const experimentsControls = useAnimation();

  useEffect(() => {
    if (isFeaturesInView) featuresControls.start("show");
    if (isStatsInView) statsControls.start("show");
    if (isTechInView) techControls.start("show");
    if (isExperimentsInView) experimentsControls.start("show");
  }, [isFeaturesInView, isStatsInView, isTechInView, isExperimentsInView]);

  const features = [
    {
      title: "Виртуальные эксперименты",
      icon: <FaVial className="text-2xl" />,
      description: "Проводите химические опыты в безопасной цифровой среде"
    },
    {
      title: "Автоматическая оценка",
      icon: <FiCheckCircle className="text-2xl" />,
      description: "Система анализирует правильность выполнения и выставляет оценку"
    },
    {
      title: "Управление группами",
      icon: <FiUser className="text-2xl" />,
      description: "Преподаватели могут создавать группы и отслеживать прогресс"
    },
    {
      title: "Реалистичное моделирование",
      icon: <FaAtom className="text-2xl" />,
      description: "Точное воспроизведение химических реакций и свойств веществ"
    }
  ];

  const stats = [
    { label: "Студентов", value: "5K+", change: "+18% за год" },
    { label: "Преподавателей", value: "200+", change: "+10%  за год" },
    { label: "Проведенных опытов", value: "20K+", change: "+35%  за год" },
    { label: "Учебных заведений", value: "100+", change: "+15%  за год" }
  ];

  const technologies = [
    { name: "React", icon: <SiReact />, color: "primary", progress: 95 },
    { name: "TypeScript", icon: <SiTypescript />, color: "secondary", progress: 90 },
    { name: "Node.js", icon: <SiNodedotjs />, color: "success", progress: 85 },
    { name: "PostgreSQL", icon: <SiPostgresql />, color: "warning", progress: 80 },
    { name: "Docker", icon: <SiDocker />, color: "danger", progress: 75 }
  ];

  const experiments = [
    { name: "Реакции соединения", complexity: 2, time: "15 мин" },
    { name: "Реакции разложения", complexity: 3, time: "20 мин" },
    { name: "Реакции обмена", complexity: 5, time: "25 мин" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-default-50 to-default-100">
      {/* Герой-секция */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="relative z-10"
              initial="hidden"
              animate="show"
              variants={slideInFromLeft}
            >
              <Badge color="primary" variant="flat" className="mb-4">
                <FiStar className="mr-2" /> Версия 1.0
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Виртуальная лаборатория для 
                <span className="text-primary"> химических опытов</span>
              </h1>
              <p className="text-xl text-default-600 mb-8">
                Инновационная платформа для проведения безопасных химических экспериментов 
                с автоматической оценкой результатов и детальной аналитикой.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  endIcon={<FiArrowRight />}
                  className="px-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg"
                  href='/auth'
                >
                  Попробовать демо
                </Button>
                <Button 
                  variant="flat" 
                  size="lg" 
                  endIcon={<FiGithub />}
                  className="px-8"
                  as="a"
                  href="https://github.com/KarmaIIIe4ek/PPS_Kursovaya" 
                  target="_blank"
                >
                  Исходный код
                </Button>
              </div>
            </motion.div>
            <motion.div 
              className="relative"
              initial="hidden"
              animate="show"
              variants={slideInFromRight}
            >
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute top-0 left-1/2 w-72 h-72 bg-danger rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
              <div className="relative rounded-2xl bg-white dark:bg-default-100 shadow-2xl overflow-hidden border border-default-200">
              <Image
                src={lab_img}
                alt="Виртуальная лаборатория"
                className="w-full h-auto"
              />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Секция возможностей */}
      <section id="features" className="py-20 bg-default-50" ref={featuresRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            animate={featuresControls}
            variants={fadeIn}
          >
            <Chip color="primary" variant="dot" className="mb-4">
              Возможности
            </Chip>
            <h2 className="text-4xl font-bold mb-4">
              Почему выбирают нашу платформу
            </h2>
            <p className="text-xl text-default-600 max-w-3xl mx-auto">
              Современное решение для безопасного и эффективного обучения химии
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            animate={featuresControls}
            variants={container}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={item}>
                <Card 
                  isHoverable 
                  isPressable 
                  className="transition-all hover:scale-105 h-full"
                >
                  <CardHeader className="flex flex-col items-center">
                    <div className="p-4 rounded-full bg-primary-100 text-primary-500">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardBody className="text-center">
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-default-600">{feature.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Секция статистики */}
      <section 
        className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
        ref={statsRef}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            animate={statsControls}
            variants={container}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                variants={item}
              >
                <p className="text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-lg mb-1">{stat.label}</p>
                <p className='text-green-500 text-lg font-bold'>
                  {stat.change}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Секция технологий */}
      <section id="tech" className="py-20" ref={techRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col lg:flex-row gap-12 items-center"
            initial="hidden"
            animate={techControls}
            variants={container}
          >
            <motion.div className="lg:w-1/2" variants={item}>
              <Chip color="secondary" variant="dot" className="mb-4">
                Технологии
              </Chip>
              <h2 className="text-4xl font-bold mb-6">
                Современный стек технологий
              </h2>
              <p className="text-xl text-default-600 mb-8">
                Мы используем проверенные и инновационные технологии для обеспечения 
                максимальной производительности и надежности платформы.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {technologies.map((tech, index) => (
                  <Tooltip key={index} content={tech.name} color={tech.color}>
                    <Button 
                      isIconOnly 
                      variant="flat" 
                      color={tech.color}
                      className="text-2xl"
                    >
                      {tech.icon}
                    </Button>
                  </Tooltip>
                ))}
              </div>
              
              <Accordion variant="splitted">
                <AccordionItem 
                  key="1" 
                  title="Фронтенд" 
                  subtitle="React, TypeScript, HeroUI"
                >
                  <div className="flex flex-wrap gap-2">
                    <Snippet color="primary">React 18</Snippet>
                    <Snippet color="secondary">TypeScript</Snippet>
                    <Snippet color="success">HeroUI</Snippet>
                  </div>
                </AccordionItem>
                <AccordionItem 
                  key="2" 
                  title="Бэкенд" 
                  subtitle="Node.js, PostgreSQL, Sequelize"
                >
                  <div className="flex flex-wrap gap-2">
                    <Snippet color="primary">Node.js</Snippet>
                    <Snippet color="secondary">PostgreSQL</Snippet>
                    <Snippet color="success">Sequelize</Snippet>
                  </div>
                </AccordionItem>
              </Accordion>
            </motion.div>
            
            <motion.div className="lg:w-1/2" variants={item}>
              <Card className="border border-default-200">
                <CardBody>
                  <Tabs aria-label="Tech stack">
                    <Tab key="frontend" title="Фронтенд">
                      <div className="space-y-4">
                      {technologies.slice(0, 3).map((tech, index) => (
                        <Progress 
                          key={index}
                          value={tech.progress} 
                          label={tech.name} 
                          color={tech.color} 
                          showValueLabel 
                        />
                      ))}
                      </div>
                    </Tab>
                    <Tab key="backend" title="Бэкенд">
                      <div className="space-y-4">
                        {technologies.slice(3).map((tech, index) => (
                          <Progress 
                            key={index}
                            value={tech.progress}                   
                            label={tech.name} 
                            color={tech.color} 
                            showValueLabel 
                          />
                        ))}
                      </div>
                    </Tab>
                  </Tabs>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Секция экспериментов */}
      <section id="experiments" className="py-20 bg-default-50" ref={experimentsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            animate={experimentsControls}
            variants={fadeIn}
          >
            <Chip color="warning" variant="dot" className="mb-4">
              Эксперименты
            </Chip>
            <h2 className="text-4xl font-bold mb-4">
              Доступные химические опыты
            </h2>
            <p className="text-xl text-default-600 max-w-3xl mx-auto">
              Реалистичное моделирование химических реакций с автоматической оценкой
            </p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate={experimentsControls}
            variants={container}
          >
            <Table aria-label="Примеры экспериментов">
              <TableHeader>
                <TableColumn>Название</TableColumn>
                <TableColumn>Сложность</TableColumn>
                <TableColumn>Время выполнения</TableColumn>
              </TableHeader>
              <TableBody>
              {experiments.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>
                    <motion.div
                      variants={item}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {exp.name}
                    </motion.div>
                  </TableCell>
                  <TableCell>
                    <motion.div
                      variants={item}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i} 
                            className={i < exp.complexity ? "text-yellow-500" : "text-default-300"} 
                          />
                        ))}
                      </div>
                    </motion.div>
                  </TableCell>
                  <TableCell>
                    <motion.div
                      variants={item}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <FiClock />
                        <span>{exp.time}</span>
                      </div>
                    </motion.div>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </motion.div>
        </div>
      </section>

      {/* CTA секция */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeIn}
          >
            <h2 className="text-4xl font-bold mb-6">
              Готовы начать экспериментировать?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Присоединяйтесь к тысячам студентов и преподавателей, использующих нашу платформу
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                color="white" 
                size="lg" 
                endIcon={<FiArrowRight />}
                className="px-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg"
                href='/auth'
              >
                Зарегистрироваться
              </Button>
              <Button 
                variant="flat" 
                size="lg" 
                endIcon={<FiGithub />}
                className="px-8 text-white"
                href="https://github.com/KarmaIIIe4ek/PPS_Kursovaya" 
                target="_blank"
              >
                Исходный код
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-default-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            initial="hidden"
            animate="show"
            variants={container}
          >
            <motion.div variants={item}>
              <div className="flex items-center mb-4">
                <FaFlask className="text-primary text-2xl mr-2" />
                <p className="font-bold text-inherit">Виртуальная лаборатория</p>
              </div>
              <p className="text-default-600 mb-4">
                Инновационная платформа для химических экспериментов
              </p>
              <div className="flex gap-4">
                <Button 
                  isIconOnly 
                  variant="light" 
                  href="https://github.com/KarmaIIIe4ek/PPS_Kursovaya" 
                  target="_blank"
                >
                  <FiGithub />
                </Button>
              </div>
            </motion.div>
            
            <motion.div variants={item}>
              <h3 className="font-semibold text-lg mb-4">Платформа</h3>
              <ul className="space-y-2">
                <li><Link color="foreground" href="#features">Возможности</Link></li>
                <li><Link color="foreground" href="#tech">Технологии</Link></li>
                <li><Link color="foreground" href="#experiments">Эксперименты</Link></li>
              </ul>
            </motion.div>
            
            <motion.div variants={item}>
              <h3 className="font-semibold text-lg mb-4">Разработка</h3>
              <ul className="space-y-2">
              <li><Button 
                  variant="light" 
                  href="https://github.com/KarmaIIIe4ek/PPS_Kursovaya" 
                  target="_blank"
                >
                  Github
                </Button></li>
              </ul>
            </motion.div>
            
            <motion.div variants={item}>
              <h3 className="font-semibold text-lg mb-4">Контакты</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FiMail />
                  <Link href="mailto:nik.yuragin2016@yandex.ru" color="foreground">
                    nik.yuragin2016@yandex.ru
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone />
                  <Link href="tel:+79385041041" color="foreground">
                    +7 (938) 504-10-41
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <FaTelegram />
                  <Link href="https://t.me/YuraginNV" target="_blank" color="foreground">
                    Telegram
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <FaVk />
                  <Link href="https://vk.com/karmaiiie4ek" target="_blank" color="foreground">
                    ВКонтакте
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <Divider className="my-8" />
          
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center"
            initial="hidden"
            animate="show"
            variants={fadeIn}
          >
            <p className="text-default-600 mb-4 md:mb-0">
              © 2025 ВиртЛаб. Все права защищены.
            </p>
            <div className="flex gap-4">
              <Link color="foreground" size="sm">Условия</Link>
              <Link color="foreground" size="sm">Конфиденциальность</Link>
            </div>
          </motion.div>
        </div>
      </footer>
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '20vw', // Регулируйте размер по необходимости
          height: '20vh',
          zIndex: 0,
          opacity: 0.1, // Регулируйте прозрачность здесь
          backgroundImage: `url(${watermark})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right bottom',
          backgroundSize: 'contain'
        }}
      />
    </div>
  );
};