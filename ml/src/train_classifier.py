
"""Classifier training entry point.

The full reproducible workflow is orchestrated by train_pipeline.py so that
leakage audit, split discipline, calibration and final packaging cannot be
accidentally skipped.
"""
from .train_pipeline import main

if __name__ == "__main__":
    main()
