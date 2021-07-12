/*
  filename: sectoral-activity-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SectionTitle from 'components/section-title';
import kebabCase from 'lodash/kebabCase';
import { Dropdown, PlayTimeline } from 'cw-components';
import InfoDownloadToolbox from 'components/info-download-toolbox';
import Map from 'components/map';
import DotLegend from 'components/dot-legend';
import AdaptationProvider from 'providers/adaptation-provider';
import EmissionActivitiesProvider from 'providers/emission-activities-provider';
import GHGEmissionsProvider from 'providers/ghg-emissions-provider';
import MetadataProvider from 'providers/metadata-provider';
import dropdownStyles from 'styles/dropdown.scss';
import MapTooltip from './map-tooltip';

import styles from './sectoral-activity-styles.scss';

const MAP_CENTER = [ 120, -4 ];

class SectoralActivity extends Component {
  constructor() {
    super();
    this.state = { disablePlay: false };
  }

  handleFilterChange = (filter, selected) => {
    const { onFilterChange } = this.props;
    const isIndicatorFilter = filter === 'indicator';
    const clear = isIndicatorFilter;
    onFilterChange({ [filter]: selected.value }, clear);
  };

  handlePlay = () => {
    const { selectedOptions, onFilterChange, years } = this.props;
    const selectedYear = selectedOptions && selectedOptions.year;
    const initialYear = selectedYear && selectedYear.value;
    let currentYearIndex = 0;
    this.setState({ disablePlay: true });

    const playAtStart = setInterval(
      () => {
        if (years[currentYearIndex]) {
          onFilterChange({ year: String(years[currentYearIndex]) });
        }
        if (currentYearIndex > years.length - 1) {
          clearInterval(playAtStart);
          setTimeout(
            () => {
              onFilterChange({ year: String(initialYear) });
              this.setState({ disablePlay: false });
            },
            1000
          );
        }
        currentYearIndex += 1;
      },
      500
    );
  };

  renderDropdown = field => {
    const {
      options,
      activityOptions,
      selectedActivity,
      selectedOptions,
      activitySelectable,
      t
    } = this.props;
    const isActivityDropdown = field === 'activity';
    const dropdownOptions = isActivityDropdown
      ? activityOptions
      : options[field] || [];
    const value = isActivityDropdown
      ? selectedActivity
      : selectedOptions && selectedOptions[field];
    const label = t(
      `pages.national-context.sectoral-activity.labels.${kebabCase(field)}`
    );
    const disabled = isActivityDropdown && !activitySelectable;

    return (
      <Dropdown
        key={field}
        label={label}
        disabled={disabled}
        placeholder={`Filter by ${label}`}
        options={dropdownOptions}
        onValueChange={selected => this.handleFilterChange(field, selected)}
        value={value || null}
        theme={{ select: dropdownStyles.select }}
        hideResetButton
      />
    );
  };

  renderTimeline = () => {
    const { years, selectedOptions } = this.props;
    const { disablePlay } = this.state;
    const selectedYear = selectedOptions && selectedOptions.year;

    const yearsAsStrings = years.map(y => String(y));

    return (
      <div className={styles.timelineWrapper}>
        <PlayTimeline
          onPlay={this.handlePlay}
          years={yearsAsStrings}
          selectedYear={selectedYear && selectedYear.value}
          disablePlay={disablePlay}
        />
      </div>
    );
  };

  render() {
    const {
      map,
      adaptationParams,
      emissionParams,
      selectedOptions,
      adaptationCode,
      sources,
      t
    } = this.props;

    const yearsSelectable = selectedOptions.indicator &&
      selectedOptions.indicator.value !== adaptationCode;

    return (
      <div>
        <div className={styles.page}>
          <SectionTitle
            title={t('pages.national-context.sectoral-activity.title')}
            description={t(
              'pages.national-context.sectoral-activity.description'
            )}
          />
          <div className={styles.filtersGroup}>
            <div className={styles.filters}>
              {this.renderDropdown('indicator')}
              {this.renderDropdown('activity')}
              {yearsSelectable && this.renderDropdown('year')}
            </div>
            <InfoDownloadToolbox
              className={{ buttonWrapper: styles.buttonWrapper }}
              slugs={sources}
              downloadUri="emission_activities.zip"
            />
          </div>
          <EmissionActivitiesProvider />
          <MetadataProvider meta="ghgindo" />
          {emissionParams && <GHGEmissionsProvider params={emissionParams} />}
          {adaptationParams && <AdaptationProvider params={adaptationParams} />}
        </div>
        <div className={styles.mapSection}>
          <div className={styles.mapContainer}>
            {
              map && (
              <React.Fragment>
                <Map
                  zoom={5}
                  paths={map.paths}
                  forceUpdate
                  center={MAP_CENTER}
                  className={styles.map}
                  tooltip={MapTooltip}
                />
                <div className={styles.legend}>
                  <DotLegend legend={map.legend} />
                </div>
                {yearsSelectable && this.renderTimeline()}
              </React.Fragment>
                )
            }
          </div>
        </div>
      </div>
    );
  }
}

SectoralActivity.propTypes = {
  t: PropTypes.func.isRequired,
  map: PropTypes.shape({ paths: PropTypes.array, legend: PropTypes.array }),
  years: PropTypes.array,
  options: PropTypes.object,
  selectedOptions: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
  adaptationParams: PropTypes.object.isRequired,
  adaptationCode: PropTypes.string.isRequired,
  emissionParams: PropTypes.object,
  activitySelectable: PropTypes.bool.isRequired,
  activityOptions: PropTypes.array,
  selectedActivity: PropTypes.object,
  sources: PropTypes.array
};

SectoralActivity.defaultProps = {
  map: {},
  options: {},
  years: [],
  selectedOptions: {},
  activityOptions: [],
  selectedActivity: {},
  sources: [],
  emissionParams: null
};

export default SectoralActivity;
