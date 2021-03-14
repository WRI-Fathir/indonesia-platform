import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import castArray from 'lodash/castArray';

import Map from 'components/map';
import MapChoroplethLegend from 'components/map-choropleth-legend';

import styles from './regions-map-styles.scss';

const MAP_ZOOM_STEP = 1;
const MAP_ZOOM_DEFAULT = 6;
const MAP_ZOOM_MIN = 3;

const MapTooltip = ({ properties }) => (
  <div>
    {properties && properties.name}
  </div>
);

MapTooltip.propTypes = { properties: PropTypes.object.isRequired };

class RegionsMap extends PureComponent {
  constructor() {
    super();
    this.state = { 
      mapZoom: MAP_ZOOM_DEFAULT,
     };
  }

  handleProvinceClick = e => {
    const { linkToProvince, query } = this.props;

    const provinceISO = e.properties && e.properties.code_hasc;

    if (!provinceISO) return;

    linkToProvince({
      section: 'regions-ghg-emissions',
      region: provinceISO
    });
    this.props.handleClickOutside
  };

  handleZoomIn = () => {
    this.setState(({ mapZoom }) => ({ mapZoom: mapZoom * MAP_ZOOM_STEP }));
  };

  handleZoomOut = () => {
    this.setState(({ mapZoom }) => {
      const newMapZoom = mapZoom / MAP_ZOOM_STEP;
      return { mapZoom: newMapZoom < MAP_ZOOM_MIN ? mapZoom : newMapZoom };
    });
  };

  render() {
    const { paths, buckets, mapCenter, unit, mapLegendTitle, hoverRegion } = this.props;
    const { mapZoom } = this.state;
    const mapStyle = { width: '100%', height: '100%' };
    return (
      <div className={styles.mapContainer}>
        <Map
          zoom={mapZoom}
          paths={paths}
          center={mapCenter}
          className={styles.map}
          style={mapStyle}
          onGeographyClick={this.handleProvinceClick}
          tooltip={MapTooltip}
          zoomEnable={false}
          dragEnable={false}
          forceUpdate
        />
      </div>
    );
  }
}

RegionsMap.propTypes = {
  paths: PropTypes.array,
  mapCenter: PropTypes.array,
  hoverRegion: PropTypes.string
};

RegionsMap.defaultProps = {
  mapCenter: [ 113, -1.86 ],
  paths: [],
  hoverRegion: ''
};

export default RegionsMap;
