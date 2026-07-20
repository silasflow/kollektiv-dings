import React from "react";

interface ButtonProps {
  variant: "primary" | "secondary" | "tertiary";
  label?: string;
  icon?: string;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function Button({
  variant,
  label,
  icon,
  href,
  target,
  rel,
  type = "button",
  onClick,
  disabled = false,
  children,
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.5rem",
    height: "3rem",
    minWidth: "3rem",
    borderRadius: "0.75rem",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    gap: "0.5rem",
  };

  const primaryStyles: React.CSSProperties = {
    ...baseStyles,
    backgroundColor: "var(--color-text)",
    color: "var(--color-text-inverted)",
  };

  const iconContainer: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2rem",
    height: "2rem",
    borderRadius: "0.25rem",
  };

  const iconContainerPrimary: React.CSSProperties = {
    ...iconContainer,
    backgroundColor: "var(--color-action)",
    color: "var(--color-text)",
  };

  const secondaryStyles: React.CSSProperties = {
    ...baseStyles,
    backgroundColor: "var(--color-card-bg)",
    color: "var(--color-text)",
  };

  const iconContainerSecondary: React.CSSProperties = {
    ...iconContainer,
    backgroundColor: "var(--color-text)",
    color: "var(--color-text-inverted)",
  };

  const tertiaryStyles: React.CSSProperties = {
    ...baseStyles,
    backgroundColor: "transparent",
    color: "var(--color-text)",
    width: "fit-content",
  };

  const iconContainerTertiary: React.CSSProperties = {
    ...iconContainer,
    backgroundColor: "transparent",
    color: "var(--color-text)",
  };

  const hoverStylesPrimary: React.CSSProperties = {
    outline: "2px solid var(--color-action)",
  };

  const hoverStylesSecondary: React.CSSProperties = {
    outline: "2px solid var(--color-text)",
  };

  const hoverStylesTertiary: React.CSSProperties = {
    backgroundColor: "var(--color-card-bg)",
  };

  const hoverStyles =
    variant === "primary"
      ? hoverStylesPrimary
      : variant === "secondary"
        ? hoverStylesSecondary
        : hoverStylesTertiary;

  const iconStyles: React.CSSProperties = {
    fontSize: "24px",
    lineHeight: 1,
  };

  const disabledStyles: React.CSSProperties = {
    opacity: 0.5,
    cursor: "not-allowed",
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const buttonStyles =
    variant === "primary"
      ? primaryStyles
      : variant === "secondary"
        ? secondaryStyles
        : tertiaryStyles;

  const iconBoxStyles =
    variant === "primary"
      ? iconContainerPrimary
      : variant === "secondary"
        ? iconContainerSecondary
        : iconContainerTertiary;

  const content = (
    <>
      {(children ?? label) && (
        <span
          style={{ paddingLeft: "8px", paddingRight: icon ? undefined : "8px" }}
          className="text-button"
        >
          {children ?? label}
        </span>
      )}

      {icon && (children ?? label) ? (
        <div style={iconBoxStyles}>
          <i
            className={`ph-bold ph-${icon}`}
            style={iconStyles}
            aria-hidden="true"
          />
        </div>
      ) : icon ? (
        <i
          className={`ph-bold ph-${icon}`}
          style={iconStyles}
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        className="button"
        href={disabled ? undefined : href}
        target={target}
        rel={rel}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        style={{
          ...buttonStyles,
          ...(isHovered && !disabled ? hoverStyles : {}),
          ...(disabled ? disabledStyles : {}),
        }}
        onClick={disabled ? (event) => event.preventDefault() : onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className="button"
      disabled={disabled}
      style={{
        ...buttonStyles,
        ...(isHovered && !disabled ? hoverStyles : {}),
        ...(disabled ? disabledStyles : {}),
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {content}
    </button>
  );
}
