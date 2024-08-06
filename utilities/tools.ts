
type StorageType = {
  get: (name: string, defaultValue?: string) => string;
  set: (name: string, value: string) => void;
  delete: (name: string) => void;
};

export const storage: StorageType = {
  get: (name: string, defaultValue = ''): string => {
    let str: any = '';
    try {
      str = localStorage.getItem(name);
      if (typeof str !== 'string') str = defaultValue;
    } catch (e: any) {
      console.log(e);
    }
    return str;
  },
  set: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (e: any) {
      console.log(e);
    }
  },
  delete: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (e: any) {
      console.log(e);
    }
  },
};

export const processResponse = (inputStr: any): { text: string, exercise: [] } => {
  // Expresión regular para encontrar el objeto JSON
  const regex = /\[[\s\S]*\]/; // Busca el contenido entre corchetes sin usar el flag `s`
  const match = inputStr.match(regex);

  if (match) {
    const jsonString = match?.[0];
    let jsonObject;

    try {
      jsonObject = JSON.parse(jsonString); // Intenta analizar la cadena JSON
    } catch (e) {
      jsonObject = [];
    }

    // Separar la parte de texto de la parte JSON
    const textPart = inputStr.replace(jsonString, '').trim();

    return { text: textPart, exercise: jsonObject };
  }
  return { text: inputStr, exercise: [] };
}

export const getThemeColor = (theme: string) => {
  let themeColor: string = '#002561';
  if (theme == 'dark') themeColor = '#000000';
  return themeColor;
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const debounce = (callback: (...args: any[]) => void, delay: number) => {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(null, args);
    }, delay);
  };
};

export const is = {
  undefined: (elem: any): boolean => {
    return typeof elem === 'undefined';
  },
  object: (object: any): boolean => {
    return typeof object === 'object' && object != null && Object.keys(object).length > 0;
  },
  function: (fn: any): boolean => {
    return typeof fn === 'function';
  },
  string: (str: any): boolean => {
    return typeof str === 'string';
  },
  number: (str: any): boolean => {
    return typeof str === 'number';
  },
  empty: (str: any): boolean => {
    return typeof str === 'string' && str.trim() == '';
  },
  array: (array: any): boolean => {
    return typeof array === 'object' && array != null && array.length > 0;
  },

};

export const to = {
  undefined: (str: any, defaultValue = undefined): string | number | undefined => {
    if ((typeof str === 'string' || typeof str === 'number') && str != '') return str;
    return defaultValue;
  },
  array: (arr: any, defaultArray: any[] = []): any[] => {
    let array = defaultArray;
    if (arr !== null && typeof arr === 'object' && arr.length > 0) array = arr;
    return array;
  },
  string: (str: any): string => {
    if (typeof str === 'string') return str;
    return '';
  },
  boolean: (value: any): boolean => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      value = value.toLowerCase().trim();
      return value === 'true' || value === '1';
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    return false;
  },
  number: (num: any, defaultNumber = 0) => {
    if (is.undefined(num) || num === null || isNaN(num)) return defaultNumber;
    return Number(num);
  },
  removeAccents: (str: any): string => {
    if (typeof str === 'string' || str instanceof String) {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return str;
  },
  currency: (number: any): string => {
    number = parseFloat(number);
    if (isNaN(number)) number = 0;
    const formatter = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    });
    return formatter.format(number);
  },
  numberFormat: (number: any) => {
    if (isNaN(number)) number = 0;
    return number.toLocaleString('es-MX');
  },
  truncate: (number: any, truncate: number, toString = false): any => {
    const { _integer, _decimal } = to.numberInParts(number, truncate);
    number = `${_integer}.${_decimal}`;
    if (toString) return number;
    else return Number(number);
  },
  round: (number: any, truncate: number, toString = false): any => {
    const _number = Number(new Intl.NumberFormat('es-MX', { style: 'decimal', useGrouping: false, maximumFractionDigits: truncate }).format(number));
    if (toString) return _number;
    else return Number(_number);
  },
  numberInParts: (number: any, truncate: number, toString = false): any => {
    const multiplier = Math.pow(10, truncate);
    const _number = (number * multiplier) / multiplier;
    const _string = _number.toString();
    const _array = _string.split('.');
    let _int = _array?.[0];
    let _decimal: any = _array?.[1];
    if (!is.string(_int) || _int == 'NaN') _int = '0';
    if (!is.string(_decimal) || _decimal == 'NaN') _decimal = '00';
    else _decimal = _decimal.padEnd(truncate, '0');
    const _truncate = _decimal.slice(0, truncate);
    if (toString) {
      const val = `${_int}.${_truncate}`;
      if (val == '0.00') return '0';
      else return val;
    } else return { _integer: _int, _decimal: _truncate };
  },
  numberZero: (value: number, truncate: number, defaultValue = undefined): any => {
    return value > 0 ? to.numberInParts(value, truncate, true) : defaultValue;
  },
  pad: (value: number, padNumber: number, padString = '0') => {
    return value.toString().padStart(padNumber, padString);
  },
  localDate: (str: any) => {
    if (!is.string(str)) return '';
    const options: any = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    const date = new Date(str);
    return date.toLocaleDateString('es-MX', options);
  },
  ucfirst: (str: string) => str && str?.[0].toUpperCase() + str.slice(1),
  capitalize: (text: string): string => {
    if (is.string(text)) {
      const words = text.split(' ');
      const capitalizedWords = words.map((word) => {
        if (word.length <= 1) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });
      return capitalizedWords.join(' ');
    }
    return '';
  },
  chunk: (arr: any[], chunkSize: number) => {
    const chunks = [];
    if (is.array(arr)) {
      const arrLen = arr.length;
      for (let i = 0; i < arrLen; i += chunkSize) {
        chunks.push(arr.slice(i, i + chunkSize));
      }
    }
    return chunks;
  },
  scroll: (id: string, minHeight: number): void => {
    setTimeout(() => {
      let elem = document.getElementById(id) as HTMLDivElement;
      if (elem) {
        if (minHeight == 0 || minHeight >= elem.clientHeight) {
          elem.scroll(0, 9999);
        }
      }
    }, 100);
  },
};

export const get = {
  html: {
    set: (id: string, value: string) => {
      let elem: HTMLElement | null = document.getElementById(id);
      if (elem !== null) elem.innerHTML = value;
    },
    get: (id: string) => {
      let elem: HTMLElement | null = document.getElementById(id);
      if (elem == null) return '';
      return elem.innerHTML;
    },
  },
  value: {
    set: (id: string, value: any) => {
      if (document.getElementById(id)) {
        let elem = document.getElementById(id) as HTMLInputElement;
        elem.value = to.string(value);
      }
    },
    get: (id: string, defaultValue = '') => {
      if (document.getElementById(id)) {
        let elem = document.getElementById(id) as HTMLInputElement;
        let val: string = elem.value;
        if (!is.string(val)) val = '';
        val = val.trim();
        if (val == '' && defaultValue != '') val = defaultValue;
        return val.trim();
      }
      return '';
    },
  }
}

export const getPreferredLanguage = (header: string): string => to.string(header.split(',')?.[0]);
