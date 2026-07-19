import type { Lang } from '../../data/siteContent';
import Button from '../common/Button';
import {
  finderText,
  structureLabels,
  timeLabels,
} from './finderContent';
import type {
  FinderFilterState,
  FinderOption,
  StructureCategory,
  TimeCategory,
} from './finderTypes';

type Props = {
  lang: Lang;
  filters: FinderFilterState;
  topicOptions: FinderOption[];
  orientationOptions: FinderOption[];
  cityOptions: string[];
  regionOptions: string[];
  onChange: (filters: FinderFilterState) => void;
  onReset: () => void;
};

const structureOrder: StructureCategory[] = [
  'informal',
  'partial',
  'structured',
];

const timeOrder: TimeCategory[] = ['project', 'recurring', 'established'];

export default function FinderFilters({
  lang,
  filters,
  topicOptions,
  orientationOptions,
  cityOptions,
  regionOptions,
  onChange,
  onReset,
}: Props) {
  const t = finderText[lang];

  function toggleListValue<Key extends 'topics' | 'structures' | 'times' | 'orientations'>(
    key: Key,
    value: FinderFilterState[Key][number]
  ) {
    const currentValues = filters[key] as string[];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    onChange({
      ...filters,
      [key]: nextValues,
    });
  }

  return (
    <div className="finder-filter-panel__inner">
      <div className="finder-filter-panel__header">
        <div>
          <p className="label">{t.filters}</p>
          <h2 className="heading4">{t.filters}</h2>
        </div>

        <Button variant="tertiary" icon="arrow-counter-clockwise" onClick={onReset}>
          {t.reset}
        </Button>
      </div>

      <div className="finder-place-filters">
        <label className="finder-select-field">
          <span className="label">
            <i className="ph-bold ph-map-pin" aria-hidden="true" />
            {t.city}
          </span>
          <select
            value={filters.city}
            onChange={(event) =>
              onChange({ ...filters, city: event.target.value })
            }
          >
            <option value="">{t.allCities}</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        {regionOptions.length > 0 && (
          <label className="finder-select-field">
            <span className="label">
              <i className="ph-bold ph-map-trifold" aria-hidden="true" />
              {t.region}
            </span>
            <select
              value={filters.region}
              onChange={(event) =>
                onChange({ ...filters, region: event.target.value })
              }
            >
              <option value="">{t.allRegions}</option>
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <CheckboxGroup
        title={t.themes}
        icon="tag"
        options={topicOptions}
        selected={filters.topics}
        onToggle={(id) => toggleListValue('topics', id)}
      />

      <CheckboxGroup
        title={t.structure}
        icon="tree-structure"
        options={structureOrder.map((id) => ({
          id,
          label: structureLabels[lang][id],
        }))}
        selected={filters.structures}
        onToggle={(id) =>
          toggleListValue('structures', id as StructureCategory)
        }
      />

      <CheckboxGroup
        title={t.time}
        icon="clock"
        options={timeOrder.map((id) => ({
          id,
          label: timeLabels[lang][id],
        }))}
        selected={filters.times}
        onToggle={(id) => toggleListValue('times', id as TimeCategory)}
      />

      <CheckboxGroup
        title={t.orientation}
        icon="compass"
        hint={t.orientationHint}
        options={orientationOptions}
        selected={filters.orientations}
        onToggle={(id) => toggleListValue('orientations', id)}
      />

      <label className="finder-checkbox finder-checkbox--standalone">
        <input
          type="checkbox"
          checked={filters.digitalOnly}
          onChange={(event) =>
            onChange({ ...filters, digitalOnly: event.target.checked })
          }
        />
        <span className="finder-checkbox__box" aria-hidden="true">
          {filters.digitalOnly && <i className="ph-bold ph-check" />}
        </span>
        <span className="paragraph">
          <i className="ph-bold ph-wifi-high" aria-hidden="true" />
          {t.digitalOnly}
        </span>
      </label>
    </div>
  );
}

function CheckboxGroup({
  title,
  icon,
  hint,
  options,
  selected,
  onToggle,
}: {
  title: string;
  icon: string;
  hint?: string;
  options: FinderOption[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="finder-checkbox-group">
      <legend className="label">
        <i className={`ph-bold ph-${icon}`} aria-hidden="true" />
        {title}
      </legend>

      {hint && <p className="finder-filter-hint paragraph">{hint}</p>}

      <div className="finder-checkbox-group__options">
        {options.map((option) => {
          const isChecked = selected.includes(option.id);

          return (
            <label className="finder-checkbox" key={option.id}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(option.id)}
              />
              <span className="finder-checkbox__box" aria-hidden="true">
                {isChecked && <i className="ph-bold ph-check" />}
              </span>
              <span className="paragraph">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
