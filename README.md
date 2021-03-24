# Climate Watch - Indonesia Platform

Table of Contents:

- [Local Setup](#local-setup)
- [Modules](#modules)

## Local setup

### Installing dependencies

```
yarn install
```

and then

```
gem install bundler
bundle install
```

These will satisfy both the frontend and backend's dependency requirements.

#### Setting up the Rails environment

Copy the sample `.env.sample` file to `.env` and modify it as needed to fit the
project's settings. At the very least you'll need to have the `POSTGRES_URL`
env variable.

```
POSTGRES_URL=postgresql://postgres@localhost/cw-indonesia_development
```

#### Setting up the database

```
bundle exec rails db:create
bundle exec rails db:migrate
```

These will create the development database and then run the database migration tasks.

### Launching The App

You'll need to run both the rails server and the webpack server, which will be used internally by rails. Run, separately:

```
yarn rails:server
```

and

```
yarn js:server
```

or run both:

```
yarn start
```

Point your browser to `http://localhost:3000/`. Ta-da!

### Tests

`bundle exec rspec spec`

### Launching the app with docker
```docker-compose up```
Ta-da!


## Deploying the app

The application includes a [Jenkins](https://www.jenkins.io/) script file (`Jenkinsfile`) meant to be used with the [RW API production Jenkins](https://resource-watch.github.io/doc-api/developer.html#ci-cd) for deployment. It currently supports deploying the source code from the `master` branch, which will be made available through [https://indonesia.climatewatchdata.org](https://indonesia.climatewatchdata.org).

## Frontend Architectural choices

The fronted uses react, redux and redux-router-first.
There are some peculiarities in the architectural choices that we will outline in this section.

## Router

Interesting [read](https://github.com/faceyspacey/redux-first-router#motivation---what-routing-in-redux-is-meant-to-be) about motivation to use it.

- Routes are defined as another reducer
- Navigation are just actions
- You can grab the piece of state from the url that you need in any component
- Seamless code splitting using [react-universal-component](https://github.com/faceyspacey/react-universal-component)
- Routes are defined as a data-structure instead of using `jsx` inside the `routes.js` file.
- All of the router data will be located in the `location` store.

## Modules

Perhaps the bigger peculiarity is the module based architecture. What a module architecture means is that all the elements that are part of a component are contained inside the same directory.
That includes not only Component and Container, but also styles, reducers and actions.

### Typical module structure:

```
├── my-module/
│   ├── components/
│   ├── my-module-actions.js
│   ├── my-module-component.jsx
│   ├── my-module-reducers.js
│   ├── my-module-styles.scss
│   └── my-module.js
```

### Module entry point

The module entry point, named as the directory containing the module exports every element of the module individually and acts as container (as in [container component](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)) if needed.

### Module Component

The module's Component (as in [presentational component](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)) only contains the view in `jsx`.
Every state related or action concern will be taken care of in the container in such way that the component will receive it via `props`.
The Component never handles logic.

### Module styles

For all the application styles we are using [css-modules](https://github.com/css-modules/css-modules), this allows for local scope (BEM for free) and theming/styles combination.

If the module we are writing is supposed to be reusable, the styles contained within the module only refer to the particular functioning of that module.
No aesthetic definition belongs in the module styles.

#### Theming

Whenever the module will need to be mounted in the application and given some style, the module will provide the means to be customized using [react-css-themr](https://github.com/javivelasco/react-css-themr)
and the parent will be responsible for styling the component with the app specific styles. This library provides a [HOC](https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e) in which we can wrap our component or container and it will take care of merging the passed theme into the local styles.

## State management and connecting Modules

Once we are using the mentioned module architecture we have to gather all the local actions and reducers and glue them together so redux can use them.
For asynchronous actions we use [redux-thunk](https://github.com/gaearon/redux-thunk).

### Module Actions

Actions inside a module are created with [redux-tools createActions](https://github.com/Vizzuality/redux-tools) and exported individually.
For Thunk actions a slim wrapper around `createActions` is used, this allows us to pass a thunk as the second argument giving us full control of what actions to dispatch on `init` `success` or `fail`.

### Module Reducers

Reducers inside a module are simple pure functions, no switch case is even present.
The reducers file exports an object which keys are the actions constants and the value is the reducer that will react to that dispatched action.

The exported actions are used for the keys since `redux-actions` returns the action constant when calling the `.toString()` method in the action creator.

### Modules boilerplate generator

Using [plop](https://github.com/amwmedia/plop) you can generate the folder and files of a module as easy as running:

```
yarn generate
```

It will promtp with the name of the module and the redux connection when needed.

### App Actions

The application actions file is free to import/export every module's actions individually or merge them into a big object containing all the actions.

### App Reducers

In the app reducers we will import all module's reducers and bind them to a key in the store using a `handleActions` wrapper.
This wrapper uses `redux-actions`'s `handleActions` and glues all the individual reducers together to the matching actions.

### Domain description

- NDC: Intended Nationally Determined Contributions (INDCs) is a term used under the United Nations Framework Convention on Climate Change (UNFCCC) for reductions in greenhouse gas emissions that all countries that signed the UNFCCC were asked to publish in the lead up to the 2015 United Nations Climate Change Conference held in Paris

- SDG: The Sustainable Development Goals (SDGs) are a set of 17 "Global Goals" with 169 targets. These goals and targets cover a broad range of sustainable development issues.


### Release
To release using a [fork of zeit release](https://github.com/vizzuality/release) to generate the changelog automatically with all of the PR included since the last release just run:

(Be sure you have all of your branches sync first)

```bash
npx release 'major' | 'minor' | 'patch'
```

and push to master!
