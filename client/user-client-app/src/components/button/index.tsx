import { Button as HeroButton } from "@heroui/react";
import type React from "react";
import type { ReactNode } from "react";

type IconPosition = "start" | "end" | "only";

type Props = {
  children?: ReactNode | JSX.Element;
  icon?: ReactNode | string; // Может быть JSX-элементом или названием иконки
  iconPosition?: IconPosition;
  className?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | undefined;
  variant?: "solid" | "bordered" | "light" | "flat" | "ghost" | "shadow";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const Button: React.FC<Props> = ({
  children,
  icon,
  iconPosition = "start",
  className = "",
  type = "button",
  fullWidth = false,
  color = "default",
  variant = "light",
  size = "lg",
  isLoading = false,
  isDisabled = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Обработка иконки, если передано строковое название
  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === "string") {
      // Здесь можно добавить логику для строковых иконок (например, через react-icons)
      return <span className="icon-text">{icon}</span>;
    }
    
    return icon;
  };

  // Определяем контент в зависимости от позиции иконки
  const getButtonContent = () => {
    if (iconPosition === "only" && icon) {
      return renderIcon();
    }

    return (
      <>
        {iconPosition === "start" && renderIcon()}
        {children && <span className={icon ? (iconPosition === "start" ? "ml-2" : "mr-2") : ""}>
          {children}
        </span>}
        {iconPosition === "end" && renderIcon()}
      </>
    );
  };

  return (
    <HeroButton
      startContent={iconPosition === "start" ? renderIcon() : undefined}
      endContent={iconPosition === "end" ? renderIcon() : undefined}
      size={size}
      color={color}
      variant={variant}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
      type={type}
      isDisabled={isDisabled || isLoading}
      isLoading={isLoading}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {iconPosition !== "start" && iconPosition !== "end" ? getButtonContent() : children}
    </HeroButton>
  );
};