// resources/js/Components/AutocompleteSearch.tsx
import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

type OptionItem = { id: string | number; nome: string };

interface AutocompleteSearchProps {
  placeholder?: string;
  value?: string | number | null;
  onChange: (value: string | number | null) => void;
  onSearch: (query: string) => Promise<OptionItem[]>;
  options?: OptionItem[];
  error?: string;
  label?: string;
  isLoading?: boolean;
}

export default function AutocompleteSearch({
  placeholder = 'Digite para buscar...',
  value = null,
  onChange,
  onSearch,
  options = [],
  error,
  label,
  isLoading = false,
}: AutocompleteSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<OptionItem[]>(options);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OptionItem | null>(null);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // refs para debounce e request tracking
  const debounceTimerRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // sincronizar options prop inicial
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Buscar opções com debounce e proteção contra race
  useEffect(() => {
    // se input vazio, usa options passadas
    if (inputValue.trim().length === 0) {
      setFilteredOptions(options);
      setIsFetching(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const timer = window.setTimeout(async () => {
      const reqId = ++requestIdRef.current;
      setIsFetching(true);
      try {
        const results = await onSearch(inputValue);
        // ignora se não for a resposta mais recente
        if (reqId !== requestIdRef.current) return;
        if (!isMountedRef.current) return;
        setFilteredOptions(results);
        setHighlightIndex(0);
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error('Erro ao buscar opções:', err);
        setFilteredOptions([]);
      } finally {
        if (!isMountedRef.current) return;
        setIsFetching(false);
      }
    }, 300);

    debounceTimerRef.current = timer;

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, onSearch]); // options não precisa re-disparar a busca por cada mudança

  // Sincronizar value externo para selectedOption e inputValue
  useEffect(() => {
    if (value === null || value === undefined || value === '') {
      setSelectedOption(null);
      if (!isOpen) setInputValue('');
      return;
    }

    // procura primeiro em `options`, depois em `filteredOptions`
    const found =
      options.find((o) => String(o.id) === String(value)) ??
      filteredOptions.find((o) => String(o.id) === String(value));

    if (found) {
      setSelectedOption((prev) => {
        if (prev && String(prev.id) === String(found.id)) return prev;
        return found;
      });
      setInputValue(found.nome);
    }
  }, [value, options, filteredOptions, isOpen]);

  // fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    setHighlightIndex(0);
  }

  function handleOptionSelect(option: OptionItem) {
    setSelectedOption(option);
    onChange(option.id);
    setInputValue(option.nome);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleClear() {
    setSelectedOption(null);
    setInputValue('');
    onChange(null);
    setFilteredOptions(options);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleFocus() {
    setIsOpen(true);
    // Carregar opções iniciais ao focar
    if (inputValue.trim().length === 0) {
      if (options.length > 0) {
        setFilteredOptions(options);
      } else {
        // busca vazia (se desejar que onSearch suporte fetch inicial)
        setIsFetching(true);
        const reqId = ++requestIdRef.current;
        onSearch('')
          .then((results) => {
            if (reqId !== requestIdRef.current) return;
            if (!isMountedRef.current) return;
            setFilteredOptions(results);
            setHighlightIndex(0);
          })
          .catch(() => {
            if (!isMountedRef.current) return;
            setFilteredOptions([]);
          })
          .finally(() => {
            if (!isMountedRef.current) return;
            setIsFetching(false);
          });
      }
    }
  }

  function handleToggleOpen() {
    setIsOpen((v) => {
      const next = !v;
      if (next) {
        // abrir -> garantir sugestões atualizadas
        if (inputValue.trim().length === 0) {
          setFilteredOptions(options);
        }
      }
      return next;
    });
    inputRef.current?.focus();
  }

  // Navegação por teclado
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      setHighlightIndex(0);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => {
        const next = i + 1;
        return next >= filteredOptions.length ? filteredOptions.length - 1 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => {
        const next = i - 1;
        return next < 0 ? 0 : next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightIndex >= 0 && highlightIndex < filteredOptions.length) {
        handleOptionSelect(filteredOptions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  const listboxId = `autocomplete-list-${Math.random().toString(36).slice(2, 9)}`;
  const activeId =
    highlightIndex >= 0 && highlightIndex < filteredOptions.length
      ? `opt-${String(filteredOptions[highlightIndex].id)}`
      : undefined;

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}

      <div className="relative mt-1">
        <div
          className="gpdl-input-contrast flex items-center gap-2 px-3 py-2 rounded-md w-full"
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
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeId}
            aria-busy={isFetching || isLoading}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 outline-none text-sm"
            style={{ color: 'var(--text-strong)', background: 'var(--surface-elevate)' }}
            autoComplete="off"
          />

          {(isFetching || isLoading) && (
            <div className="animate-spin" aria-hidden="true" title="Buscando">
              <div
                className="h-4 w-4 border-2 border-transparent rounded-full"
                style={{
                  borderTopColor: 'var(--brand-600)',
                  borderRightColor: 'var(--brand-600)',
                }}
              />
            </div>
          )}

          {selectedOption && !isOpen && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-200 rounded-sm transition"
              aria-label="Limpar seleção"
            >
              <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}

          {!isFetching && (
            <button
              type="button"
              onClick={handleToggleOpen}
              aria-label={isOpen ? 'Fechar opções' : 'Abrir opções'}
              className="p-1"
              style={{ background: 'transparent', border: 'none' }}
            >
              <ChevronDown
                className="h-4 w-4 transition-transform"
                style={{
                  color: 'var(--text-muted)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            id={listboxId}
            className="absolute top-full left-0 right-0 mt-1 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
            style={{
              background: 'var(--surface-muted)',
              border: '1px solid var(--gpdl-border)',
            }}
            role="listbox"
            aria-label={label ?? 'Opções'}
          >
            {filteredOptions.length > 0 ? (
              <ul>
                {filteredOptions.map((option, idx) => {
                  const isSelected = String(option.id) === String(value);
                  const isHighlighted = idx === highlightIndex;
                  return (
                    <li key={option.id}>
                      <button
                        id={`opt-${String(option.id)}`}
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(e) => {
                          // usar onMouseDown para evitar perder o foco antes do click
                          e.preventDefault();
                          handleOptionSelect(option);
                        }}
                        onMouseEnter={() => setHighlightIndex(idx)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition"
                        style={{
                          color: isSelected ? 'var(--brand-600)' : 'var(--text-strong)',
                          backgroundColor: isHighlighted
                            ? 'var(--surface-main)'
                            : 'var(--surface-muted)',
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        {option.nome}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div
                className="px-3 py-4 text-center text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                {isFetching ? 'Buscando...' : 'Nenhuma opção encontrada'}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}
    </div>
  );
}
