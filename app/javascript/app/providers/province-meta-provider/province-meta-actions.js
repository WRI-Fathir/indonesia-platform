import { createAction, createThunkAction } from 'redux-tools'
import { INDOAPI } from 'services/api'

export const fetchProvinceMetasInit = createAction('fetchProvinceMetasInit')
export const fetchProvinceMetasReady = createAction('fetchProvinceMetasReady')
export const fetchProvinceMetasFail = createAction('fetchProvinceMetasFail')

export const fetchProvinceMetas = createThunkAction(
  'fetchProvinceMetas',
  (params) => (dispatch) => {
    const { metaParams, locale } = params;
    dispatch(fetchProvinceMetasInit())
    INDOAPI.get('province/metadata', {...metaParams, locale})
      .then((data = {}) => {
        dispatch(fetchProvinceMetasReady(data))
      })
      .catch((error) => {
        console.warn(error)
        dispatch(fetchProvinceMetasFail(error && error.message))
      })
  }
)
