import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { NavLink } from 'redux-first-router-link'
import styles from './nav-styles.scss'

class Nav extends PureComponent {
  render() {
    const { routes, theme, parent, provinceInfo, t, locale } = this.props

    const filteredRoutes = routes.filter((route) => {
      if (!parent || parent.slug !== 'regions') return route
      if (!provinceInfo || !provinceInfo.iso_code3) return route

      return (
        (route.member === 'all' || route.member === provinceInfo.iso_code3) &&
        route.exclude !== provinceInfo.iso_code3
      )
    })


    return (
      <nav className={theme.nav}>
        {filteredRoutes.map((route) => {
          const isoCode = provinceInfo && provinceInfo.iso_code3
          if (route.province) {
            return (
              <NavLink
                exact={route.exact || false}
                className={cx(styles.link, theme.link)}
                key={route.slug}
                to={`/${locale}/regions/${isoCode}/${route.slug}`}
                activeClassName={styles.active}
                onTouchStart={undefined}
                onMouseDown={undefined}
              >
                {parent
                  ? t(`pages.${parent.slug}.${route.slug}.title`)
                  : t(`pages.${route.slug}.title`)}
              </NavLink>
            )
          }
          return (
            <NavLink
              exact={route.exact || false}
              className={cx(styles.link, theme.link)}
              key={route.slug}
              to={`/${locale}${route.link || route.path}`}
              activeClassName={styles.active}
              onTouchStart={undefined}
              onMouseDown={undefined}
            >
              {parent
                ? t(`pages.${parent.slug}.${route.slug}.title`)
                : t(`pages.${route.slug}.title`)}
            </NavLink>
          )
        })}
      </nav>
    )
  }
}

Nav.propTypes = {
  t: PropTypes.func.isRequired,
  routes: PropTypes.array.isRequired,
  parent: PropTypes.object,
  theme: PropTypes.shape({ nav: PropTypes.string, link: PropTypes.string }),
  provinceInfo: PropTypes.object,
  locale: PropTypes.string,
}

Nav.defaultProps = { theme: {}, parent: null, provinceInfo: null, locale: '' }

export default Nav
