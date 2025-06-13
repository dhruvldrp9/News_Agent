#!/bin/bash

# Create a temporary directory for optimization
mkdir -p .vercel_build
cd .vercel_build

# Install dependencies
pip install -r ../requirements-vercel.txt

# Remove unnecessary files
find . -type d -name "tests" -exec rm -rf {} +
find . -type d -name "test" -exec rm -rf {} +
find . -type d -name "docs" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete
find . -type f -name "*.pyo" -delete
find . -type f -name "*.pyd" -delete
find . -type f -name "*.so" -delete
find . -type f -name "*.dylib" -delete
find . -type f -name "*.dll" -delete

# Clean up spaCy model
python -m spacy download en_core_web_sm --force
rm -rf spacy/data/en_core_web_sm/en_core_web_sm-3.8.0/tests
rm -rf spacy/data/en_core_web_sm/en_core_web_sm-3.8.0/benchmarks

# Create optimized requirements file
pip freeze > ../requirements-vercel-optimized.txt

# Clean up
cd ..
rm -rf .vercel_build 