import { useEffect, useId, useRef, useState } from 'react'
import { searchPlaces } from '../../services/places.js'

// A search box that suggests places as you type.
//   value    : the chosen place ({ label, coordinates, ... }) or null
//   onChange : called with the chosen place, or with null when the text is edited again
// Works with keyboard (arrows, Enter, Escape) and screen readers.
export default function PlaceInput({ label, value, onChange, error, placeholder = 'Search a place' }) {
  const id = useId()
  const listId = `${id}-list`
  const wrapperRef = useRef(null)
  const timerRef = useRef(null)
  const abortRef = useRef(null)

  const [text, setText] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const shown = value ? value.label : text

  // Close the list when the person taps somewhere else
  useEffect(() => {
    function onPointerDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [])

  // Stop any waiting search when this field disappears
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      abortRef.current?.abort()
    }
  }, [])

  function scheduleSearch(query) {
    clearTimeout(timerRef.current)
    abortRef.current?.abort()

    if (query.trim().length < 3) {
      setResults([])
      setStatus('idle')
      return
    }

    // Wait until the person pauses typing, so we do not search on every key
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      setStatus('loading')
      try {
        const places = await searchPlaces(query.trim(), controller.signal)
        setResults(places)
        setActive(-1)
        setStatus('done')
      } catch (err) {
        if (err.name !== 'AbortError') setStatus('error')
      }
    }, 350)
  }

  function handleChange(e) {
    const next = e.target.value
    setText(next)
    setOpen(true)
    if (value) onChange(null) // editing again means the old choice no longer applies
    scheduleSearch(next)
  }

  function choose(place) {
    onChange(place)
    setText(place.label)
    setOpen(false)
    setResults([])
    setStatus('idle')
  }

  function clear() {
    clearTimeout(timerRef.current)
    abortRef.current?.abort()
    setText('')
    setResults([])
    setStatus('idle')
    onChange(null)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && open && active >= 0 && results[active]) {
      e.preventDefault()
      choose(results[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && !value && shown.trim().length >= 3
  const message =
    status === 'loading'
      ? 'Searching…'
      : status === 'error'
        ? 'Could not load places. Check your connection and try again.'
        : status === 'done' && results.length === 0
          ? 'No places found. Try a nearby landmark or area name.'
          : ''

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-option-${active}` : undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={shown}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={`h-12 w-full rounded-xl border bg-white pl-4 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
            error
              ? 'border-red-500 focus:ring-red-100'
              : 'border-slate-300 focus:border-brand-600 focus:ring-brand-100'
          }`}
        />

        {shown && (
          <button
            type="button"
            onClick={clear}
            aria-label={`Clear ${label}`}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-xl text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        )}
      </div>

      {showList && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {message && <p className="px-4 py-3 text-sm text-slate-500">{message}</p>}

          {results.length > 0 && (
            <ul id={listId} role="listbox" aria-label={`${label} suggestions`}>
              {results.map((place, i) => (
                <li
                  key={place.id}
                  id={`${id}-option-${i}`}
                  role="option"
                  aria-selected={i === active}
                  // mousedown (not click) so the choice is made before the field loses focus
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(place)
                  }}
                  className={`cursor-pointer px-4 py-3 ${i === active ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                >
                  <span className="block text-sm font-medium text-slate-900">{place.main}</span>
                  {place.secondary && <span className="block text-xs text-slate-500">{place.secondary}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}