
"""Regressor training entry point.

The full reproducible workflow is orchestrated by train_pipeline.py so that
the same audited features and untouched test set are used consistently.
"""
from .train_pipeline import main

if __name__ == "__main__":
    main()
