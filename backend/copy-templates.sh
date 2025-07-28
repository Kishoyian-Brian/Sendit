#!/bin/bash

echo "📁 Copying email templates to dist folder..."

# Create templates directory
mkdir -p dist/src/mailer/templates

# Copy all EJS templates
cp src/mailer/templates/*.ejs dist/src/mailer/templates/

# Verify copy
echo "✅ Templates copied:"
ls -la dist/src/mailer/templates/

echo "🎉 Templates are ready for use!" 