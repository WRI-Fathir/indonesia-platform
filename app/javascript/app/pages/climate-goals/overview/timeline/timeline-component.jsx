/*
  filename: timeline-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import ReactMarkdown from 'react-markdown';
import { TabletLandscape, TabletPortraitOnly } from 'components/responsive';
import { Icon } from 'cw-components';
import TimelineProvider from 'providers/timeline-provider';

import issued from 'assets/icons/issued';
import launched from 'assets/icons/launched';

import styles from './timeline-styles.scss';

const table = documents => (
  <table className={styles.table}>
    <tbody>
      {documents.map(document => (
        <tr key={document.label} className={styles.row}>
          <td className={cx(styles.statusColumn, styles.cell)}>
            <TabletLandscape>
              <span className={styles.status}>
                {document.year}
              </span>
            </TabletLandscape>
            <Icon
              icon={document.year === '2020' ? issued : launched}
              theme={{ icon: cx(styles.statusIcon) }}
            />
          </td>
          <td className={cx(styles.cell, styles.description)}>
            <TabletPortraitOnly>
              <p>{document.year}</p>
            </TabletPortraitOnly>
            {document.label && <ReactMarkdown source={document.label} />}
            <a href={document.link} rel="noopener noreferrer" target="_blank">
              Data source
            </a>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

class Timeline extends PureComponent {
  render() {
    const { documents } = this.props;
    return (
      <React.Fragment>
        {documents && table(documents)}
        <TimelineProvider />
      </React.Fragment>
    );
  }
}

Timeline.propTypes = { documents: PropTypes.array };

Timeline.defaultProps = { documents: [] };

export default Timeline;
