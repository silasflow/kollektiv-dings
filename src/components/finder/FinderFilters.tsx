import type { Lang } from "../../data/siteContent";
import Button from "../common/Button";
import {
  finderText,
  scopeLabels,
  structureLabels,
  timeLabels,
} from "./finderContent";
import type {
  FinderFilterState,
  FinderOption,
  ScopeCategory,
  StructureCategory,
  TimeCategory,
} from "./finderTypes";

type Props = {
  lang: Lang;
  filters: FinderFilterState;
  topicOptions: FinderOption[];
  orientationOptions: FinderOption[];
  countryOptions: string[];
  regionOptions: string[];
  cityOptions: string[];
  onChange: (filters: FinderFilterState) => void;
  onReset: () => void;
};

type LocationLevel = "city" | "region" | "country";

const structureOrder: StructureCategory[] = [
  "informal",
  "partial",
  "structured",
];
const timeOrder: TimeCategory[] = ["project", "recurring", "established"];
const scopeOrder: ScopeCategory[] = ["local", "translocal", "global"];

export default function FinderFilters({
  lang,
  filters,
  topicOptions,
  orientationOptions,
  countryOptions,
  regionOptions,
  cityOptions,
  onChange,
  onReset,
}: Props) {
  const t = finderText[lang];
  const selectedLocation = getSelectedLocation(filters);
  const hasLocationOptions =
    cityOptions.length + regionOptions.length + countryOptions.length > 0;

  function toggleListValue<
    Key extends "topics" | "scopes" | "structures" | "times" | "orientations",
  >(key: Key, value: FinderFilterState[Key][number]) {
    const currentValues = filters[key] as string[];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    onChange({ ...filters, [key]: nextValues });
  }

  function changeLocation(encodedLocation: string) {
    const nextFilters = {
      ...filters,
      country: "",
      region: "",
      city: "",
    };

    if (!encodedLocation) {
      onChange(nextFilters);
      return;
    }

    const separatorIndex = encodedLocation.indexOf(":");
    const level = encodedLocation.slice(0, separatorIndex) as LocationLevel;
    const value = encodedLocation.slice(separatorIndex + 1);

    if (["city", "region", "country"].includes(level) && value) {
      nextFilters[level] = value;
    }

    onChange(nextFilters);
  }

  return (
    <div className="finder-filter-panel__inner">
      <div className="finder-filter-panel__header">
        <h2 className="heading4">{t.filters}</h2>

        <Button
          variant="tertiary"
          icon="arrow-counter-clockwise"
          ariaLabel={t.reset}
          onClick={onReset}
        />
      </div>

      <div className="finder-place-filters">
        <label className="finder-select-field">
          <span className="label">
            <i className="ph-bold ph-map-pin" aria-hidden="true" />
            {t.place}
          </span>
          <p className="finder-filter-hint paragraph">{t.placeHint}</p>
          <select
            value={selectedLocation}
            onChange={(event) => changeLocation(event.target.value)}
          >
            <option value="">{t.allPlaces}</option>

            {!hasLocationOptions && (
              <option value="" disabled>
                {t.noPlaceOptions}
              </option>
            )}

            {cityOptions.length > 0 && (
              <optgroup label={t.citiesGroup}>
                {cityOptions.map((city) => (
                  <option key={city} value={`city:${city}`}>
                    {city}
                  </option>
                ))}
              </optgroup>
            )}

            {regionOptions.length > 0 && (
              <optgroup label={t.regionsGroup}>
                {regionOptions.map((region) => (
                  <option key={region} value={`region:${region}`}>
                    {region}
                  </option>
                ))}
              </optgroup>
            )}

            {countryOptions.length > 0 && (
              <optgroup label={t.countriesGroup}>
                {countryOptions.map((country) => (
                  <option key={country} value={`country:${country}`}>
                    {country}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
      </div>

      <CheckboxGroup
        title={t.scope}
        icon="arrows-out"
        hint={t.scopeHint}
        options={scopeOrder.map((id) => ({
          id,
          label: scopeLabels[lang][id],
        }))}
        selected={filters.scopes}
        onToggle={(id) => toggleListValue("scopes", id as ScopeCategory)}
      />

      <CheckboxGroup
        title={t.themes}
        icon="tag"
        options={topicOptions}
        selected={filters.topics}
        onToggle={(id) => toggleListValue("topics", id)}
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
          toggleListValue("structures", id as StructureCategory)
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
        onToggle={(id) => toggleListValue("times", id as TimeCategory)}
      />

      <CheckboxGroup
        title={t.orientation}
        icon="compass"
        hint={t.orientationHint}
        options={orientationOptions}
        selected={filters.orientations}
        onToggle={(id) => toggleListValue("orientations", id)}
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

function getSelectedLocation(filters: FinderFilterState): string {
  if (filters.city) return `city:${filters.city}`;
  if (filters.region) return `region:${filters.region}`;
  if (filters.country) return `country:${filters.country}`;
  return "";
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