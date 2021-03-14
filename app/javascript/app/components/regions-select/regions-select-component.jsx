import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import ResultsList from 'components/results-list'
import isNil from 'lodash/isNil'
import Search from 'components/search'
import { TabletLandscape } from 'components/responsive'

import layout from 'styles/layout.scss'
import searchCountriesTheme from 'styles/themes/search/search-countries.scss'
import styles from './regions-select-styles.scss'
import RegionsMap from './regions-map'

class RegionsSelect extends PureComponent {
  constructor(props) {
    super(props)
    // this.wrapperRef = React.createRef();
    this.state = {
      search: '',
      region: '',
      provinces: [],
    }
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClickOutside, false)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside, false)
  }

  handleClickOutside = (e) => {
    if (isNil(this.node)) return
    if (this.node.contains(e.target)) {
      return
    }
    this.props.handleClickOutside()
  }

  filterProvince(value) {
    let filterProvince = this.props.provinces.filter((province) => {
      return province.label.toLowerCase().indexOf(value) !== -1
    })

    this.setState({
      search: value,
      provinces: filterProvince,
    })
  }

  onRegionMouseEnter(region) {
    this.setState({ region: region })
  }

  handleClick(section) {
    if (section === 'region') {
      this.props.handleClickOutside()
    }
  }

  render() {
    const {
      provinces,
      opened,
      className,
      handleClickOutside,
      activeProvince,
      parentRef,
      paths,
    } = this.props
    const { search, region } = this.state

    return (
      opened && (
        <React.Fragment>
          <div
            className={cx(styles.wrapper, className)}
            ref={(node) => (this.node = node)}
          >
            <div className={cx(layout.content, styles.content)}>
              <div className='grid-layout-element'>
                <div onClick={() => this.handleClick('search')}>
                  <Search
                    placeholder='Search a region'
                    value={search}
                    onChange={(value) => this.filterProvince(value)}
                    theme={searchCountriesTheme}
                    autofocus={opened || autofocus}
                  />
                </div>
              </div>
              <div className='grid-colum-item'>
                <div
                  className={styles.columns}
                  onClick={() => this.handleClick('region')}
                >
                  <ResultsList
                    searchText={search}
                    list={
                      search.length > 0
                        ? this.state.provinces
                        : this.props.provinces
                    }
                    opened={opened}
                    parentRef={parentRef}
                    activeProvince={activeProvince}
                    emptyDataMsg='No results'
                    handleMouseItemEnter={(region) =>
                      this.onRegionMouseEnter(region)
                    }
                    handleMouseItemLeave={undefined}
                  />
                  <TabletLandscape>
                    <RegionsMap hoverRegion={region} />
                  </TabletLandscape>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      )
    )
  }
}

RegionsSelect.propTypes = {
  provinces: PropTypes.array,
  opened: PropTypes.bool,
  className: PropTypes.string,
  handleClickOutside: PropTypes.func,
  activeProvince: PropTypes.string,
  parentRef: PropTypes.node,
}

RegionsSelect.defaultProps = {
  provinces: [],
  opened: false,
  className: '',
  handleClickOutside: () => {},
  activeProvince: '',
  parentRef: null,
}

export default RegionsSelect
