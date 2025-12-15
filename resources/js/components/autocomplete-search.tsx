import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, X, Loader2 } from 'lucide-react';
// createPortal foi removido

export interface OptionItem {
  id: string | number;
  nome: string;
  cpf?: string;
  cpf_cnpj?: string;
}

interface AutocompleteSearchProps<T extends OptionItem> {
  label?: string;
  placeholder?: string;
  value?: string | number | null;
  selectedItem?: T | null;
  options?: T[];
  error?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  allowCreate?: boolean;

  onSearchError?: (error: unknown) => void; 

  onChange: (value: string | number | null) => void;
  onSelectOption?: (option: T | null) => void;
  onSearch: (query: string) => Promise<T[]>;
}

export default function AutocompleteSearch<T extends OptionItem>({
  label,
  placeholder = 'Digite para buscar...',
  value = null,
  selectedItem: initialSelectedItem = null,
  options = [],
  error,
  isLoading = false,
  isDisabled = false,
  allowCreate = false,
  onChange,
  onSelectOption,
  onSearch,
  onSearchError,
}: AutocompleteSearchProps<T>) {

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<T[]>(options);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  // portalStyle foi removido

  const inputRef = useRef<HTMLInputElement | null>(null);
  // containerRef é a referência principal, agora é onde o dropdown será renderizado
  const containerRef = useRef<HTMLDivElement | null>(null); 
  // inputContainerVisualRef e portalRef foram removidos
  
  const debounceTimerRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  const listboxId = useRef(`listbox-${Math.random().toString(36).substr(2, 9)}`).current;
  const getOptionId = (id: string | number) => `${listboxId}-option-${id}`;


  // --- EFEITO DE MONTAR/DESMONTAR (Cleanup) ---
  useEffect(() => {
    isMountedRef.current = true;
    // Lógica de Portals removida
    
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);


  // --- EFEITO DE BUSCA (Debounce e Race Condition) ---
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
        setFilteredOptions([]);
        onSearchError?.(err);
      } finally {
        if (isMountedRef.current) setIsFetching(false);
      }
    }, 300);

    debounceTimerRef.current = timer;
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [inputValue, onSearch, selectedOption, onSearchError]);


  // --- EFEITO DE SINCRONIZAÇÃO DE VALOR EXTERNO ---
  useEffect(() => {
    if (allowCreate) return;
    if (document.activeElement === inputRef.current) return; 

    if (value === null || value === undefined) {
      if (!isOpen) setInputValue('');
      setSelectedOption(null);
      return;
    }

    const found =
      options.find(o => String(o.id) === String(value)) ??
      filteredOptions.find(o => String(o.id) === String(value)) ??
      (initialSelectedItem && String(initialSelectedItem.id) === String(value)
        ? initialSelectedItem
        : null);

    if (found && !isOpen) {
      setSelectedOption(found);
      setInputValue(found.nome);
    }
  }, [value, options, filteredOptions, initialSelectedItem, isOpen, allowCreate]);

  // --- EFEITO PARA CÁLCULO DE POSIÇÃO DO PORTAL (REMOVIDO) ---
  // Lógica de posicionamento via Portal foi removida

  // --- EFEITO DE CLICK OUTSIDE ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);

        if (!allowCreate) {
          if (selectedOption && inputValue !== selectedOption.nome) {
            setInputValue(selectedOption.nome);
          } else if (!selectedOption && inputValue !== '') {
            setInputValue('');
            onChange(null); 
            if (onSelectOption) onSelectOption(null);
          }
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption, inputValue, allowCreate, onChange, onSelectOption]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    setHighlightIndex(0);

    if (val === '') {
      setSelectedOption(null);
      if (allowCreate) onChange('');
      else onChange(null); 
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
    if (allowCreate) onChange('');
    else onChange(null);
    
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
      } else {
        setIsOpen(false);
        if (!allowCreate) {
          if (selectedOption) setInputValue(selectedOption.nome);
          else {
            setInputValue('');
            onChange(null); 
          }
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      if (!allowCreate && selectedOption) setInputValue(selectedOption.nome);
    }
  }

  const activeDescendantId = 
    isOpen && highlightIndex >= 0 && filteredOptions[highlightIndex]
    ? getOptionId(filteredOptions[highlightIndex].id)
    : undefined;

  return (
    // O containerRef agora é o contêiner de posicionamento do dropdown
    <div ref={containerRef} className={`relative w-full ${isDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {label && (
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}

      {/* Este div relativo é importante para o alinhamento correto, especialmente do dropdown */}
      <div className="relative mt-1">
        <div
          // Removido ref={inputContainerVisualRef}
          className="gpdl-input-contrast flex items-center gap-2 px-3 py-2 rounded-md w-full transition-colors"
          style={{
            border: error ? '1px solid #ef4444' : isOpen ? '1px solid var(--brand-600)' : '1px solid var(--gpdl-border)',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeDescendantId} 
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

          {!isFetching && !isLoading && inputValue.length > 0 && !isDisabled && (
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
        
        {/* DROPDOWN RENDERIZADO DIRETAMENTE (SEM PORTAL) */}
        {isOpen && !isDisabled && (
            <div
                id={listboxId}
                // Adicionando as classes de posicionamento absoluto
                className="absolute left-0 right-0 mt-1 z-50 rounded-md shadow-lg max-h-60 overflow-y-auto"
                style={{
                    // width: '100%' é garantido pelo right-0 left-0, 
                    // mas pode ser mantido se necessário.
                    background: 'var(--surface-muted)',
                    border: '1px solid var(--gpdl-border)',
                    top: '100%', // Posiciona abaixo do elemento pai
                }}
                role="listbox"
            >
                {filteredOptions.length > 0 ? (
                    <ul className="py-1">
                        {filteredOptions.map((option, idx) => {
                            const isSelected = selectedOption?.id === option.id;
                            const isHighlighted = idx === highlightIndex;
                            const optionId = getOptionId(option.id);
                            
                            return (
                                <li
                                    key={option.id}
                                    id={optionId}
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
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="truncate">{option.nome}</span>
                                        {(option.cpf || option.cpf_cnpj) && (
                                            <span className="text-[10px] opacity-60" style={{ color: 'var(--text-muted)' }}>
                                                {option.cpf || option.cpf_cnpj}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="px-3 py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        {inputValue.trim().length < 3 && !isFetching
                            ? 'Digite ao menos 3 caracteres'
                            : (
                                <span>
                                    {allowCreate
                                        ? <span>Nenhuma parte encontrada.<br /><span className="text-xs opacity-75">"{inputValue}" será usado como novo.</span></span>
                                        : <span>Nenhum registro encontrado.</span>
                                    }
                                </span>
                            )
                        }
                    </div>
                )}
            </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{error}</p>}
      
    </div>
  );
}