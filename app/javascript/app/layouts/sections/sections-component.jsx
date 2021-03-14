import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Sticky from 'react-stickynode';
import universal from 'react-universal-component';
import { Loading, Button, Icon, Dropdown } from 'cw-components';
import Nav from 'components/nav';
import button from 'styles/themes/button';
import iconStyles from 'styles/themes/icon';
import openInNewIcon from 'assets/icons/open_in_new';
import cx from 'classnames';
import { NDC_LINKS_OPTIONS } from 'constants/constants';
import { COMPARE_NDC_LINK, NDC_LINK } from 'constants/links';

import theme from 'styles/themes/dropdown-links.scss';
import navStyles from 'components/nav/nav-styles';
import styles from './sections-styles.scss';

const { COUNTRY_ISO } = process.env;

const universalOptions = {
  loading: <Loading height={500} />,
  minDelay: 400
}

const SectionComponent = universal((
  { page, section } /* webpackChunkName: "[request]" */
) => (import(`../../pages${page}/${section}/${section}.js`)), universalOptions);

class Section extends PureComponent {
  handleStickyChange = (status) => {
    // Workaround fo fix bad height calculations
    // https://github.com/yahoo/react-stickynode/issues/102#issuecomment-362502692
    if (Sticky.STATUS_FIXED === status.status && this.stickyRef) {
      this.stickyRef.updateInitialDimension();
      this.stickyRef.update();
    }
  }

  handleCompareBtnClick = () => {
    const { section } = this.props;
    window.open(`${COMPARE_NDC_LINK}${section.slug}?locations=${COUNTRY_ISO}`, '_blank');
  };
  
  handleDocumentDropdownClick = selected => {
    window.open(`${NDC_LINK}/full?document=${selected.value}-EN`, '_blank');
  }

  render() {
    const { route, section, provinceInfo, t } = this.props;
    const title = (provinceInfo && provinceInfo.wri_standard_name)
                  || t(`pages.${route.slug}.title`);
    const description = t(`pages.${route.slug}.description`);
    const subsectionTitle = t(`pages.${route.slug}.${section.slug}.title`);
    const subsectionDescription = t(`pages.${route.slug}.${section.slug}.description`);
    const isClimateGoalsSection = title === t('pages.climate-goals.title');
    return (
      <div className={styles.page}>
        <div className={styles.section}>
          <div className={styles.fullHeader}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <div className='layout-columns-wrapper'>
              <div className={styles.descContainer}>
                <p className={styles.sectionDescription} dangerouslySetInnerHTML={{ __html: description }} />
                {isClimateGoalsSection && (
                  <React.Fragment>
                    <Dropdown
                      className={theme.dropdownOptionWithArrow}
                      placeholder={t('pages.climate-goals.overview.dropdown-documents-placeholder')}
                      options={NDC_LINKS_OPTIONS}
                      onValueChange={this.handleDocumentDropdownClick}
                    />
                    <Button
                      onClick={this.handleCompareBtnClick}
                      theme={{ button: cx(button.primary, styles.button) }}
                    >
                      <span
                        className={styles.buttonText}
                        dangerouslySetInnerHTML={{
                          __html: t('pages.climate-goals.overview.button-title')
                        }}
                      />
                      <Icon
                        theme={{ icon: iconStyles.openInNewIcon }}
                        icon={openInNewIcon}
                      />
                    </Button>
                  </React.Fragment>
                )}
              </div>
            </div>
          </div>
          <Sticky ref={el => { this.stickyRef = el }} onStateChange={this.handleStickyChange} top="#header" activeClass={styles.stickyWrapper} innerZ={3}>
            <div className={styles.stickyContent}>
              <h2 className={styles.stickySectionTitle}>{title}</h2>
              <Nav theme={{ nav: styles.nav, link: navStyles.linkSubNav }} parent={route} routes={route.sections} />
            </div>
          </Sticky>
        </div>
        <SectionComponent page={route.module} section={section.slug} title={subsectionTitle} description={subsectionDescription} />
      </div>
    );
  }
}

Section.propTypes = {
  t: PropTypes.func.isRequired,
  route: PropTypes.object.isRequired,
  section: PropTypes.object.isRequired,
  provinceInfo: PropTypes.object
}

Section.defaultProps = {
  provinceInfo: null
}

export default Section;
