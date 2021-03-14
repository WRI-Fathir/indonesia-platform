import {
  PRIMARY_SOURCE_OF_EMISSION_INDICATOR,
  ADAPTATION_CODE
} from './emission-map-constants';

export const isPrimarySourceOfEmissionSelected = selectedIndicator =>
  selectedIndicator &&
    selectedIndicator.value === PRIMARY_SOURCE_OF_EMISSION_INDICATOR;

export const isAdaptationSelected = selectedIndicator =>
  selectedIndicator && selectedIndicator.value === ADAPTATION_CODE;

export const isActivitySelectable = selectedIndicator =>
  !isPrimarySourceOfEmissionSelected(selectedIndicator) &&
    !isAdaptationSelected(selectedIndicator);
