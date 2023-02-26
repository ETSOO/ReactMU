import {
  AddressApi,
  AddressCity,
  AddressDistrict,
  AddressRegionDb,
  AddressState
} from "@etsoo/appscript";
import { FormLabel, Grid, RegularBreakpoints } from "@mui/material";
import React from "react";
import { globalApp } from "./app/ReactApp";
import { ComboBox } from "./ComboBox";
import { Tiplist } from "./Tiplist";

/**
 * Address field
 */
export enum AddressField {
  Region = "region",
  State = "state",
  City = "city",
  District = "district"
}

type AddressFieldType<F extends AddressField> = F extends AddressField.Region
  ? [F, AddressRegionDb | null]
  : F extends AddressField.State
  ? [F, AddressState | null]
  : F extends AddressField.City
  ? [F, AddressCity | null]
  : [F, AddressDistrict | null];

/**
 * Address selector props
 */
export type AddressSelectorProps = {
  /**
   * Address API
   */
  api: AddressApi;

  /**
   * Break points
   */
  breakPoints?: RegularBreakpoints;

  /**
   * City
   */
  city?: number;

  /**
   * City label
   */
  cityLabel?: string;

  /**
   * District
   */
  district?: number;

  /**
   * District label
   */
  districtLabel?: string;

  /**
   * Error
   */
  error?: boolean;

  /**
   * The helper text content.
   */
  helperText?: React.ReactNode;

  /**
   * Hide the region
   */
  hideRegion?: boolean;

  /**
   * Label
   */
  label?: string;

  /**
   * Onchange hanlder
   * @param event Event
   */
  onChange?: <F extends AddressField>(event: AddressFieldType<F>) => void;

  /**
   * Country or region
   */
  region?: string;

  /**
   * Region label
   */
  regionLabel?: string;

  /**
   * Required
   */
  required?: boolean;

  /**
   * Search mode
   */
  search?: boolean;

  /**
   * State
   */
  state?: string;

  /**
   * State label
   */
  stateLabel?: string;
};

/**
 * Address selector
 * @param props Props
 */
export function AddressSelector(props: AddressSelectorProps) {
  // Labels
  const {
    city: cityDefault = "City",
    district: districtDefault = "District",
    region: regionDefault = "Region",
    state: stateDefault = "State"
  } = globalApp?.getLabels("region", "state", "city", "district") ?? {};

  // Destruct
  const {
    api,
    city,
    cityLabel = cityDefault,
    district,
    districtLabel = districtDefault,
    error,
    helperText,
    hideRegion,
    label,
    onChange,
    region,
    regionLabel = regionDefault,
    required,
    search,
    state,
    stateLabel = stateDefault,
    breakPoints = { xs: 12, md: 6, lg: hideRegion ? 4 : 3 }
  } = props;

  const isMounted = React.useRef(true);
  React.useEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

  // States
  const [regionState, setRegion] = React.useState(region);
  const [stateState, setState] = React.useState(state);
  const [cityState, setCity] = React.useState(city);
  const [districtState, setDistrict] = React.useState(district);

  React.useEffect(() => setRegion(region), [region]);
  React.useEffect(() => setState(state), [state]);
  React.useEffect(() => setCity(city), [city]);
  React.useEffect(() => setDistrict(district), [district]);

  const [states, setStates] = React.useState<AddressState[]>([]);
  const [cities, setCities] = React.useState<AddressCity[]>([]);
  const [districts, setDistricts] = React.useState<AddressDistrict[]>([]);

  React.useEffect(() => {
    if (regionState == null) setStates([]);
    else
      api.states(regionState).then((items) => {
        if (items == null || !isMounted.current) return;
        setStates(items);
      });
  }, [regionState]);
  React.useEffect(() => {
    if (stateState == null) setCities([]);
    else
      api.cities(stateState).then((items) => {
        if (items == null || !isMounted.current) return;
        setCities(items);
      });
  }, [stateState]);
  React.useEffect(() => {
    if (cityState == null) setDistricts([]);
    else
      api.districts(cityState).then((items) => {
        if (items == null || !isMounted.current) return;
        setDistricts(items);
      });
  }, [cityState]);

  // Handle field change
  const handleChange = <F extends AddressField>(event: AddressFieldType<F>) => {
    if (!isMounted.current) return;

    if (onChange) onChange(event);

    const [field, data] = event;

    if (field === AddressField.Region) {
      if (data == null) {
        setRegion(undefined);
      } else {
        setRegion(data.id);
      }
      setState(undefined);
      setCity(undefined);
      setDistrict(undefined);

      return;
    }

    if (field === AddressField.State) {
      if (data == null) {
        setState(undefined);
      } else {
        setState(data.id);
      }
      setCity(undefined);
      setDistrict(undefined);

      return;
    }

    if (field === AddressField.City) {
      if (data == null) {
        setCity(undefined);
      } else {
        setCity(data.id);
      }
      setDistrict(undefined);

      return;
    }

    if (data == null) {
      setDistrict(undefined);
    } else {
      setDistrict(data.id);
    }
  };

  // Layout
  return (
    <React.Fragment>
      {label && (
        <Grid item xs={12}>
          <FormLabel
            required={required}
            sx={{ fontSize: (theme) => theme.typography.caption }}
          >
            {label}
          </FormLabel>
        </Grid>
      )}
      {!hideRegion && (
        <Grid item {...breakPoints}>
          <Tiplist<AddressRegionDb>
            label={regionLabel}
            name={AddressField.Region}
            search={search}
            fullWidth
            idValue={regionState}
            loadData={(keyword, id, items) =>
              api.getRegions({ keyword, id, items })
            }
            inputRequired={required}
            inputError={error}
            inputHelperText={helperText}
            onChange={(_event, value) =>
              handleChange([AddressField.Region, value])
            }
          />
        </Grid>
      )}
      <Grid item {...breakPoints}>
        <ComboBox<AddressState>
          name={AddressField.State}
          label={stateLabel}
          search={search}
          fullWidth
          idValue={stateState}
          options={states}
          inputRequired={hideRegion ? required : undefined}
          inputError={hideRegion ? error : undefined}
          inputHelperText={hideRegion ? helperText : undefined}
          onChange={(_event, value) =>
            handleChange([AddressField.State, value])
          }
        />
      </Grid>
      <Grid item {...breakPoints}>
        <ComboBox<AddressCity>
          name={AddressField.City}
          label={cityLabel}
          search={search}
          fullWidth
          idValue={cityState}
          options={cities}
          onChange={(_event, value) => handleChange([AddressField.City, value])}
        />
      </Grid>
      <Grid item {...breakPoints}>
        <ComboBox<AddressDistrict>
          name={AddressField.District}
          label={districtLabel}
          search={search}
          fullWidth
          idValue={districtState}
          options={districts}
          onChange={(_event, value) =>
            handleChange([AddressField.District, value])
          }
        />
      </Grid>
    </React.Fragment>
  );
}
