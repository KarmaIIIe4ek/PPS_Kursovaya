import { DropdownItem as HeroDropdownItem } from "@heroui/react";
import type React from "react";
import type { ReactNode } from "react";

type DropdownItemWithIconProps = {
  children?: ReactNode; // Делаем children опциональным, так как будем использовать text
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  isDisabled?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  key?: React.Key;
  text?: string; // Добавляем пропс text
};

export const DropdownItemWithIcon: React.FC<DropdownItemWithIconProps> = ({
  children,
  icon,
  iconPosition = "left",
  className = "",
  color = "default",
  isDisabled = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  key,
  text, // Добавляем text в параметры
  ...rest
}) => {
  const renderContent = () => (
    <div className={`flex items-center gap-2 ${iconPosition === "right" ? "flex-row-reverse" : ""}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{text || children}</span> {/* Используем text или children */}
    </div>
  );

  return (
    <HeroDropdownItem
      key={key}
      className={className}
      color={color}
      isDisabled={isDisabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...rest}
    >
      {renderContent()}
    </HeroDropdownItem>
  );
};