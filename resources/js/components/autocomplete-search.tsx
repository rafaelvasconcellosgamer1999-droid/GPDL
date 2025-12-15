import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, X, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom'; // Importação adicionada para Portals

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

  // NOVA PROP: Para notificar erros de busca
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
  onSearchError, // Nova prop adicionada aqui
}: AutocompleteSearchProps<T>) {

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<T[]>(options);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  
  // NOVO ESTADO: Para gerenciar o posicionamento do Portal
  const [portalStyle, setPortalStyle] = useState({});

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  
  // NOVO REF: Para o contêiner do Portal
  const portalRef = useRef<HTMLDivElement>(document.createElement('div'));


  // --- EFEITO DE MONTAR/DESMONTAR (Cleanup & Portal Setup) ---
  useEffect(() => {
    isMountedRef.current = true;
    const portalElement = portalRef.current;
    document.body.appendChild(portalElement); // Anexa o contêiner do Portal ao body
    
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      // Limpeza do Portal: Remove o contêiner do body ao desmontar
      if (document.body.contains(portalElement)) {
        document.body.removeChild(portalElement);
      }
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

    // Adicionado: Não busca se o texto é exatamente o nome do item selecionado
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
      } catch (err) { // MUDANÇA: Captura e notifica o erro
        if (!isMountedRef.current) return;
        setFilteredOptions([]);
        onSearchError?.(err); // Chama o novo callback de erro
      } finally {
        if (isMountedRef.current) setIsFetching(false);
      }
    }, 300);

    debounceTimerRef.current = timer;
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [inputValue, onSearch, selectedOption, onSearchError]);


  // --- EFEITO DE SINCRONIZAÇÃO DE VALOR EXTERNO ---
  useEffect(() => {
    // MUDANÇA: Impede sincronização se o usuário estiver digitando
    if (allowCreate) return;
    if (document.activeElement === inputRef.current) return; 

    if (value === null || value === undefined) {
      if (!isOpen) setInputValue('');
      setSelectedOption(null); // Fix: Garante que o estado interno do item selecionado seja limpo
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

  // --- EFEITO PARA CÁLCULO DE POSIÇÃO DO PORTAL ---
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - containerRect.bottom;
    const isRoomBelow = spaceBelow >= 240; // 240px é o max-h-60
    
    // Calcula a posição absoluta no viewport
    setPortalStyle({
      position: 'absolute',
      left: `${containerRect.left}px`,
      width: `${containerRect.width}px`,
      zIndex: 50,
      // Se houver espaço, abre abaixo (padrão), caso contrário, abre para cima
      top: isRoomBelow 
          ? `${containerRect.bottom + window.scrollY + 4}px` 
          : `${containerRect.top + window.scrollY - 240 - 4}px`, 
    });
  }, [isOpen, filteredOptions]); // Recalcula quando abre/fecha ou a lista muda

  // --- EFEITO DE CLICK OUTSIDE (Inalterado) ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);

        if (!allowCreate) {
          if (selectedOption && inputValue !== selectedOption.nome) {
            setInputValue(selectedOption.nome);
          } else if (!selectedOption && inputValue !== '') {
            setInputValue('');
            onChange(null); // MUDANÇA: Passa null ao limpar
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
      // MUDANÇA: Se allowCreate for false, passa null ao invés de ''
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
    // MUDANÇA: Passa null ao limpar, para consistência, se não estiver em modo criação estrito
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
            onChange(null); // MUDANÇA: Passa null
          }
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);

      if (!allowCreate && selectedOption) setInputValue(selectedOption.nome);
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
            border: error ? '1px solid #ef4444' : isOpen ? '1px solid var(--brand-600)' : '1px solid var(--gpdl-border)',
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
      </div>

      {error && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{error}</p>}
      
      {/* MUDANÇA: O dropdown AGORA é renderizado via Portal, posicionado dinamicamente */}
      {isOpen && !isDisabled && createPortal(
        <div
          id={listboxId}
          className="mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{
            // Aplica a posição calculada, MANTENDO os estilos de cor originais
            ...portalStyle,
            background: 'var(--surface-muted)',
            border: '1px solid var(--gpdl-border)',
            position: 'absolute', // Garante que a posição absoluta do portalStyle funcione
          }}
          role="listbox"
        >
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((option, idx) => {
                const isSelected = selectedOption?.id === option.id;
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
        </div>,
        portalRef.current
      )}
    </div>
  );
}