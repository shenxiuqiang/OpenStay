import React from 'react';
import { colors, borderRadius, shadows, typography, transitions } from '../../themes/default/index.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.brand.primary,
          color: colors.text.inverse,
          border: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: colors.brand.secondary,
          color: colors.text.inverse,
          border: 'none',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: colors.brand.primary,
          border: `1px solid ${colors.brand.primary}`,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: colors.text.primary,
          border: 'none',
        };
      case 'danger':
        return {
          backgroundColor: colors.semantic.error,
          color: colors.text.inverse,
          border: 'none',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.375rem 0.75rem',
          fontSize: typography.fontSize.sm,
        };
      case 'lg':
        return {
          padding: '0.75rem 1.5rem',
          fontSize: typography.fontSize.lg,
        };
      case 'md':
      default:
        return {
          padding: '0.5rem 1rem',
          fontSize: typography.fontSize.base,
        };
    }
  };

  const buttonStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.md,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: transitions.normal,
    width: fullWidth ? '100%' : 'auto',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <button
      style={buttonStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="button-spinner">⟳</span>}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
