import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';
import { uniqueId } from 'mithril-materialized';
import { DatetimePicker } from './datetime-picker';

export const datetimePlugin: PluginType = () => {
  let state: any = null;

  return {
    oninit: (attrs: any) => {
      state = { id: uniqueId() } as { id: string; dp: M.Datepicker; tp: M.Timepicker };
      console.log(`datetime: ${attrs}`);
    },
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
        transform,
        containerId,
        ...props
      },
    }: any) => {
      initialValue = initialValue
        ? transform
          ? transform('to', initialValue.valueOf())
          : initialValue.valueOf()
        : initialValue;
      console.log(`datetimepicker: ${initialValue && initialValue.toUTCString()}`);
      containerId = containerId | 'body' as any;
      console.log(state);
      const { min, max } = props;
      const minDate = min ? (!initialValue || min < initialValue.valueOf() ? new Date(min) : initialValue) : undefined;
      const maxDate = max ? (!initialValue || max > initialValue.valueOf() ? new Date(max) : initialValue) : undefined;
      return m(DatetimePicker, {
        ...props,
        label,
        minDate,
        maxDate,
        setDefaultDate: initialValue ? true : false,
        format: 'd-M-y H:mm',
        initialValue,
        onchange: (date: number | Date | string) => {
          initialValue = new Date(date);
          onchange(new Date(date));
        },
        container: containerId as any,
      });
    },
  };
};
