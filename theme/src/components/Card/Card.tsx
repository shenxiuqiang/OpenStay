import React from 'react';
import { colors, borderRadius, shadows, spacing, typography } from '../../themes/default/index.js';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  onClick,
  style,
  header,
  footer,
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.background.primary,
          border: `1px solid ${colors.border.light}`,
          boxShadow: 'none',
        };
      case 'elevated':
        return {
          backgroundColor: colors.background.elevated,
          border: 'none',
          boxShadow: shadows.lg,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.background.primary,
          border: `1px solid ${colors.border.light}`,
          boxShadow: shadows.sm,
        };
    }
  };

  const getPaddingStyles = (): React.CSSProperties => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: spacing.sm };
      case 'lg':
        return { padding: spacing.lg };
      case 'md':
      default:
        return { padding: spacing.md };
    }
  };

  const cardStyles: React.CSSProperties = {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'box-shadow 200ms ease-in-out, transform 200ms ease-in-out',
    ...getVariantStyles(),
    ...getPaddingStyles(),
    ...style,
  };

  const hoverStyles: React.CSSProperties = hoverable ? {
    ':hover': {
      boxShadow: shadows.md,
      transform: 'translateY(-2px)',
    },
  } as React.CSSProperties : {};

  return (
    <div
      style={{ ...cardStyles, ...hoverStyles }}
      onClick={onClick}
    >
      {header && (
        <div style={{
          padding: padding === 'none' ? 0 : spacing.md,
          borderBottom: `1px solid ${colors.border.light}`,
          marginBottom: padding === 'none' ? 0 : spacing.md,
        }}>
          {header}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div style={{
          padding: padding === 'none' ? 0 : spacing.md,
          borderTop: `1px solid ${colors.border.light}`,
          marginTop: padding === 'none' ? 0 : spacing.md,
        }}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
