import m, { Component, Attributes } from 'mithril';
import { LeafletMap, geoJSON } from 'mithril-leaflet';
import { LatLngExpression, FeatureGroup } from 'leaflet';
import {
  InputCheckbox,
  TextInput,
  TextArea,
  UrlInput,
  NumberInput,
  DatePicker,
  TimePicker,
  ColorInput,
  EmailInput,
  RadioButtons,
  Label,
  Select,
  Chips,
  Options,
  Switch,
  uuid4,
  uniqueId,
} from 'mithril-materialized';
import { IInputField } from '../models/input-field';
import {
  capitalizeFirstLetter,
  toHourMin,
  evalExpression,
  canResolvePlaceholders,
  resolvePlaceholders,
} from '../utils/helpers';
import { RepeatList, IRepeatList } from './repeat-list';
import { IObject } from '../models/object';
import { SlimdownView } from './slimdown-view';
import { GeometryObject, FeatureCollection } from 'geojson';

const unwrapComponent = <T, C>(
  key: string,
  {
    label = capitalizeFirstLetter(key),
    description,
    required,
    className,
    icon,
    iconClass,
    placeholder,
    maxLength,
    minLength,
    max,
    min,
  }: IInputField<T, C>,
  autofocus = false,
  disabled = false
) => {
  const result = { label } as IObject;
  if (description) {
    result.description = description;
  }
  if (className) {
    result.className = className;
  }
  if (icon) {
    result.iconName = icon;
  }
  if (iconClass) {
    result.iconClass = iconClass;
  }
  if (placeholder) {
    result.placeholder = placeholder;
  }
  if (required) {
    result.isMandatory = true;
  }
  if (disabled) {
    result.disabled = true;
  }
  if (autofocus) {
    result.autofocus = true;
  }
  if (typeof maxLength !== 'undefined') {
    result.maxLength = maxLength;
  }
  if (typeof minLength !== 'undefined') {
    result.minLength = minLength;
  }
  if (typeof max !== 'undefined') {
    result.max = max;
  }
  if (typeof min !== 'undefined') {
    result.min = min;
  }
  return result;
};

export interface IFormField<T, C> extends Attributes {
  /** Key of the property that is being repeated. Do not use `key` as this has side-effects in mithril. */
  propKey: Extract<keyof T, string>;
  /** The input field (or form) that must be rendered repeatedly */
  field: IInputField<T, C>;
  /** The resulting object */
  obj: T;
  autofocus?: boolean;
  /** Callback function, invoked every time the original result object has changed */
  onchange?: () => void;
  /** Disable the form, disallowing edits */
  disabled?: boolean | string | string[];
}

/** A single input field in a form */
export const FormField = <T extends { [K in Extract<keyof T, string>]: unknown }, C extends IObject>(): Component<
  IFormField<T, C>
> => {
  return {
    view: ({
      attrs: { propKey, field, obj, autofocus, onchange: onFormChange, disabled = field.disabled, context },
    }) => {
      const { value, required, repeat, autogenerate, show, label, description } = field;

      if (
        (show && !evalExpression(show, obj, context)) ||
        (label && !canResolvePlaceholders(label, obj, context)) ||
        (description && !canResolvePlaceholders(description, obj, context))
      ) {
        return undefined;
      }

      const options = field.options ? field.options.filter(o => !o.show || evalExpression(o.show, obj, context)) : [];

      const props = unwrapComponent(
        propKey,
        field,
        autofocus,
        typeof disabled === 'boolean' || typeof disabled === 'undefined'
          ? disabled
          : evalExpression(disabled, obj, context)
      );
      if (label) {
        props.label = resolvePlaceholders(props.label, obj, context);
      }
      if (description) {
        props.description = resolvePlaceholders(props.description, obj, context);
      }

      const validate = required
        ? (v: string | number | Array<string | number>) =>
            v instanceof Array ? v && v.length > 0 : typeof v !== undefined
        : undefined;

      const onchange = (v: string | number | Array<string | number | IObject> | Date | boolean) => {
        console.warn(v);
        obj[propKey] = v as any;
        if (onFormChange) {
          onFormChange();
        }
      };

      const type =
        field.type ||
        (autogenerate
          ? 'none'
          : value
          ? typeof value === 'string'
            ? 'text'
            : typeof value === 'number'
            ? 'number'
            : typeof value === 'boolean'
            ? 'checkbox'
            : 'none'
          : 'none');

      if (typeof repeat !== 'undefined') {
        return m(RepeatList, {
          propKey,
          obj,
          field,
          onchange,
          context,
        } as IRepeatList<T, C>);
      }

      if (autogenerate && !obj[propKey]) {
        obj[propKey] = (autogenerate === 'guid' ? uuid4() : uniqueId()) as any;
      }

      switch (type) {
        case 'colour':
        case 'color': {
          const initialValue = (obj[propKey] || value) as string;
          return m(ColorInput, { ...props, initialValue, onchange });
        }
        case 'time': {
          const date = ((obj[propKey] || value) as Date) || new Date();
          const initialValue = toHourMin(date);
          obj[propKey] = initialValue as any;
          return m(TimePicker, {
            twelveHour: false,
            initialValue,
            onchange,
          });
        }
        case 'date': {
          const initialValue = ((obj[propKey] || value) as Date) || new Date();
          obj[propKey] = initialValue as any;
          return m(DatePicker, {
            ...props,
            format: 'mmmm d, yyyy',
            initialValue,
            onchange,
          });
        }
        case 'email': {
          const initialValue = (obj[propKey] || value) as string;
          return m(EmailInput, {
            ...props,
            validate,
            autofocus,
            onchange,
            initialValue,
          });
        }
        case 'number': {
          const initialValue = (obj[propKey] || value) as number;
          return m(NumberInput, {
            ...props,
            validate,
            autofocus,
            onchange,
            initialValue,
          });
        }
        case 'radio': {
          const checkedId = (obj[propKey] || value) as string | number;
          return m(RadioButtons, { ...props, options, checkedId, onchange });
        }
        case 'checkbox': {
          const checked = (obj[propKey] || value) as boolean;
          return m(InputCheckbox, { ...props, checked, onchange });
        }
        case 'options': {
          const checkedId = (obj[propKey] || value) as Array<string | number>;
          return m(Options, {
            ...props,
            options,
            checkedId: checkedId instanceof Array ? checkedId : [checkedId],
            onchange: checkedIds => onchange(checkedIds.length === 1 ? checkedIds[0] : checkedIds),
          });
        }
        case 'select': {
          const checkedId = (obj[propKey] || value) as Array<string | number>;
          return m(Select, {
            placeholder: 'Pick one',
            ...props,
            options,
            checkedId: checkedId instanceof Array ? checkedId : [checkedId],
            onchange: checkedIds => onchange(checkedIds.length === 1 ? checkedIds[0] : checkedIds),
          });
        }
        case 'map': {
          const bbox = (area: L.GeoJSON) => {
            const result = {
              view: [50, 5] as LatLngExpression,
              zoom: 4,
            };
            if (!area) {
              return result;
            }
            try {
              const bounds = area.getBounds();
              result.view = bounds.getCenter();
              result.zoom = 10;
            } catch (e) {
              console.warn(e);
            }
            return result;
          };
          const overlay = (obj[propKey] ||
            value || {
              type: 'FeatureCollection',
              features: [],
            }) as FeatureCollection<GeometryObject>;
          const overlays = {} as IObject;
          const o = geoJSON(overlay);
          overlays[propKey] = o;
          return m(LeafletMap, {
            ...bbox(o),
            className: 'col s12',
            style: 'height: 400px;',
            overlays,
            visible: [propKey],
            editable: [propKey],
            showScale: { imperial: false },
            onLayerEdited: (f: FeatureGroup) => onchange(f.toGeoJSON() as any),
          });
        }
        case 'md':
          return m(SlimdownView, { md: (obj[propKey] || value) as string });
        case 'switch': {
          const checked = (obj[propKey] || value) as boolean;
          const { options: opt } = field;
          const left = opt && opt.length > 0 ? opt[0].label : '';
          const right = opt && opt.length > 1 ? opt[1].label : '';
          return m(Switch, { ...props, left, right, checked, onchange });
        }
        case 'tags': {
          const initialValue = (obj[propKey] || value || []) as string[];
          const data = initialValue.map(chip => ({ tag: chip }));
          return m('.input-field col s12', [
            m(Label, { ...props }),
            m(Chips, {
              onchange: (chips: M.ChipData[]) => onchange(chips.map(chip => chip.tag)),
              placeholder: 'Add a tag',
              secondaryPlaceholder: '+tag',
              data,
            }),
          ]);
        }
        case 'textarea': {
          const initialValue = (obj[propKey] || value) as string;
          return m(TextArea, {
            ...props,
            validate,
            autofocus,
            onchange,
            initialValue,
          });
        }
        case 'time':
          return m('div', 'todo');
        case 'url': {
          const initialValue = (obj[propKey] || value) as string;
          return m(UrlInput, {
            ...props,
            validate,
            autofocus,
            onchange,
            initialValue,
          });
        }
        case 'text': {
          const initialValue = (obj[propKey] || value) as string;
          return m(TextInput, {
            ...props,
            validate,
            autofocus,
            onchange,
            initialValue,
          });
        }
        default:
          return undefined;
      }
    },
  };
};
