# Image Stack Uploader and Inference Viewer - FE

## Tech Stack

- React
- Typescript
- [Vite](https://vite.dev/)
- [Ant.design](https://ant.design/)

## Structure

```
fe
|---public
|---src
|   |---apis
|   |---domain-models
|   |---pages
```

- `public` is for assets that just need to be served without any processing.
- `src/apis` This represents the network layer, and it is where we define functions that call our APIs. Any details regarding _how_ we call the APIs should be abstracted in this layer, for example if we use `axios`, `AxiosError` should not escape this layer.
- `src/domain-models` This represents the domain layer, but since we don't have any domain related logic, we only define the models. This is _not_ for any type, this for domain models that cross the fe-be boundary.
- `src/pages` This will contain the application's page. Each page folder should be self contained. Any components or hooks used in a page should be colocated in this page's folder, and a page cannot import anything from another page's folder. Nothing is treated as re-usable in this folder.

## Development

Assuming you already have node installed, we use `npm` as our package manager and script runner.

Install dependencies

```bash
npm i
```

Set the environment variables by creating a `.env` file in the root folder, copy the variables defined in `.env.example`, and set their values.

And then start the dev server

```bash
npm run dev
```

You can see the running app at `http::/localhost:3000`.
