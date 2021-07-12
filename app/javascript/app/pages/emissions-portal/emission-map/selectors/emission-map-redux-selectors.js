/*
  filename: emission-map-redux-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

export const getEmissionActivities = ({ emissionActivities }) =>
  emissionActivities && emissionActivities.data;

export const getMetadataData = ({ metadata }) =>
  metadata && metadata.ghgindo && metadata.ghgindo.data;

export const getGHGEmissionData = ({ GHGEmissions }) =>
  GHGEmissions && GHGEmissions.data || null;

export const getAdaptation = ({ adaptation }) => adaptation && adaptation.data;

export const getQuery = ({ location }) => location && location.query || null;
