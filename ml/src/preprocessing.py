import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from .config import CATEGORICAL_CANDIDATES, NUMERICAL_CANDIDATES


def get_feature_columns(df):
    categorical = [c for c in CATEGORICAL_CANDIDATES if c in df.columns]
    numerical = [c for c in NUMERICAL_CANDIDATES if c in df.columns]
    return categorical, numerical


def build_preprocessor(df, scale_numeric=False):
    categorical, numerical = get_feature_columns(df)
    cat = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore')),
    ])
    numeric_steps = [('imputer', SimpleImputer(strategy='median'))]
    if scale_numeric:
        numeric_steps.append(('scaler', StandardScaler()))
    num = Pipeline(numeric_steps)
    return ColumnTransformer([
        ('cat', cat, categorical),
        ('num', num, numerical),
    ]), categorical, numerical
