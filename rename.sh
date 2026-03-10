#!/bin/bash

# WPAB Boilerplate Renaming Script
# This script renames the boilerplate to your specific plugin details.

# Exit on error
set -e

# Current values (Do not change these unless the boilerplate itself changes)
CURRENT_NAME="WPAB Boilerplate"
CURRENT_SLUG="wpab-boilerplate"
CURRENT_NAMESPACE="WpabBoilerplate"
CURRENT_PREFIX_FUNC="wpab_boilerplate"
CURRENT_PREFIX_CONST="WPAB_BOILERPLATE"
CURRENT_AUTHOR="WPAnchorBay"
CURRENT_AUTHOR_URI="https://wpanchorbay.com"

echo "------------------------------------------------------"
echo "  WPAB Boilerplate Renaming Script"
echo "------------------------------------------------------"

# 1. Prompt for new details
read -p "Plugin Name (e.g., My Awesome Plugin): " NEW_NAME
read -p "Plugin Slug (e.g., my-awesome-plugin): " NEW_SLUG
read -p "PHP Namespace (e.g., MyAwesomePlugin): " NEW_NAMESPACE
read -p "Function Prefix (e.g., my_awesome_plugin): " NEW_PREFIX_FUNC
read -p "Constant Prefix (e.g., MY_AWESOME_PLUGIN): " NEW_PREFIX_CONST
read -p "Author Name (e.g., John Doe): " NEW_AUTHOR
read -p "Author URI (e.g., https://example.com): " NEW_AUTHOR_URI

# Validation (simple check)
if [[ -z "$NEW_NAME" || -z "$NEW_SLUG" || -z "$NEW_NAMESPACE" || -z "$NEW_PREFIX_FUNC" || -z "$NEW_PREFIX_CONST" ]]; then
    echo "Error: All fields are required."
    exit 1
fi

echo ""
echo "You are about to rename the plugin to:"
echo "Name: $NEW_NAME"
echo "Slug: $NEW_SLUG"
echo "Namespace: $NEW_NAMESPACE"
echo "Func Prefix: $NEW_PREFIX_FUNC"
echo "Const Prefix: $NEW_PREFIX_CONST"
echo "Author: $NEW_AUTHOR"
echo "Author URI: $NEW_AUTHOR_URI"
echo ""
read -p "Is this correct? (y/n): " CONFIRM

if [[ "$CONFIRM" != "y" ]]; then
    echo "Aborted."
    exit 0
fi

echo "Starting renaming process..."

# 2. Find and Replace strings in all files
# Exclude .git, node_modules, build, dist, vendor, and this script itself
# Check OS for sed compatibility (assuming Linux based on user env)

grep -rl "$CURRENT_NAME" . --exclude-dir={.git,node_modules,build,dist,vendor} --exclude=rename.sh | xargs sed -i "s/$CURRENT_NAME/$NEW_NAME/g"
grep -rl "$CURRENT_SLUG" . --exclude-dir={.git,node_modules,build,dist,vendor} --exclude=rename.sh | xargs sed -i "s/$CURRENT_SLUG/$NEW_SLUG/g"
grep -rl "$CURRENT_NAMESPACE" . --exclude-dir={.git,node_modules,build,dist,vendor} --exclude=rename.sh | xargs sed -i "s/$CURRENT_NAMESPACE/$NEW_NAMESPACE/g"
grep -rl "$CURRENT_PREFIX_FUNC" . --exclude-dir={.git,node_modules,build,dist,vendor} --exclude=rename.sh | xargs sed -i "s/$CURRENT_PREFIX_FUNC/$NEW_PREFIX_FUNC/g"
grep -rl "$CURRENT_PREFIX_CONST" . --exclude-dir={.git,node_modules,build,dist,vendor} --exclude=rename.sh | xargs sed -i "s/$CURRENT_PREFIX_CONST/$NEW_PREFIX_CONST/g"

if [[ ! -z "$NEW_AUTHOR" ]]; then
    grep -rl "$CURRENT_AUTHOR" . --exclude-dir={.git,node_modules,build,dist,vendor} --exclude=rename.sh | xargs sed -i "s/$CURRENT_AUTHOR/$NEW_AUTHOR/g"
fi
if [[ ! -z "$NEW_AUTHOR_URI" ]]; then
     grep -rl "$CURRENT_AUTHOR_URI" . --exclude-dir={.git,node_modules,build,dist,vendor} --exclude=rename.sh | xargs sed -i "s|${CURRENT_AUTHOR_URI}|${NEW_AUTHOR_URI}|g"
fi

# 3. Rename files
if [[ -f "$CURRENT_SLUG.php" ]]; then
    mv "$CURRENT_SLUG.php" "$NEW_SLUG.php"
fi

if [[ -f "languages/$CURRENT_SLUG.pot" ]]; then
    mv "languages/$CURRENT_SLUG.pot" "languages/$NEW_SLUG.pot"
fi

# 4. Clean up any build artifacts that might have old names
rm -rf build
rm -rf dist

echo "------------------------------------------------------"
echo "  Success! Plugin renamed to $NEW_NAME."
echo "  Please run 'npm install && npm run build' to rebuild assets."
echo "  You may delete this script now."
echo "------------------------------------------------------"
