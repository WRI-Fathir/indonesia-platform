/*
  filename: card-header-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React from 'react';
import PropTypes from 'prop-types';

import InfoDownloadToolbox from 'components/info-download-toolbox';

import styles from './card-header-styles.scss';

const CardHeader = ({ title, showInfoButton, infoSlugs, infoDownloadURI }) => (
  <div className={styles.cardHeader}>
    <span>{title}</span>
    {
      showInfoButton &&
        (
          <InfoDownloadToolbox
            className={{ buttonWrapper: styles.buttonWrapper }}
            slugs={infoSlugs}
            downloadUri={infoDownloadURI}
          />
        )
    }
  </div>
);

CardHeader.propTypes = {
  title: PropTypes.string,
  infoSlugs: PropTypes.array,
  infoDownloadURI: PropTypes.string,
  showInfoButton: PropTypes.bool
};

CardHeader.defaultProps = {
  title: '',
  showInfoButton: true,
  infoSlugs: [],
  infoDownloadURI: ''
};

export default CardHeader;
