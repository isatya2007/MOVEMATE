import { useId, useState } from 'react'

// A labelled field with an error message and (for passwords) a Show/Hide button.
// text-base (16px) stops phones from zooming in when the field is tapped.
export default function Input({ label, error, hint, type = 'text', className = '', ...props }) {
  const id = useId()
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`h-12 w-full rounded-xl border bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
            isPassword ? 'pr-20' : ''
          } ${
            error
              ? 'border-red-500 focus:ring-red-100'
              : 'border-slate-300 focus:border-brand-600 focus:ring-brand-100'
          }`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 rounded-r-xl px-4 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
