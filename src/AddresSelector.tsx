import {
  AddressApi,
  AddressCity,
  AddressDistrict,
  AddressRegionDb,
  AddressState
} from "@etsoo/appscript";
import { FormLabel, Grid } from "@mui/material";
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

/**
 * Address selector props
 */
export type AddressSelectorProps = {
  /**
   * Address API
   */
  api: AddressApi;

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
    region,
    regionLabel = regionDefault,
    required,
    search,
    state,
    stateLabel = stateDefault
  } = props;

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
        if (items == null) return;
        setStates(items);
      });
  }, [regionState]);
  React.useEffect(() => {
    if (stateState == null) setCities([]);
    else
      api.cities(stateState).then((items) => {
        if (items == null) return;
        setCities(items);
      });
  }, [stateState]);
  React.useEffect(() => {
    if (cityState == null) setDistricts([]);
    else
      api.districts(cityState).then((items) => {
        if (items == null) return;
        setDistricts(items);
      });
  }, [cityState]);

  // Field size
  const fieldSize = hideRegion ? 4 : 3;

  // Handle field change
  const handleChange = (field: AddressField, value: unknown) => {
    if (field === AddressField.Region) {
      if (value == null) {
        setRegion(undefined);
      } else {
        setRegion(value as string);
      }
      setState(undefined);
      setCity(undefined);
      setDistrict(undefined);

      return;
    }

    if (field === AddressField.State) {
      if (value == null) {
        setState(undefined);
      } else {
        setState(value as string);
      }
      setCity(undefined);
      setDistrict(undefined);

      return;
    }

    if (field === AddressField.City) {
      if (value == null) {
        setCity(undefined);
      } else if (typeof value === "number") {
        setCity(value);
      } else {
        setCity(parseInt(`${value}`));
      }
      setDistrict(undefined);

      return;
    }

    if (value == null) {
      setDistrict(undefined);
    } else if (typeof value === "number") {
      setDistrict(value);
    } else {
      setDistrict(parseInt(`${value}`));
    }
  };

  console.log(regionState, stateState, cityState, districtState);

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
        <Grid item xs={12} md={6} lg={fieldSize}>
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
              handleChange(AddressField.Region, value?.id)
            }
          />
        </Grid>
      )}
      <Grid item xs={12} md={6} lg={fieldSize}>
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
            handleChange(AddressField.State, value?.id)
          }
        />
      </Grid>
      <Grid item xs={12} md={6} lg={fieldSize}>
        <ComboBox<AddressCity>
          name={AddressField.City}
          label={cityLabel}
          search={search}
          fullWidth
          idValue={cityState}
          options={cities}
          onChange={(_event, value) =>
            handleChange(AddressField.City, value?.id)
          }
        />
      </Grid>
      <Grid item xs={12} md={6} lg={fieldSize}>
        <ComboBox<AddressDistrict>
          name={AddressField.District}
          label={districtLabel}
          search={search}
          fullWidth
          idValue={districtState}
          options={districts}
          onChange={(_event, value) =>
            handleChange(AddressField.District, value?.id)
          }
        />
      </Grid>
    </React.Fragment>
  );
}
