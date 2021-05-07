import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';
import { DatetimePicker } from './datetime-picker';

export const datetimePlugin: PluginType = () => {
  return {
    view: ({
      attrs: {
        label,
        className,
        helperText,
        initialValue,
        newRow,
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
      containerId = containerId | ('body' as any);
      className = className
        ? className
        : props && props.className
        ? props.className
        : props && props.field
        ? props.field.className || 'col s12 m6'
        : 'col s12 m6';
      const { min, max } = props;
      console.log(`datetimepicker: ${initialValue && initialValue.toUTCString()} : ${JSON.stringify(props)}`);
      const minDate = min ? (!initialValue || min < initialValue.valueOf() ? new Date(min) : initialValue) : undefined;
      const maxDate = max ? (!initialValue || max > initialValue.valueOf() ? new Date(max) : initialValue) : undefined;
      return m(DatetimePicker, {
        ...props,
        label,
        className,
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
