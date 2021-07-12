/*
  filename: home-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import { Section } from 'cw-components';
import background from 'assets/hero';
import PropTypes from 'prop-types';
import Province from 'components/province';
import CwDisclaimer from 'components/cw-disclaimer';
import HighlightedStories from 'components/stories';
import { TabletLandscape } from 'components/responsive';
import SectionsSlideshow from './sections-slideshow';
import GHGMap from './ghg-map';

import styles from './home-styles.scss';

class Home extends PureComponent {
  render() {
    const { t } = this.props;

    return (
      <div className={styles.page}>
        <Section backgroundImage={background} theme={styles}>
          <div className="layout-container">
            <div className={styles.introTextContainer}>
              <h1 className={styles.pageTitle}>
                <div className={styles.country}>
                  INDONESIA
                </div>
                <div className={styles.climateExplorer}>
                  <span className={styles.bold}>CLIMATE </span>
                  WATCH
                </div>
              </h1>
              <p
                className={styles.introText}
                dangerouslySetInnerHTML={{ __html: t('pages.homepage.intro') }}
              />
            </div>
          </div>
          <div className="layout-container">
            {}
          </div>
        </Section>
        <SectionsSlideshow />
        <Province
          title={t('pages.homepage.province.title')}
          description={t('pages.homepage.province.description')}
        />
        <CwDisclaimer />
        <HighlightedStories />
      </div>
    );
  }
}

Home.propTypes = { t: PropTypes.func.isRequired };

export default Home;
