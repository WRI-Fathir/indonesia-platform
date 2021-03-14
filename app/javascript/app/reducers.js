import { combineReducers } from 'redux';
import { handleModule } from 'redux-tools';

// Components
import { reduxModule as ghgEmissions } from 'providers/ghg-emissions-provider';
import { reduxModule as emissionProjection } from 'providers/emission-projection-provider';
import {
  reduxModule as ghgTargetEmissions
} from 'providers/ghg-target-emissions-provider';
import { reduxModule as modalMetadata } from 'components/modal-metadata';
import { reduxModule as metadata } from 'providers/metadata-provider';
import {
  reduxModule as ghgInventoryMetadata
} from 'providers/ghg-inventory-metadata-provider';
import { reduxModule as worldBank } from 'providers/world-bank-provider';
import {
  reduxModule as fundingOportunities
} from 'providers/funding-oportunities-provider';

// Providers
import { reduxModule as indicators } from 'providers/indicators-provider';
import { reduxModule as policies } from 'providers/policies-provider';
import { reduxModule as provinceMeta } from 'providers/province-meta-provider';
import {
  reduxModule as emissionActivites
} from 'providers/emission-activities-provider';
import { reduxModule as adaptation } from 'providers/adaptation-provider';
import { reduxModule as translations } from 'providers/translations-provider';
import { reduxModule as locations } from 'providers/locations-provider';
import { reduxModule as climatePlans } from 'providers/climate-plans-provider';
import {
  reduxModule as developmentPlans
} from 'providers/development-plans-provider';
import {
  reduxModule as ndcContentOverview
} from 'providers/ndc-content-overview-provider';
import { reduxModule as timeline } from 'providers/timeline-provider';
import {
  reduxModule as ndcCountryAccordion
} from 'components/ndcs-country-accordion';

// Router
import router from './router';

const componentsReducers = {
  GHGEmissions: handleModule(ghgEmissions),
  EmissionProjection: handleModule(emissionProjection),
  GHGTargetEmissions: handleModule(ghgTargetEmissions),
  modalMetadata: handleModule(modalMetadata),
  metadata: handleModule(metadata),
  ghgInventoryMetadata: handleModule(ghgInventoryMetadata),
  WorldBank: handleModule(worldBank),
  FundingOportunities: handleModule(fundingOportunities),
  ndcCountryAccordion: handleModule(ndcCountryAccordion)
};

const providerReducers = {
  translations: handleModule(translations),
  indicators: handleModule(indicators),
  policies: handleModule(policies),
  provinceMeta: handleModule(provinceMeta),
  emissionActivities: handleModule(emissionActivites),
  adaptation: handleModule(adaptation),
  provinces: handleModule(locations),
  climatePlans: handleModule(climatePlans),
  developmentPlans: handleModule(developmentPlans),
  ndcContentOverview: handleModule(ndcContentOverview),
  timeline: handleModule(timeline)
};

export default combineReducers({
  location: router.reducer,
  ...componentsReducers,
  ...providerReducers
});
