# BhoomiNetra ML Service

Machine-learning inference service for land-acquisition delay risk and expected delay duration.

## Responsibilities

1. Validate prediction inputs against the feature schema.
2. Apply the stored preprocessing pipeline.
3. Run the trained delay classifier.
4. Estimate expected delay duration with the regression model.
5. Provide model explanations used by the backend.
6. Expose inference and health APIs.

Training is separate from API request handling.

## Model artifacts

```text
models/
├── delay_classifier.pkl
├── delay_regressor.pkl
├── classifier_calibrator.pkl
├── preprocessing_pipeline.pkl
├── feature_schema.json
├── model_metadata.json
└── SHAP explainers
```

## Run locally

```bash
cd ml
pip install -r requirements.txt
uvicorn app:app --reload
```

Health:

```text
GET /health
```

The backend calls this service through its configured ML service URL.

## Prediction inputs

The model uses project information available at prediction time, including:

- State and district
- Project type
- Land area
- Affected families
- Pending approvals
- Legal disputes
- Ownership/documentation status
- Compensation progress
- Rehabilitation and resettlement progress
- Current-stage duration
- Historical stage timing
- Historical delay indicators
- Planned and observed timeline indicators

Final-outcome fields are not prediction inputs.

## Data transparency

The labelled dataset used for the current MVP training is **synthetic prototype data**. It must not be presented as government data or as evidence of production-level accuracy.

Real/reference data is kept distinct where available. Data without reliable historical labels is not treated as supervised training data merely to increase dataset size.

## Explainability

SHAP identifies features that contributed to a prediction.

```text
Feature contribution ≠ proven cause
```

Results should therefore be described as model factors or contributing features, not causal findings.

## What-if simulation

Selected input variables are changed and passed through the same prediction pipeline.

The output is a **model-based scenario estimate**, not a causal guarantee.

## Training

The repository includes utilities for data auditing, leakage analysis, preprocessing, model selection, classifier/regressor training, calibration, and explainability.

Before promoting a new model:

- validate the dataset
- check for leakage
- exclude outcome fields from prediction features
- compare candidate models using validation/test results
- record model metadata
- promote only after evaluation

Do not replace a deployed model automatically when new data arrives.

## Deployment

Typical Render configuration:

```text
Root Directory: ml
Build Command: pip install -r requirements.txt
Start Command: uvicorn app:app --host 0.0.0.0 --port $PORT
Health Check: /health
```

## Limitations

- Synthetic training data may not represent real government projects.
- Real-world validation requires authorized, labelled historical project data.
- SHAP does not establish causality.
- What-if output is an estimate from the trained model, not a guaranteed intervention outcome.
