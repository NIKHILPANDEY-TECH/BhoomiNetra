import argparse
from src.train_pipeline import main


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train the BhoomiMitra ML pipeline.')
    parser.add_argument('--shap', action='store_true', help='Generate SHAP artifacts after training.')
    parser.add_argument('--skip-shap', action='store_true', help='Skip SHAP generation.')
    args = parser.parse_args()
    main(skip_shap=not args.shap or args.skip_shap)
