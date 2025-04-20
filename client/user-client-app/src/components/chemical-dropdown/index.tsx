import type React from 'react';
import { useState } from 'react';
import type { ChemicalType, ChemicalSubstance } from '../../app/types';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Chip,
  Badge
} from '@heroui/react';
import {
  FiDroplet,
  FiZap,
  FiLayers,
  FiAward
} from 'react-icons/fi';
import { SiOxygen } from 'react-icons/si';
import { GiAcid, GiChemicalDrop, GiStonePile } from 'react-icons/gi';

const CHEMICALS: Record<ChemicalType, ChemicalSubstance[]> = {
  simple: [
    { formula: 'Na', name: 'Натрий', type: 'simple' },
    { formula: 'Zn', name: 'Цинк', type: 'simple' },
    { formula: 'Fe', name: 'Железо', type: 'simple' },
    { formula: 'Cl₂', name: 'Хлор', type: 'simple' },
    { formula: 'H₂', name: 'Водород', type: 'simple' }
  ],
  acids: [
    { formula: 'H₂SO₄', name: 'Серная кислота', type: 'acids' },
    { formula: 'HCl', name: 'Соляная кислота', type: 'acids' }
  ],
  salts: [
    { formula: 'CuSO₄', name: 'Сульфат меди(II)', type: 'salts' },
    { formula: 'NaCl', name: 'Хлорид натрия', type: 'salts' },
    { formula: 'ZnSO₄', name: 'Сульфат цинка', type: 'salts' },
    { formula: 'FeSO₄', name: 'Сульфат железа(II)', type: 'salts' },
    { formula: 'K₂SO₄', name: 'Сульфат калия', type: 'salts' },
    { formula: 'Na₂SO₄', name: 'Сульфат натрия', type: 'salts' },
    { formula: 'ZnCl₂', name: 'Хлорид цинка', type: 'salts' },
    { formula: 'KCl', name: 'Хлорид калия', type: 'salts' }
  ],
  hydroxides: [
    { formula: 'NaOH', name: 'Гидроксид натрия', type: 'hydroxides' },
    { formula: 'KOH', name: 'Гидроксид калия', type: 'hydroxides' },
    { formula: 'Cu(OH)₂', name: 'Гидроксид меди(II)', type: 'hydroxides' },
    { formula: 'Ca(OH)₂', name: 'Гидроксид кальция', type: 'hydroxides' }
  ],
  oxides: [
    { formula: 'CaO', name: 'Оксид кальция', type: 'oxides' },
    { formula: 'CuO', name: 'Оксид меди(II)', type: 'oxides' },
    { formula: 'SO₃', name: 'Оксид серы(VI)', type: 'oxides' }
  ]
};

const typeIcons = {
  simple: <FiZap className="text-yellow-500" />,
  oxides: <SiOxygen  className="text-orange-500" />,
  acids: <GiAcid  className="text-red-500" />,
  salts: <GiStonePile  className="text-blue-500" />,
  hydroxides: <GiChemicalDrop  className="text-green-500" />
};

const typeColors = {
  simple: "warning",
  oxides: "secondary",
  acids: "danger",
  salts: "primary",
  hydroxides: "success"
} as const;

interface ChemicalDropdownProps {
  type: ChemicalType;
  onSelect: (chemical: ChemicalSubstance) => void;
  disabled: boolean;
}

export const ChemicalDropdown: React.FC<ChemicalDropdownProps> = ({ type, onSelect, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getTypeLabel = () => {
    switch(type) {
      case 'simple': return 'Простые вещества';
      case 'oxides': return 'Оксиды';
      case 'acids': return 'Кислоты';
      case 'salts': return 'Соли';
      case 'hydroxides': return 'Гидроксиды';
      default: return '';
    }
  };

  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen} isDisabled={disabled}>
      <DropdownTrigger>
        <Button 
          color={typeColors[type]}
          variant="flat"
          endContent={
            <div className="flex items-center gap-1">
              <Badge 
                content={CHEMICALS[type].length} 
                color='default'
                size="sm"
                shape="circle"
              />
              <span className="ml-1 text-sm">▼</span>
            </div>
          }
          className="min-w-[180px]"
        >
          <div className="flex items-center gap-2">
            {typeIcons[type]}
            {getTypeLabel()}
          </div>
        </Button>
      </DropdownTrigger>

      <DropdownMenu 
        aria-label="Chemical dropdown menu"
        className="max-h-60 overflow-y-auto w-[280px]"
      >
        {CHEMICALS[type].map((chem) => (
          <DropdownItem
            key={chem.formula}
            onPress={() => onSelect(chem)}
            textValue={chem.name}
            className="py-2"
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <Chip 
                  color={typeColors[type]} 
                  variant="dot"
                  size="sm"
                />
                <span className="font-medium">{chem.formula}</span>
              </div>
              <span className="text-default-500 text-sm">{chem.name}</span>
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};