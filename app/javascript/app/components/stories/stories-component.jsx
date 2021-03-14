import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import SectionTitle from 'components/section-title';
import { Icon, Button } from 'cw-components';
import yellowWriLogo from 'assets/yellow-wri-logo.svg';
import { WRI_INDONESIA_WEBSITE } from 'constants/links';
import button from 'styles/themes/button';
import styles from './stories-styles.scss';

class Stories extends PureComponent {
  constructor(props) {
    super(props);
  
    this.state = {
      stories: {
        en: [],
        id: []
      }
    };
  }

  componentDidMount() {
    this.getStories()
  }

  async getStories() {
    const response = await fetch('https://urundata.id/cwi/blogs')
    if(response.ok) {
      const data = await response.json()
      this.setState({
        stories: data
      })
    }
  }

  handleBtnClick = () => {
    const { locale } = this.props;
    window.open(`${WRI_INDONESIA_WEBSITE}/${locale}/blog`, '_blank');
  };

  handleStoryClick = link => {
    window.open(link, '_blank');
  };

  render() {
    const { t, locale } = this.props;
    const { stories } = this.state;
    const { title, button: buttonTitle } = t(
      'pages.homepage.highlighted-stories'
    );

    return (
      <div className={styles.wrapper}>
        <SectionTitle title={title} />
        <div className={styles.grid}>
          {stories[locale].map((story, index) => {
            const i = index + 1;
            const childClassName = `child-${i}`;
            return (
              <div
                key={story.title}
                role="link"
                tabIndex={0}
                className={cx(styles.story, styles[childClassName])}
                onClick={() => this.handleStoryClick(story.link)}
                onKeyDown={() => this.handleStoryClick(story.link)}
              >
                <div className={styles.storyDate}>
                  {story.date}
                </div>
                <div className={styles.storyTitle}>
                  {story.title}
                </div>
                <div className={styles.storyDescription}>
                  {story.description}
                </div>
                <div className={styles.logoContainer}>
                  <Icon
                    alt="Wri logo"
                    icon={yellowWriLogo}
                    theme={{ icon: styles.icon }}
                  />
                  <span className={styles.text}>
                    By World Resources Institute
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <Button
          onClick={this.handleBtnClick}
          theme={{ button: cx(button.primary, styles.button) }}
        >
          <span dangerouslySetInnerHTML={{ __html: buttonTitle }} />
        </Button>
      </div>
    );
  }
}

Stories.propTypes = {
  locale: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  stories: PropTypes.object
};

Stories.defaultProps = { stories: {} };

export default Stories;
