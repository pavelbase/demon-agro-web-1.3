// Form Field Components with validation and accessibility
// Reusable form inputs with built-in error handling and ARIA support

'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { getErrorId, getDescriptionId } from '@/lib/utils/accessibility'

interface BaseFieldProps {
  label: string
  name: string
  error?: string
  description?: string
  required?: boolean
  className?: string
}

// Input Field
interface InputFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, name, error, description, required, className, ...props }, ref) => {
    const errorId = error ? getErrorId(name) : undefined
    const descriptionId = description ? getDescriptionId(name) : undefined
    
    return (
      <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="povinné">*</span>}
        </label>
        
        {description && (
          <p id={descriptionId} className="text-sm text-gray-600 mb-2">
            {description}
          </p>
        )}
        
        <input
          ref={ref}
          id={name}
          name={name}
          aria-invalid={!!error}
          aria-describedby={[errorId, descriptionId].filter(Boolean).join(' ') || undefined}
          aria-required={required}
          className={`
            w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors
            ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
          {...props}
        />
        
        {error && (
          <div id={errorId} className="flex items-center gap-1 mt-1 text-sm text-red-600" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }
)
InputField.displayName = 'InputField'

// Textarea Field
interface TextareaFieldProps extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, name, error, description, required, className, rows = 4, ...props }, ref) => {
    const errorId = error ? getErrorId(name) : undefined
    const descriptionId = description ? getDescriptionId(name) : undefined
    
    return (
      <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="povinné">*</span>}
        </label>
        
        {description && (
          <p id={descriptionId} className="text-sm text-gray-600 mb-2">
            {description}
          </p>
        )}
        
        <textarea
          ref={ref}
          id={name}
          name={name}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={[errorId, descriptionId].filter(Boolean).join(' ') || undefined}
          aria-required={required}
          className={`
            w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none
            ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
          {...props}
        />
        
        {error && (
          <div id={errorId} className="flex items-center gap-1 mt-1 text-sm text-red-600" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }
)
TextareaField.displayName = 'TextareaField'

// Select Field
interface SelectFieldProps extends BaseFieldProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, name, error, description, required, className, options, placeholder, ...props }, ref) => {
    const errorId = error ? getErrorId(name) : undefined
    const descriptionId = description ? getDescriptionId(name) : undefined
    
    return (
      <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="povinné">*</span>}
        </label>
        
        {description && (
          <p id={descriptionId} className="text-sm text-gray-600 mb-2">
            {description}
          </p>
        )}
        
        <select
          ref={ref}
          id={name}
          name={name}
          aria-invalid={!!error}
          aria-describedby={[errorId, descriptionId].filter(Boolean).join(' ') || undefined}
          aria-required={required}
          className={`
            w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors
            ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <div id={errorId} className="flex items-center gap-1 mt-1 text-sm text-red-600" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }
)
SelectField.displayName = 'SelectField'

// Checkbox Field
interface CheckboxFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, name, error, description, required, className, ...props }, ref) => {
    const errorId = error ? getErrorId(name) : undefined
    const descriptionId = description ? getDescriptionId(name) : undefined
    
    return (
      <div className={className}>
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            id={name}
            name={name}
            type="checkbox"
            aria-invalid={!!error}
            aria-describedby={[errorId, descriptionId].filter(Boolean).join(' ') || undefined}
            aria-required={required}
            className={`
              mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500
              ${error ? 'border-red-500' : ''}
              disabled:cursor-not-allowed
            `}
            {...props}
          />
          
          <div className="flex-1">
            <label htmlFor={name} className="text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1" aria-label="povinné">*</span>}
            </label>
            
            {description && (
              <p id={descriptionId} className="text-sm text-gray-600 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {error && (
          <div id={errorId} className="flex items-center gap-1 mt-1 ml-7 text-sm text-red-600" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }
)
CheckboxField.displayName = 'CheckboxField'
