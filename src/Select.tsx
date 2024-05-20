import {
  createContext,
  HTMLAttributes,
  ReactNode,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { CustomScrollbars } from './CustomScrollbars';
import { Portal } from './Portal';
import classNames from 'classnames';
import styles from './Select.module.css';

export interface SelectProps {
  value: string;
  children?: ReactNode;
  onChange?: (selectedValue: string) => void;
  menuScrollImplementation?: 'native' | 'overlayscrollbars';
}

export interface SelectMenuProps extends HTMLAttributes<HTMLDivElement> {
  rootRef?: Ref<HTMLDivElement>;
}

export interface OptionProps {
  value?: string;
  children?: ReactNode;
}

export interface SelectContextValue {
  menuScrollImplementation: 'native' | 'overlayscrollbars';
  onOptionSelected: (selectedValue: string) => void;
}

const SelectContext = createContext<SelectContextValue>({
  menuScrollImplementation: 'native',
  onOptionSelected() {},
});

export function Select({
  value,
  children,
  onChange,
  menuScrollImplementation = 'native',
}: SelectProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [menuElement, setMenuElement] = useState<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);

  const onOptionSelected = useCallback((selectedValue: string) => {
    onChange?.(selectedValue);
    setOpen(false);
    fieldRef.current?.focus();
  }, []);

  useEffect(() => {
    if (menuElement) {
      menuElement.focus();
    }
  }, [menuElement]);

  const fieldProps: HTMLAttributes<HTMLDivElement> = {
    role: 'combobox',
    tabIndex: 0,
    className: styles.Select,
    onMouseDown: event => {
      console.log('field mousedown');
      !menuElement && event.preventDefault();
      setOpen(a => !a);
    },
    onKeyDown: event => {
      if (event.code === 'Enter') {
        setOpen(a => !a);
      }
      if (event.code === 'Escape') {
        setOpen(false);
      }
    },
  };

  const menuProps: HTMLAttributes<HTMLDivElement> = {
    onBlur: event => {
      console.log('menu blur', event.relatedTarget);
      setOpen(false);
    },
    onKeyDown: event => {
      if (event.code === 'Escape') {
        setOpen(false);
        fieldRef.current?.focus();
      }
    },
  };

  return (
    <>
      <SelectContext.Provider value={{ menuScrollImplementation, onOptionSelected }}>
        <label>{menuScrollImplementation}</label>

        <div ref={fieldRef} {...fieldProps}>
          {value}
        </div>

        {open && (
          <Portal>
            <SelectMenu {...menuProps} rootRef={setMenuElement}>
              {children}
            </SelectMenu>
          </Portal>
        )}
      </SelectContext.Provider>
    </>
  );
}

function SelectMenu({ rootRef, children, ...restProps }: SelectMenuProps) {
  const { menuScrollImplementation: scrollImpl } = useContext(SelectContext);

  const ref = useRef<HTMLDivElement>(null);

  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(rootRef, () => ref.current);

  const innerProps: SelectMenuProps = {
    ...restProps,
    role: 'listbox',
    tabIndex: 0,
    className: classNames(styles.Menu, styles.MenuOverlayScrollbars),
  };

  return (
    <>
      {/* it works with regular div with overflow */}
      {scrollImpl === 'native' && (
        <div {...innerProps} ref={ref}>
          {children}
        </div>
      )}

      {/* but not works with overlayscrollbars (but works with older versions for example 2.4.3) */}
      {scrollImpl === 'overlayscrollbars' && (
        <div {...innerProps} ref={ref}>
          <CustomScrollbars style={{ maxHeight: 'calc(240px - 16px)' }}>
            {children}
          </CustomScrollbars>
        </div>
      )}
    </>
  );
}

export function Option({ value, children }: OptionProps) {
  const { onOptionSelected } = useContext(SelectContext);

  return (
    <div
      className={styles.Option}
      onClick={() => onOptionSelected(value ?? String(children))}
      role='option'
    >
      {children}
    </div>
  );
}
