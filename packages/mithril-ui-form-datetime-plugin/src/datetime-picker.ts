import m, { FactoryComponent } from 'mithril';
import { IInputOptions, Label, HelperText, toAttrs, uniqueId } from 'mithril-materialized';

export const DatetimePicker: FactoryComponent<
  IInputOptions<Date> & Partial<M.TimepickerOptions> & Partial<M.DatepickerOptions>
> = () => {
  const state = { id: uniqueId() } as { id: string; dp: M.Datepicker; tp: M.Timepicker };
  return {
    view: ({
      attrs: {
        label,
        helperText,
        initialValue,
        newRow,
        className = 'col s12',
        iconName,
        isMandatory,
        onchange,
        disabled,
        ...props
      },
    }) => {
      const id = state.id;
      const attributes = toAttrs(props);
      const clear = newRow ? '.clear' : '';
      //   const now = new Date();
      const onCloseDate = () => {
        state.dp && state.dp.destroy();
        return m(`input[type=text][tabindex=0][id=${id}]${attributes}${disabled ? '[disabled]' : ''}`, {
          value: initialValue,
          oncreate: ({ dom }) => {
            state.tp = M.Timepicker.init(dom, {
              twelveHour: false,
              showClearBtn: true,
              defaultTime: initialValue,
              // onSelect: onchange ? (hours: number, minutes: number) => onchange(`${hours}:${minutes}`) : undefined,
              ...props,
              onCloseEnd,
            } as Partial<M.TimepickerOptions>);
          },
        });
      };
      const onCloseEnd = onchange
        ? () => state.tp && onchange(state.dp.date) //state.tp.time || initialValue || `${now.getHours()}:${now.getMinutes()}`)
        : undefined;
      return m(
        `.input-field${clear}`,
        {
          className,
          onremove: () => {
            state.tp && state.tp.destroy();
            return state.dp && state.dp.destroy();
          },
        },
        [
          iconName ? m('i.material-icons.prefix', iconName) : '',
          m(`input.datepicker[type=text][tabindex=0][id=${id}]${attributes}${disabled ? '[disabled]' : ''}`, {
            oncreate: ({ dom }) => {
              state.dp = M.Datepicker.init(dom, {
                format: 'yyyy/mm/dd',
                showClearBtn: true,
                setDefaultDate: true,
                defaultDate: initialValue ? new Date(initialValue) : new Date(),
                // onSelect: onchange,
                ...props,
                onCloseDate,
              } as Partial<M.DatepickerOptions>);
            },
          }),
          m(Label, { label, id, isMandatory, isActive: !!initialValue }),
          m(HelperText, { helperText }),
        ]
      );
    },
  };
};
