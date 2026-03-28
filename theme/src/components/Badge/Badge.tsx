import React from 'react';
import { colors, borderRadius, typography } from '../../themes/default/index.js';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.brand.primaryLight,
          color: colors.brand.primary,
        };
      case 'success':
        return {
          backgroundColor: colors.semantic.successLight,
          color: colors.semantic.success,
        };
      case 'warning':
        return {
          backgroundColor: colors.semantic.warningLight,
          color: colors.semantic.warning,
        };
      case 'error':
        return {
          backgroundColor: colors.semantic.errorLight,
          color: colors.semantic.error,
        };
      case 'info':
        return {
          backgroundColor: colors.semantic.infoLight,
          color: colors.semantic.info,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.neutral.gray100,
          color: colors.text.secondary,
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.125rem 0.375rem',
          fontSize: typography.fontSize.xs,
        };
      case 'md':
      default:
        return {
          padding: '0.25rem 0.5rem',
          fontSize: typography.fontSize.sm,
        };
    }
  };

  const badgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.full,
    whiteSpace: 'nowrap',
    ...getVariantStyles(),
    ...getSizeStyles(),
  };

  return <span style={badgeStyles}>{children}</span>;
};

export default Badge;
