import { useState } from 'react';

interface ValidationError {
  [key: string]: string;
}

interface UseFormValidationReturn {
  errors: ValidationError;
  validateField: (field: string, value: any, rules: ValidationRules) => boolean;
  setFieldError: (field: string, error: string) => void;
  clearErrors: () => void;
  hasErrors: () => boolean;
}

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

export const useFormValidation = (): UseFormValidationReturn => {
  const [errors, setErrors] = useState<ValidationError>({});

  const validateField = (field: string, value: any, rules: ValidationRules): boolean => {
    let isValid = true;
    let errorMessage = '';

    if (rules.required && !value) {
      isValid = false;
      errorMessage = 'Este campo é obrigatório';
    } else if (rules.minLength && value.length < rules.minLength) {
      isValid = false;
      errorMessage = `Mínimo de ${rules.minLength} caracteres`;
    } else if (rules.maxLength && value.length > rules.maxLength) {
      isValid = false;
      errorMessage = `Máximo de ${rules.maxLength} caracteres`;
    } else if (rules.pattern && !rules.pattern.test(value)) {
      isValid = false;
      errorMessage = 'Formato inválido';
    } else if (rules.custom && !rules.custom(value)) {
      isValid = false;
      errorMessage = 'Valor inválido';
    }

    if (!isValid) {
      setErrors(prev => ({ ...prev, [field]: errorMessage }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    return isValid;
  };

  const setFieldError = (field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const hasErrors = () => {
    return Object.keys(errors).length > 0;
  };

  return {
    errors,
    validateField,
    setFieldError,
    clearErrors,
    hasErrors,
  };
};