import { Button as HeroButton } from "@heroui/react";
import type React from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { FiGithub, FiArrowRight } from "react-icons/fi";

type IconPosition = "start" | "end" | "only";

type Props = {
  children?: ReactNode | JSX.Element;
  icon?: ReactNode | string;
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
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  href?: string;
  external?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
  state?: Record<string, unknown>;
  replace?: boolean;
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
  href,
  external = false,
  target = "_self",
  state,
  replace = false,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }

    if (!href) return;

    // Для внешних ссылок или ссылок с http/https
    if (external || /^https?:\/\//.test(href)) {
      // Позволяем стандартному поведению ссылки работать
      if (external || target === "_blank") {
        return; // Пусть браузер сам обработает открытие
      }
      e.preventDefault();
      window.location.href = href; // Для случаев, когда target="_self"
      return;
    }

    // Для внутренних ссылок
    e.preventDefault();
    navigate(href, { state, replace });
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === "string") {
      // Обработка строковых иконок (например, можно добавить mapping)
      switch (icon) {
        case "github":
          return <FiGithub />;
        case "arrow-right":
          return <FiArrowRight />;
        default:
          return <span className="icon-text">{icon}</span>;
      }
    }
    
    return icon;
  };

  const getButtonContent = () => {
    if (iconPosition === "only" && icon) {
      return renderIcon();
    }

    return (
      <>
        {iconPosition === "start" && renderIcon()}
        {children && (
          <span className={icon ? (iconPosition === "start" ? "ml-2" : "mr-2") : ""}>
            {children}
          </span>
        )}
        {iconPosition === "end" && renderIcon()}
      </>
    );
  };

  // Определяем, является ли ссылка абсолютным URL
  const isAbsoluteUrl = href ? /^https?:\/\//.test(href) : false;

  // Если есть href, рендерим как ссылку
  if (href) {
    return (
      <HeroButton
        as="a"
        href={isAbsoluteUrl || external ? href : "#"}
        target={isAbsoluteUrl || external ? target : "_self"}
        rel={isAbsoluteUrl || external ? "noopener noreferrer" : undefined}
        startContent={iconPosition === "start" ? renderIcon() : undefined}
        endContent={iconPosition === "end" ? renderIcon() : undefined}
        size={size}
        color={color}
        variant={variant}
        className={`${fullWidth ? "w-full" : ""} ${className}`}
        isDisabled={isDisabled || isLoading}
        isLoading={isLoading}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {iconPosition !== "start" && iconPosition !== "end" ? getButtonContent() : children}
      </HeroButton>
    );
  }

  // Обычная кнопка
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
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {iconPosition !== "start" && iconPosition !== "end" ? getButtonContent() : children}
    </HeroButton>
  );
};