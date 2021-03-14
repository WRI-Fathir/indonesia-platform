import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { ButtonGroup, Button, Icon } from 'cw-components';
import iconInfo from 'assets/icons/info';
import downloadIcon from 'assets/icons/download';
import downloadFileIcon from 'assets/icons/download-file';
import shareIcon from 'assets/icons/share';
import buttonThemes from 'styles/themes/button';
import ReactTooltip from 'react-tooltip';
import ModalMetadata from 'components/modal-metadata';
import DownloadMenu from 'components/download-menu';
import { handleAnalytics } from 'utils/analytics';
import { appendParamsToURL } from 'utils';
import styles from './info-download-toolbox-styles.scss';

const { API_URL } = process.env;

const getURL = downloadUri =>
  downloadUri.startsWith('http') ? downloadUri : `${API_URL}/${downloadUri}`;

class InfoDownloadToolbox extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { opened: false };
  }

  handleClickOutside = () => {
    this.setState({ opened: false });
  };

  handleShareClick = () => {
    const { shareableLink } = this.props;
    if (shareableLink) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${shareableLink}`
      window.open(url, '_blank');
    }
  }

  handleDownloadClick = () => {
    const { downloadUri, locale } = this.props;
    if (downloadUri) {
      const url = appendParamsToURL(getURL(downloadUri), { locale });
      handleAnalytics('Data Download', 'Download', url);
      window.open(url, '_blank');
    }
  };

  handleMenuDownloadClick = option => {
    const { locale } = this.props;
    const isPDF = option.value === 'pdf';
    handleAnalytics('Data Download', 'Download', option.url);

    if (isPDF) {
      window.open(option.url, '_blank');
    } else {
      const url = appendParamsToURL(getURL(option.url), { locale });
      window.open(url, '_blank');
    }
  };

  handleInfoClick = () => {
    const { slugs, setModalMetadata, t } = this.props;

    if (!slugs) return;

    const slugString = Array.isArray(slugs) ? slugs.join(',') : slugs;

    handleAnalytics('Info Window', 'Open', slugString);
    setModalMetadata({
      slugs,
      open: true,
      customTitle: t('common.metadata.modal-default-title')
    });
  };

  render() {
    const {
      theme,
      downloadUri,
      className,
      noDownload,
      infoTooltipdata,
      downloadTooltipdata,
      downloadOptions,
      pdfUri,
      shareableLink
    } = this.props;

    const { opened } = this.state;

    const renderDownloadButton = () => {
      const isDownloadMenu = downloadOptions && downloadOptions.length > 0;
      return isDownloadMenu ? (
        <React.Fragment>
          <Button
            onClick={() => this.setState({ opened: !opened })}
            theme={{
              button: cx(buttonThemes.outline, styles.button, theme.infobutton)
            }}
          >
            <div
              data-for="blueTooltip"
              data-tip={downloadTooltipdata || 'Download chart in .csv'}
            >
              <div className={styles.iconWrapper}>
                <Icon icon={downloadIcon} />
              </div>
            </div>
          </Button>
          <DownloadMenu
            opened={opened}
            options={downloadOptions}
            handleDownload={this.handleMenuDownloadClick}
            handleClickOutside={this.handleClickOutside}
          />
        </React.Fragment>
) : (
  <div
    data-for="blueTooltip"
    data-tip={downloadTooltipdata || 'Download chart in .csv'}
  >
    <Button
      onClick={this.handleDownloadClick}
      theme={{
              button: cx(buttonThemes.outline, styles.button, theme.infobutton)
            }}
      disabled={!downloadUri}
    >
      <Icon icon={downloadIcon} />
    </Button>
  </div>
);
    };

    const renderPdfButton = () => (
      <div
        data-for="blueTooltip"
        data-tip={downloadTooltipdata || 'Download pdf'}
      >
        <Button
          onClick={this.handleDownloadClick}
          theme={{
              button: cx(buttonThemes.outline, styles.button, theme.infobutton)
            }}
        >
          <Icon icon={downloadFileIcon} />
        </Button>
      </div>
      );

    const renderShareButton = () => (
      <div data-for="blueTooltip" data-tip={downloadTooltipdata || 'Share'}>
        <Button
          onClick={this.handleShareClick}
          theme={{
              button: cx(buttonThemes.outline, styles.button, theme.infobutton)
            }}
        >
          <Icon icon={shareIcon} />
        </Button>
      </div>
      );

    return (
      <ButtonGroup
        theme={{
          wrapper: cx(
            styles.buttonWrapper,
            theme.buttonWrapper,
            className.buttonWrapper
          )
        }}
      >
        <div
          data-for="blueTooltip"
          data-tip={infoTooltipdata || 'Chart information'}
        >
          <Button
            onClick={this.handleInfoClick}
            theme={{
              button: cx(buttonThemes.outline, styles.button, theme.infobutton)
            }}
          >
            <Icon icon={iconInfo} />
          </Button>
        </div>
        <div>
          {shareableLink && renderShareButton()}
        </div>
        <div>
          {!noDownload && renderDownloadButton()}
        </div>
        <div>
          {pdfUri && renderPdfButton()}
        </div>
        <ReactTooltip
          id="blueTooltip"
          effect="solid"
          className="global_blueTooltip"
        />
        <ModalMetadata />
      </ButtonGroup>
    );
  }
}

InfoDownloadToolbox.propTypes = {
  t: PropTypes.func.isRequired,
  theme: PropTypes.shape({
    buttonWrapper: PropTypes.string,
    infobutton: PropTypes.string
  }),
  className: PropTypes.object,
  slugs: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]),
  downloadUri: PropTypes.string,
  infoTooltipdata: PropTypes.string,
  downloadTooltipdata: PropTypes.string,
  setModalMetadata: PropTypes.func.isRequired,
  noDownload: PropTypes.bool,
  downloadOptions: PropTypes.array,
  locale: PropTypes.string.isRequired,
  pdfUri: PropTypes.string,
  shareableLink: PropTypes.string
};

InfoDownloadToolbox.defaultProps = {
  theme: {},
  className: {},
  slugs: [],
  downloadUri: null,
  infoTooltipdata: null,
  downloadTooltipdata: null,
  downloadOptions: [],
  noDownload: false,
  pdfUri: null,
  shareableLink: null
};

export default InfoDownloadToolbox;
