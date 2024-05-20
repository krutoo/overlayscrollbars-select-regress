import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import styles from './Select.module.css';
import { CustomScrollbars } from './CustomScrollbars';

export interface SelectProps {
  value: string;
  children?: ReactNode;
  onChange?: (selectedValue: string) => void;
  menuScrollImplementation?: 'native' | 'overlayscrollbars';
}

export interface OptionProps {
  value?: string;
  children?: ReactNode;
}

const SelectContext = createContext<(selectedValue: string) => void>(() => {});

export function Select({
  value,
  children,
  onChange,
  menuScrollImplementation = 'native',
}: SelectProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const onSelect = useCallback((selectedValue: string) => {
    onChange?.(selectedValue);
    setOpen(false);
  }, []);

  useEffect(() => {
    const menu = menuRef.current;

    if (open && menu) {
      menu.focus();
    }
  }, [open]);

  useEffect(() => {
    const menu = menuRef.current;

    if (menu) {
      const onBlur = () => {
        setOpen(false);
      };

      menu.addEventListener('blur', onBlur);

      return () => {
        menu.removeEventListener('blur', onBlur);
      };
    }
  }, [open]);

  return (
    <>
      <SelectContext.Provider value={onSelect}>
        <div
          ref={fieldRef}
          className={styles.Select}
          tabIndex={0}
          onMouseDown={event => {
            !menuRef.current && event.preventDefault();
            setOpen(a => !a);
          }}
        >
          {value}
        </div>
        {open && (
          <>
            {/* it works with regular div with overflow */}
            {menuScrollImplementation === 'native' && (
              <div
                ref={menuRef}
                role='listbox'
                tabIndex={0}
                className={classNames(styles.Menu, styles.MenuNativeScroll)}
              >
                {children}
              </div>
            )}

            {/* but not works with overlayscrollbars (but works with older versions for example 2.4.3) */}
            {menuScrollImplementation === 'overlayscrollbars' && (
              <CustomScrollbars
                rootRef={menuRef}
                role='listbox'
                tabIndex={0}
                className={classNames(styles.Menu, styles.MenuOverlayScrollbars)}
                overflow={{ x: 'hidden', y: 'scroll' }}
              >
                {children}
              </CustomScrollbars>
            )}
          </>
        )}
      </SelectContext.Provider>
    </>
  );
}

export function Option({ value, children }: OptionProps) {
  const onSelect = useContext(SelectContext);

  return (
    <div className={styles.Option} onClick={() => onSelect(value ?? String(children))}>
      {children}
    </div>
  );
}
