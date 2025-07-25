# Image Stack Uploader and Inference Viewer - BE

This the BE responsible for unzipping the uploaded zip folder, and running the model.

## Structure

The app follows standard [Django](https://www.djangoproject.com/) file structure. The `be` folder is the project, and the `api` folder is the app.

## Prerequisites

You should have python3, pip, and [venv](https://docs.python.org/3/library/venv.html) already installed on your machine

## Development

Start by creating a virtual environment and activating it

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Then make sure that `pip` is up to date and install the dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Run the migrations

```bash
python manage.py migrate
```

Create a `.env` file, copy the variables from `.env.example` and set their actual values

And then start the development server

```bash
python manage.py runserver
```

You can access the APIs at `http://localhost:8000`
