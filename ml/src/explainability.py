
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import shap
import warnings
warnings.filterwarnings('ignore', message=r'LightGBM binary classifier with TreeExplainer.*', category=UserWarning)

from .config import MODEL_DIR, SHAP_DIR, PLOT_DIR

def _feature_names(preprocessor):
    return list(preprocessor.get_feature_names_out())

def save_shap_for_model(pipeline, X_reference, model_type, sample_size=100):
    SHAP_DIR.mkdir(parents=True, exist_ok=True)
    pre = pipeline.named_steps["preprocessor"]
    model = pipeline.named_steps["model"]
    X_t = pre.transform(X_reference.sample(min(sample_size, len(X_reference)), random_state=42))
    names = _feature_names(pre)

    if hasattr(X_t, "toarray"):
        X_dense = X_t.toarray()
    else:
        X_dense = X_t

    try:
        if model.__class__.__name__ in {"LogisticRegression", "LinearRegression"}:
            explainer = shap.LinearExplainer(model, np.zeros((1, X_dense.shape[1])))
            values = explainer.shap_values(X_dense)
        else:
            with warnings.catch_warnings():
                warnings.filterwarnings('ignore', message='LightGBM binary classifier with TreeExplainer.*', category=UserWarning)
                explainer = shap.TreeExplainer(model)
            values = explainer.shap_values(X_dense)
        if isinstance(values, list):
            values_plot = values[1]
        else:
            values_plot = values
        joblib.dump(explainer, MODEL_DIR / f"shap_explainer_{model_type}.pkl")
        if model.__class__.__name__ not in {"LogisticRegression", "LinearRegression"}:
            joblib.dump(explainer, MODEL_DIR / "shap_explainer.pkl")

        shap.summary_plot(values_plot, X_dense, feature_names=names, show=False, max_display=20)
        plt.tight_layout()
        plt.savefig(SHAP_DIR / f"{model_type}_shap_summary.png", dpi=180, bbox_inches="tight")
        plt.close()

        shap.summary_plot(values_plot, X_dense, feature_names=names, plot_type="bar", show=False, max_display=20)
        plt.tight_layout()
        plt.savefig(SHAP_DIR / f"{model_type}_shap_bar.png", dpi=180, bbox_inches="tight")
        plt.close()

        importance = np.abs(values_plot).mean(axis=0)
        imp = pd.DataFrame({"feature": names, "mean_abs_shap": importance}).sort_values("mean_abs_shap", ascending=False)
        imp.to_csv(SHAP_DIR / f"{model_type}_shap_importance.csv", index=False)
        return {"status": "ok", "features": names, "importance": imp}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

def explain_one(pipeline, project):
    pre = pipeline.named_steps["preprocessor"]
    model = pipeline.named_steps["model"]
    X = pd.DataFrame([project])
    Xt = pre.transform(X)
    if hasattr(Xt, "toarray"):
        Xt = Xt.toarray()
    names = _feature_names(pre)
    try:
        if model.__class__.__name__ in {"LogisticRegression", "LinearRegression"}:
            explainer = shap.LinearExplainer(model, np.zeros((1, Xt.shape[1])))
            vals = explainer.shap_values(Xt)
        else:
            with warnings.catch_warnings():
                warnings.filterwarnings('ignore', message='LightGBM binary classifier with TreeExplainer.*', category=UserWarning)
                explainer = shap.TreeExplainer(model)
            vals = explainer.shap_values(Xt)
        if isinstance(vals, list):
            vals = vals[1][0]
        else:
            vals = vals[0]
        pairs = sorted(zip(names, vals), key=lambda z: z[1], reverse=True)
        positive = [{"feature": f, "contribution": float(v)} for f, v in pairs[:5] if v > 0]
        negative = [{"feature": f, "contribution": float(v)} for f, v in pairs[-5:][::-1] if v < 0]
        return {"top_positive_risk_contributors": positive, "top_negative_risk_contributors": negative}
    except Exception as e:
        return {"error": str(e)}
