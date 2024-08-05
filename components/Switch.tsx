import { ReactNode } from 'react';
import { is } from '@utilities/tools';
import { Switch as SwitchUI } from '@headlessui/react';
import { Check, Minus } from '@phosphor-icons/react/dist/ssr';

interface SwitchBaseProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface SwitchProps {
  id: string;
  label: string;
  tooltip?: string | undefined;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

const SwitchBase = ({ checked, onChange }: SwitchBaseProps): ReactNode => {
  const onChangeSwitch = (bool: boolean) => {
    if (is.function(onChange)) onChange(bool);
  };
  return (
    <SwitchUI checked={checked} onChange={onChangeSwitch} className={`${checked ? 'bg-fuchsia-500' : 'bg-slate-300 dark:bg-slate-600'} relative inline-flex items-center h-6 rounded-full w-12`}>
      <div className={`${checked ? 'translate-x-6 bg-white' : 'translate-x-0.5 bg-white'} hover:bg-opacity-80 dark:hover:bg-opacity-80 size-5 rounded-full flex items-center justify-center`}>
        {checked ? <Check className="text-fuchsia-600" /> : <Minus className="text-slate-400 dark:text-slate-700" />}
      </div>
    </SwitchUI>
  );
};

export const Switch = ({ id, label, checked, onChange, disabled = false }: SwitchProps): ReactNode => {
  return (
    <div className={`w-fit flex flex-row items-center gap-1.5 xs:gap-2 ${disabled ? 'opacity-60 select-none pointer-events-none' : ''}`}>
      <div>
        <SwitchBase checked={checked} onChange={onChange} />
        <input type="hidden" defaultValue={checked ? 1 : 0} id={id} />
      </div>
      <div className="text-white font-semibold">
        {label}
      </div>
    </div>
  );
};