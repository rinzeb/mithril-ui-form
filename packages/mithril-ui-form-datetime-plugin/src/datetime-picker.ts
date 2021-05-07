import m, { FactoryComponent } from 'mithril';
import { IInputOptions, Label, HelperText, toAttrs, uniqueId } from 'mithril-materialized';
import { lightFormat, parse } from 'date-fns';

export const padLeft = (str: string | number, length = 2, padding = '0'): string =>
  str.toString().length >= length ? str.toString() : padLeft(padding + str, length, padding);
export const toHourMin = (d: Date) => `${padLeft(d.getHours())}:${padLeft(d.getMinutes())}`;

export const DatetimePicker: FactoryComponent<
  IInputOptions<Date> & Partial<M.TimepickerOptions> & Partial<M.DatepickerOptions>
> = () => {
  const state = { id: uniqueId() } as { id: string; dp: M.Datepicker; tp: M.Timepicker };
  return {
    view: ({
      attrs: {
        label,
        helperText,
        iv,
        obj,
        newRow,
        className,
        iconName,
        isMandatory,
        onchange,
        disabled,
        format,
        containerId,
        ...props
      },
    }) => {
      const id = state.id;
      let inputDom: HTMLInputElement | null = null;
      className = className ? className : props && props.className ? props.className : 'col s12 m6';
      let currentDateTime: Date | null = null;
      const attributes = toAttrs(props);
      const initialValue: Date =
        typeof iv === 'number' || typeof iv === 'string' ? new Date(iv) : iv == undefined ? new Date() : iv;
      console.log(`datetimepicker ${initialValue.toUTCString()}`);
      const { min, max } = props;
      const minDate = min ? (!initialValue || min < initialValue.valueOf() ? new Date(min) : initialValue) : undefined;
      const maxDate = max ? (!initialValue || max > initialValue.valueOf() ? new Date(max) : initialValue) : undefined;
      const datetimeformat = format && typeof format === 'string' ? format : 'd-M-y H:mm';
      const clear = newRow ? '.clear' : '';
      const onCloseTime = () => {
        if (onchange && state.tp.time) {
          const timeComponents: number[] = state.tp.time.split(':').map((c) => +c);
          state.dp.date.setHours(timeComponents[0]);
          state.dp.date.setMinutes(timeComponents[1]);
          console.log(`timepicker closed with ${state.dp.date.toUTCString()}`);
          onchange(state.dp.date);
          inputDom && (inputDom.value = lightFormat(state.dp.date, datetimeformat));
        } else {
          inputDom && (inputDom.value = lightFormat(currentDateTime ? currentDateTime : initialValue, datetimeformat));
        }
        state.tp && state.tp.destroy();
      };
      const onCloseDate = () => {
        // TODO: Check for cancel or done button clicked
        // Prepare for opening timepicker
        state.dp.date.setHours(currentDateTime ? currentDateTime.getHours() : initialValue.getHours());
        state.dp.date.setMinutes(currentDateTime ? currentDateTime.getMinutes() : initialValue.getMinutes());
        inputDom!.value = toHourMin(state.dp.date);
        state.tp = M.Timepicker.init(
          inputDom as any,
          {
            ...props,
            container: 'body', //`#${elm.dom.id}`,
            twelveHour: false,
            showClearBtn: false,
            // onSelect: onchange ? (hours: number, minutes: number) => onchange(`${hours}:${minutes}`) : undefined,
            onCloseEnd: onCloseTime,
          } as Partial<M.TimepickerOptions>
        );
        console.log('timepicker init');
        state.tp && state.tp.open();
      };
      const onOpenDate = () => {
        currentDateTime = parse(inputDom!.value, datetimeformat, Date.now());
        state.dp.setDate(currentDateTime);
      };
      const onCreate = (el: any) => {
        inputDom = el.dom as HTMLInputElement;
        state.dp = M.Datepicker.init(inputDom, {
          ...props,
          showClearBtn: false,
          setDefaultDate: initialValue ? true : false,
          minDate: minDate,
          maxDate: maxDate,
          defaultDate: initialValue ? new Date(initialValue) : new Date(),
          onClose: onCloseDate,
          onOpen: onOpenDate,
        } as Partial<M.DatepickerOptions>);
        inputDom.value = lightFormat(initialValue, datetimeformat);
      };
      return m(
        `.input-field${clear}`,
        {
          className,
          onremove: () => {
            console.log('removing dp');
            state.tp && state.tp.destroy();
            return state.dp && state.dp.destroy();
          },
        },
        [
          iconName ? m('i.material-icons.prefix', iconName) : '',
          m(`input.datetimepicker[type=text][tabindex=0][id=${id}]${attributes}${disabled ? '[disabled]' : ''}`, {
            oncreate: onCreate,
          }),
          m(Label, { label, id, isMandatory, isActive: !!initialValue }),
          m(HelperText, { helperText }),
        ]
      );
    },
  };
};
