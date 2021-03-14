import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Carousel } from 'cw-components';
import Link from 'redux-first-router-link';
// redirect actions
import { NATIONAL_CONTEXT, CLIMATE_GOALS, REGIONS, EMISSIONS_PORTAL } from 'router';
import routerRegionSections from 'router/sections/regions';
// images
import climateSmImage from 'assets/carousel_climate_goals@1x';
import climateBgImage from 'assets/carousel_climate_goals@2x';
import nationalSmImage from 'assets/carousel_national_context@1x';
import nationalBgImage from 'assets/carousel_national_context@2x';
import anualSmImage from 'assets/carousel_annual_emissions@1x';
import anualBgImage from 'assets/carousel_annual_emissions@2x';
import emissionPortalSmImage from 'assets/carousel_emission_portal@1x';
import emissionPortalBgImage from 'assets/carousel_emission_portal@2x';

import styles from './sections-slideshow-styles.scss';

const TopSlide = ({ title, text, buttonText, routerAction }) => (
  <div className={styles.slideWrapper} key={title}>
    <h3 className={styles.slideTitle}>{title}</h3>
    <p className={styles.slideParagraph}>
      {text}
    </p>
    <Button theme={{ button: styles.button }}>
      <Link to={routerAction} onMouseDown={undefined} onTouchStart={undefined}>
        {buttonText}
      </Link>
    </Button>
  </div>
);

const BottomSlide = ({ smImage, bgImage, altText }) => (
  <div className={styles.bottomSlideContainer} key={altText}>
    <img
      className={styles.image}
      src={smImage}
      srcSet={`${smImage}, ${bgImage} 2x`}
      alt={altText}
    />
  </div>
);

class SectionsSlideshowComponent extends Component {
  pagingTitles = slidesData => slidesData.map(s => s.pagingTitle);

  renderSlides = slidesData => {
    const tops = slidesData &&
      slidesData.map(slide => (
        <TopSlide
          key={slide.title}
          title={slide.title}
          text={slide.text}
          buttonText={slide.buttonText}
          routerAction={slide.routerAction}
          topSlide
        />
      ));

    const bottoms = slidesData &&
      slidesData.map(slide => (
        <BottomSlide
          key={slide.smImage}
          smImage={slide.smImage}
          bgImage={slide.bgImage}
          altText={slide.altText}
          bottomSlide
        />
      ));

    return [ ...tops, ...bottoms ];
  };

  render() {
    const { t, locale } = this.props;

    const slideOne = t('pages.homepage.slide-one') || {};
    const slideTwo = t('pages.homepage.slide-two') || {};
    const slideThree = t('pages.homepage.slide-three') || {};
    const slideFour = t('pages.homepage.slide-four') || {};
    const regionsPayload = {
      locale,
      region: 'ID.PB',
      section: routerRegionSections.find(section => section.default).slug
    };

    const slidesData = [
      {
        pagingTitle: slideThree.paging,
        title: slideThree.title,
        text: slideThree.description,
        buttonText: slideThree.button,
        smImage: anualSmImage,
        bgImage: anualBgImage,
        altText: 'GHG chart',
        routerAction: { type: EMISSIONS_PORTAL }
      },
      {
        pagingTitle: slideFour.paging,
        title: slideFour.title,
        text: slideFour.description,
        buttonText: slideFour.button,
        smImage: emissionPortalSmImage,
        bgImage: emissionPortalBgImage,
        altText: 'Emission Portal',
        routerAction: { type: REGIONS, payload: regionsPayload }
      },
      {
        pagingTitle: slideTwo.paging,
        title: slideTwo.title,
        text: slideTwo.description,
        buttonText: slideTwo.button,
        smImage: nationalSmImage,
        bgImage: nationalBgImage,
        altText: 'National context chart',
        routerAction: { type: NATIONAL_CONTEXT }
      },
      {
        pagingTitle: slideOne.paging,
        title: slideOne.title,
        text: slideOne.description,
        buttonText: slideOne.button,
        smImage: climateSmImage,
        bgImage: climateBgImage,
        altText: 'Climate goals chart',
        routerAction: { type: CLIMATE_GOALS }
      },
    ];

    return (
      <section className={styles.container}>
        <Carousel pagingTitles={this.pagingTitles(slidesData)}>
          {this.renderSlides(slidesData)}
        </Carousel>
      </section>
    );
  }
}

TopSlide.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  buttonText: PropTypes.string,
  routerAction: PropTypes.object
};

TopSlide.defaultProps = {
  title: null,
  text: null,
  buttonText: null,
  routerAction: null
};

BottomSlide.propTypes = {
  smImage: PropTypes.string.isRequired,
  bgImage: PropTypes.string.isRequired,
  altText: PropTypes.string.isRequired
};

SectionsSlideshowComponent.propTypes = { t: PropTypes.func.isRequired };

SectionsSlideshowComponent.defaultProps = { slides: {} };
export default SectionsSlideshowComponent;
