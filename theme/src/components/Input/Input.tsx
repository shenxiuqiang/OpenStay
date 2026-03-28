import React from 'react';
import { colors, borderRadius, typography, spacing } from '../../themes/default/index.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  };

  const inputWrapperStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    border: `1px solid ${error ? colors.semantic.error : colors.border.medium}`,
    backgroundColor: disabled ? colors.neutral.gray100 : colors.background.primary,
    transition: 'border-color 200ms ease-in-out, box-shadow 200ms ease-in-out',
  };

  const inputStyles: React.CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: typography.fontSize.base,
    color: disabled ? colors.text.disabled : colors.text.primary,
    width: '100%',
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: error ? colors.semantic.error : colors.text.tertiary,
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <div style={inputWrapperStyles}>
        {leftIcon}
        <input
          style={inputStyles}
          disabled={disabled}
          {...props}
        />
        {rightIcon}
      </div>
      {(helperText || error) && (
        <span style={helperTextStyles}>{error || helperText}</span>
      )}
    </div>
  );
};

export default Input;
