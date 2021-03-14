
```js

initialState = {
  selectedYear: '2014',
  disablePlay: false
};
const years = ['2010', '2011', '2012', '2013', '2014', '2015'];

const handlePlay = () => {
  const initialYear = state.selectedYear;
  let currentYearIndex = 0;
  setState((state) => ({ disablePlay: true }));

  const playAtStart = setInterval(
    () => {
        setState(state => ({ selectedYear: years[currentYearIndex] }));
        if (currentYearIndex > years.length - 1) {
          clearInterval(playAtStart);
          setTimeout(setState(state => ({ selectedYear: initialYear, disablePlay: false })), 1000);
        }
        currentYearIndex += 1;
      }
  , 500);
};
<PlayTimeline
  onPlay={handlePlay}
  years={years}
  selectedYear={state.selectedYear}
  disablePlay={state.disablePlay}
/>
```
