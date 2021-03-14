import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, Icon } from 'cw-components';
import styles from './modal-share-styles';
import shareIcon from 'assets/icons/share.svg';
import facebookIcon from 'assets/icons/facebook.svg';
import twitterIcon from 'assets/icons/twitter.svg';
import mailIcon from 'assets/icons/mail.svg';
import linkIcon from 'assets/icons/link.svg';
import codeIcon from 'assets/icons/code.svg';
import checkIcon from 'assets/icons/check.svg';
import copy from 'copy-to-clipboard';
import cx from 'classnames';

const embedUri = `/embed${'sharePath' || pathname.replace('/embed', '')}`;
const url = `${origin}${embedUri}${encodeURIComponent('queryParams')}`;
const copyUrl = () => copy(url);
const iframeCode = `<iframe src="${url}" frameborder="0" style="height: 600px; width: 1230px"></iframe>`;
const copyCode = () => copy(iframeCode);
const shareMenuOptions = [
  {
    key: 'socialOptions',
    options: [
      {
        label: 'Email',
        icon: mailIcon,
        link: `mailto:?subject=Climate%20Watch&body=${'url'}`
      },
      {
        label: 'Facebook',
        icon: facebookIcon,
        link: `https://www.facebook.com/sharer/sharer.php?u=${'url'}`
      },
      {
        label: 'Twitter',
        icon: twitterIcon,
        link: `https://twitter.com/intent/tweet?url=${'url'}`
      }
    ]
  },
  {
    key: 'embedOptions',
    options: [
      {
        label: 'Copy Embed URL',
        icon: linkIcon,
        action: copyUrl
      }
    ]
  }
];

class ModalShare extends PureComponent {
  constructor(props) {
    super(props);
  
    this.state = {
      shareMenuOptions: [
        {
          key: 'socialOptions',
          options: [
            {
              label: 'Email',
              icon: mailIcon,
              link: `mailto:?subject=Climate%20Watch&body=${this.props.sharePath}`
            },
            {
              label: 'Facebook',
              icon: facebookIcon,
              link: `https://www.facebook.com/sharer/sharer.php?u=${this.props.sharePath}`
            },
            {
              label: 'Twitter',
              icon: twitterIcon,
              link: `https://twitter.com/intent/tweet?url=${this.props.sharePath}`
            }
          ]
        },
        {
          key: 'embedOptions',
          options: [
            {
              label: 'Copy URL',
              icon: linkIcon,
              action: copyUrl
            }
          ]
        }
      ],
      copied: false
    };
  }

  handleLinkClick = () => {
    const { closeModal } = this.props;
    closeModal()
    this.setState({copied: false})
  };

  handleActionClick = option => {
    copy(this.props.sharePath)
    this.setState({copied: true})
  };

  renderInsideLink = (option, withAction = false) => {
   return (
      <div
        className={cx(styles.documentLink)}
        key={option.label}
      >
        {option.icon &&
          (withAction && this.state.copied ? (
            <Icon icon={checkIcon} className={styles.icon} style={{marginRight: 5}} />
          ) : (
            <Icon icon={option.icon} className={styles.icon} style={{marginRight: 5}} />
          ))}
        <span className={styles.title}>{option.label}</span>
      </div>
    );
  }

  renderLink = option => {
    if (option.path) {
      return (
        <NavLink
          className={styles.link}
          activeClassName={styles.active}
          to={option.path}
          onClick={this.handleLinkClick}
        >
          {this.renderInsideLink(option)}
        </NavLink>
      );
    }
    return option.action ? (
      <button className={styles.link} onClick={() => this.handleActionClick(option)}>
        {this.renderInsideLink(option, true)}
      </button>
    ) : (
      <a
        className={styles.link}
        target={option.target || '_blank'}
        href={option.link}
        onClick={this.handleLinkClick}
      >
        {this.renderInsideLink(option)}
      </a>
    );
  };

  render() {
    const { isOpen, closeModal } = this.props;
    const { shareMenuOptions } = this.state;

    return (
      <Modal
        isOpen={isOpen}
        theme={{ modal: styles.modal, modalContent: styles.modalContent }}
        header={<ModalHeader title="Share" />}
        onRequestClose={this.handleLinkClick}
      >
        {shareMenuOptions.map(({ key, options }) => (
          <ul className={styles.links} key={key}>
            {options.map(option => (
              <li className={styles.linkContainer} key={option.label}>
                {this.renderLink(option)}
              </li>
            ))}
          </ul>
        ))}
      </Modal>
    );
  }
}

ModalShare.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
};

ModalShare.defaultProps = { title: '' };

export default ModalShare;
