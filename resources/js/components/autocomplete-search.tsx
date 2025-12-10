import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

type OptionItem = { id: string | number; nome: string };

interface AutocompleteSearchProps {
  placeholder?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  onSearch: (query: string) => Promise<OptionItem[]>;
  options?: OptionItem[];
  error?: string;
  label?: string;
  isLoading?: boolean;
}

export default function AutocompleteSearch({
  placeholder = 'Digite para buscar...',
  value,
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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Buscar opções quando o usuário digita
  useEffect(() => {
    if (inputValue.trim().length === 0) {
      setFilteredOptions(options);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsFetching(true);
      try {
        const results = await onSearch(inputValue);
        setFilteredOptions(results);
      } catch (error) {
        console.error('Erro ao buscar opções:', error);
        setFilteredOptions([]);
      } finally {
        setIsFetching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [inputValue, onSearch, options]);

  // Encontrar a opção selecionada atual
  useEffect(() => {
    if (value) {
      const found = [...options, ...filteredOptions].find(
        (opt) => String(opt.id) === String(value)
      );
      if (found && found.nome !== selectedOption?.nome) {
        setSelectedOption(found);
        setInputValue(found.nome);
      }
    } else {
      setSelectedOption(null);
      if (!isOpen) {
        setInputValue('');
      }
    }
  }, [value, options, filteredOptions, selectedOption, isOpen]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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
  }

  function handleOptionSelect(option: OptionItem) {
    setSelectedOption(option);
    onChange(option.id);
    setInputValue(option.nome);
    setIsOpen(false);
  }

  function handleClear() {
    setSelectedOption(null);
    setInputValue('');
    onChange('');
    setFilteredOptions(options);
    inputRef.current?.focus();
  }

  function handleFocus() {
    setIsOpen(true);
    if (inputValue === '' && options.length > 0) {
      setFilteredOptions(options);
    }
  }

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
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-strong)' }}
            autoComplete="off"
          />

          {isFetching && (
            <div className="animate-spin">
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
            >
              <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}

          {!isFetching && (
            <ChevronDown
              className="h-4 w-4 transition-transform"
              style={{
                color: 'var(--text-muted)',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
            style={{
              background: 'var(--surface-elevate)',
              border: '1px solid var(--gpdl-border)',
            }}
          >
            {filteredOptions.length > 0 ? (
              <ul className="py-1">
                {filteredOptions.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => handleOptionSelect(option)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition"
                      style={{
                        color:
                          String(option.id) === String(value)
                            ? 'var(--brand-600)'
                            : 'var(--text-strong)',
                        backgroundColor:
                          String(option.id) === String(value)
                            ? 'var(--surface-muted)'
                            : 'transparent',
                        fontWeight:
                          String(option.id) === String(value)
                            ? 600
                            : 400,
                      }}
                    >
                      {option.nome}
                    </button>
                  </li>
                ))}
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
