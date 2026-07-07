import React from 'react';


interface ButtonProps {
    variant: 'primary' | 'secondary';
    label?: string; // kept for backward compatibility
    icon?: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
}

export default function Button({
    variant,
    label,
    icon,
    href,
    onClick,
    disabled,
    children
}: ButtonProps) {
    const baseStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        height: '3rem',
        minWidth: '3rem',
        borderRadius: '0.75rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        gap: '0.5rem',
    };

    const primaryStyles: React.CSSProperties = {
        ...baseStyles,
        backgroundColor: 'var(--color-text)',
        color: 'var(--color-text-inverted)',
    };

    const iconContainer: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2rem',
        height: '2rem',
        borderRadius: '0.25rem',
    }

    const iconContainerPrimary: React.CSSProperties = {
        ...iconContainer,
        backgroundColor: 'var(--color-action)',
        color: 'var(--color-text)',
    };

    const secondaryStyles: React.CSSProperties = {
        ...baseStyles,
        backgroundColor: 'var(--color-card-bg)',
        color: 'var(--color-text)',
    };

    const iconContainerSecondary: React.CSSProperties = {
        ...iconContainer,
        backgroundColor: 'var(--color-text)',
        color: 'var(--color-text-inverted)',
    };


    const hoverStyles: React.CSSProperties = {
        transform: 'scale(1.05) rotate(-3deg)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    };

    const pressedStyles: React.CSSProperties = {
        transform: 'scale(0.95)',
    };

    const iconStyles: React.CSSProperties = {
        fontSize: '24px',
        lineHeight: 1,
    };

    const disabledStyles: React.CSSProperties = {
        opacity: 0.5,
        cursor: 'not-allowed',
    };

    const [isHovered, setIsHovered] = React.useState(false);
    const [isPressed, setIsPressed] = React.useState(false);
    const buttonStyles = variant === 'primary' ? primaryStyles : secondaryStyles;

    // Debug: log children to check what is passed in
    // Remove these logs after debugging
    if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.log('Button children:', children, 'label fallback:', label);
    }

    if (href) {
        return (
            <a
                className="button"
                href={href}
                style={{
                    ...buttonStyles,
                    ...(isHovered ? hoverStyles : {}),
                    ...(disabled ? disabledStyles : {}),
                    ...(isPressed ? pressedStyles : {}),
                }}
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
            >
                {(children) && <span style={{ paddingLeft: '8px', paddingRight: icon ? undefined : '8px' }} className="text-button">{children}</span>}
                {icon && children &&
                    <div style={variant === 'primary' ? iconContainerPrimary : iconContainerSecondary}>
                        <i className={`ph-bold ph-${icon}`} style={iconStyles} aria-hidden="true" />
                    </div>
                }
                {icon && !children &&
                    <i className={`ph-bold ph-${icon}`} style={iconStyles} aria-hidden="true" />
                }
            </a>
        );
    }

    return (
        <button
            className="button"
            style={{
                ...buttonStyles,
                ...(isHovered ? hoverStyles : {}),
                ...(disabled ? disabledStyles : {}),
                ...(isPressed ? pressedStyles : {}),
            }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
        >
            {(children) && <span style={{ paddingLeft: '8px', paddingRight: icon ? undefined : '8px' }} className="text-button">{children}</span>}
            {icon && children &&
                <div style={variant === 'primary' ? iconContainerPrimary : iconContainerSecondary}>
                    <i className={`ph-bold ph-${icon}`} style={iconStyles} aria-hidden="true" />
                </div>
            }
            {icon && !children &&
                <i className={`ph-bold ph-${icon}`} style={iconStyles} aria-hidden="true" />
            }
        </button>
    );
};
