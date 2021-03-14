export const getEmissionActivities = ({ emissionActivities }) =>
  emissionActivities && emissionActivities.data;

export const getMetadataData = ({ metadata }) =>
  metadata && metadata.ghgindo && metadata.ghgindo.data;

export const getGHGEmissionData = ({ GHGEmissions }) =>
  GHGEmissions && GHGEmissions.data || null;

export const getAdaptation = ({ adaptation }) => adaptation && adaptation.data;

export const getQuery = ({ location }) => location && location.query || null;
