import React from 'react';


interface ButtonProps {
    variant: 'primary' | 'secondary' | 'tertiary';
    label?: string; // kept for backward compatibility
    icon?: string;
    href?: string;
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;
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

    const tertiaryStyles: React.CSSProperties = {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: 'var(--color-text)',
        width: 'fit-content',
    };

    const iconContainerTertiary: React.CSSProperties = {
        ...iconContainer,
        backgroundColor: 'transparent',
        color: 'var(--color-text)',
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

    const hoverStyles = variant === 'primary' ? hoverStylesPrimary : variant === 'secondary' ? hoverStylesSecondary : hoverStylesTertiary;

    const iconStyles: React.CSSProperties = {
        fontSize: '24px',
        lineHeight: 1,
    };

    const disabledStyles: React.CSSProperties = {
        opacity: 0.5,
        cursor: 'not-allowed',
    };

    const [isHovered, setIsHovered] = React.useState(false);
    const buttonStyles = variant === 'primary' ? primaryStyles : variant === 'secondary' ? secondaryStyles : tertiaryStyles;


    if (href) {
        return (
            <a
                className="button"
                href={href}
                target={target}
                rel={rel}
                style={{
                    ...buttonStyles,
                    ...(isHovered ? hoverStyles : {}),
                    ...(disabled ? disabledStyles : {}),
                }}
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {(children) && <span style={{ paddingLeft: '8px', paddingRight: icon ? undefined : '8px' }} className="text-button">{children}</span>}
                {icon && children &&
                    <div style={variant === 'primary' ? iconContainerPrimary : variant === 'secondary' ? iconContainerSecondary : iconContainerTertiary}>
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
            type="button"
            className="button"
            style={{
                ...buttonStyles,
                ...(isHovered ? hoverStyles : {}),
                ...(disabled ? disabledStyles : {}),
            }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {(children) && <span style={{ paddingLeft: '8px', paddingRight: icon ? undefined : '8px' }} className="text-button">{children}</span>}
            {icon && children &&
                <div style={variant === 'primary' ? iconContainerPrimary : variant === 'secondary' ? iconContainerSecondary : iconContainerTertiary}>
                    <i className={`ph-bold ph-${icon}`} style={iconStyles} aria-hidden="true" />
                </div>
            }
            {icon && !children &&
                <i className={`ph-bold ph-${icon}`} style={iconStyles} aria-hidden="true" />
            }
        </button>
    );
};