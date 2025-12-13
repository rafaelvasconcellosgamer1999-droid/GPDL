// resources/js/Components/AutocompleteSearch.tsx
import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, X, Loader2 } from 'lucide-react';


// Interface base: O objeto TEM que ter id e nome, mas pode ter mais coisas (definido pelo Generics)
export interface OptionItem {
  id: string | number;
  nome: string;
}

// Props agora são genéricas
interface AutocompleteSearchProps<T extends OptionItem> {
  label?: string;
  placeholder?: string;
  value?: string | number | null;

  // O item selecionado deve respeitar o tipo T
  selectedItem?: T | null;

  options?: T[];
  error?: string;
  isLoading?: boolean;
  isDisabled?: boolean;

  onChange: (value: string | number | null) => void;
  // O callback retorna o objeto completo tipado corretamente como T
  onSelectOption?: (option: T | null) => void;

  onSearch: (query: string) => Promise<T[]>;
}

// O componente em si é uma função Genérica
export default function AutocompleteSearch<T extends OptionItem>({
  label,
  placeholder = 'Digite para buscar...',
  value = null,
  selectedItem: initialSelectedItem = null,
  options = [],
  error,
  isLoading = false,
  isDisabled = false,
  onChange,
  onSelectOption,
  onSearch,
}: AutocompleteSearchProps<T>) {

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // O estado interno agora sabe que é uma lista de T
  const [filteredOptions, setFilteredOptions] = useState<T[]>(options);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const debounceTimerRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Lógica de Busca (Debounce + Race Condition)
  useEffect(() => {
    const q = inputValue.trim();

    if (q.length < 3) {
      setFilteredOptions([]);
      setIsFetching(false);
      return;
    }

    if (selectedOption && inputValue === selectedOption.nome) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const timer = window.setTimeout(async () => {
      const reqId = ++requestIdRef.current;
      setIsFetching(true);
      try {
        const results = await onSearch(inputValue);
        if (reqId !== requestIdRef.current) return;
        if (!isMountedRef.current) return;
        setFilteredOptions(results);
        setHighlightIndex(0);
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error(err);
        setFilteredOptions([]);
      } finally {
        if (isMountedRef.current) setIsFetching(false);
      }
    }, 300);

    debounceTimerRef.current = timer;
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [inputValue, onSearch, options, selectedOption]);

  // Sincronização de Valor
  useEffect(() => {
    if (value === null || value === undefined || value === '') {
      setSelectedOption(null);
      if (!isOpen) setInputValue('');
      return;
    }

    const found =
      options.find((o) => String(o.id) === String(value)) ??
      filteredOptions.find((o) => String(o.id) === String(value)) ??
      (initialSelectedItem && String(initialSelectedItem.id) === String(value) ? initialSelectedItem : null);

    if (found) {
      setSelectedOption((prev) => {
        // Casting seguro ou comparação direta de ID
        if (prev && String(prev.id) === String(found.id)) return prev;
        return found;
      });
      if (!isOpen) setInputValue(found.nome);
    }
  }, [value, options, filteredOptions, initialSelectedItem, isOpen]);

  // Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (selectedOption) {
          setInputValue(selectedOption.nome);
        } else {
          setInputValue('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    setHighlightIndex(0);
    if (val === '') {
      setSelectedOption(null);
      onChange(null);
      if (onSelectOption) onSelectOption(null);
    }
  }

  function handleOptionSelect(option: T) {
    setSelectedOption(option);
    setInputValue(option.nome);
    onChange(option.id);
    if (onSelectOption) onSelectOption(option);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleClear() {
    setSelectedOption(null);
    setInputValue('');
    onChange(null);
    if (onSelectOption) onSelectOption(null);
    setFilteredOptions(options);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleToggleOpen() {
    if (isDisabled) return;
    setIsOpen((v) => {
      const next = !v;
      if (next) {
        if (inputValue.trim().length === 0) setFilteredOptions(options);
        inputRef.current?.focus();
      }
      return next;
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (isDisabled) return;
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1 >= filteredOptions.length ? filteredOptions.length - 1 : i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 < 0 ? 0 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightIndex >= 0 && filteredOptions[highlightIndex]) {
        handleOptionSelect(filteredOptions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue(selectedOption ? selectedOption.nome : '');
    }
  }

  const listboxId = `listbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div ref={containerRef} className={`relative w-full ${isDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {label && (
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}

      <div className="relative mt-1">
        <div
          className="gpdl-input-contrast flex items-center gap-2 px-3 py-2 rounded-md w-full transition-colors"
          style={{
            border: error
              ? '1px solid #ef4444'
              : isOpen
                ? '1px solid var(--brand-600)'
                : '1px solid transparent',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            disabled={isDisabled}

            value={inputValue}
            onChange={handleInputChange}
            onClick={() => !isOpen && handleToggleOpen()}
            onKeyDown={handleKeyDown}

            placeholder={placeholder}
            className="flex-1 outline-none text-sm bg-transparent truncate"
            style={{ color: 'var(--text-strong)' }}
            autoComplete="off"
          />

          {(isFetching || isLoading) && (
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--brand-600)' }} />
          )}

          {!isFetching && !isLoading && selectedOption && !isDisabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="p-0.5 hover:opacity-75 transition-opacity"
            >
              <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}

          {!isFetching && !isLoading && (
            <button
              type="button"
              onClick={handleToggleOpen}
              tabIndex={-1}
              className="p-0.5 focus:outline-none"
            >
              <ChevronDown
                className="h-4 w-4 transition-transform duration-200"
                style={{
                  color: 'var(--text-muted)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
          )}
        </div>

        {isOpen && !isDisabled && (
          <div
            id={listboxId}
            className="absolute top-full left-0 right-0 mt-1 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
            style={{
              background: 'var(--surface-muted)',
              border: '1px solid var(--gpdl-border)',
            }}
            role="listbox"
          >
            {filteredOptions.length > 0 ? (
              <ul className="py-1">
                {filteredOptions.map((option, idx) => {
                  const isSelected = String(option.id) === String(value);
                  const isHighlighted = idx === highlightIndex;
                  return (
                    <li
                      key={option.id}
                      role="option"
                      aria-selected={isSelected}
                      onMouseDown={(e) => { e.preventDefault(); handleOptionSelect(option); }}
                      onMouseEnter={() => setHighlightIndex(idx)}
                      className="cursor-pointer px-3 py-2 text-sm flex items-center justify-between"
                      style={{
                        backgroundColor: isHighlighted ? 'var(--surface-main)' : 'transparent',
                        color: isSelected ? 'var(--brand-600)' : 'var(--text-strong)',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      <span className="truncate">{option.nome}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-3 py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                {inputValue.trim().length < 3 && !isFetching
                  ? 'Digite ao menos 3 caracteres'
                  : 'Nenhuma opção encontrada'}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}