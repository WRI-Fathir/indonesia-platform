/*
  filename: timeline-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';

const getTimelineData = ({ timeline }) => timeline && timeline.data;

const getDocuments = createSelector([ getTimelineData ], timeline => {
  if (isEmpty(timeline)) return null;

  const documents = [];
  uniqBy(timeline, 'link').forEach(d => {
    if (d.date) {
      documents.push({
        year: d.date.split('-')[0],
        link: d.link,
        label: d.label
      });
    }
  });
  // add year 2020 as due date for new NDCs submissions
  documents.push({
    year: '2020',
    link: 'http://www.wri.org/sites/default/files/WRI17_NDC.pdf',
    label: 'Parties are requested to communicate new or updated NDCs by 2020'
  });

  return sortBy(documents, 'year');
});

export const getTimeline = createStructuredSelector({
  documents: getDocuments
});
