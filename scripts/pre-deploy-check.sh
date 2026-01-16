#!/bin/bash

# Pre-Deployment Security Checklist Script
# Run this before deploying to production

echo "🔒 Travel Plan Website - Pre-Deployment Security Check"
echo "======================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: .env file exists
echo "1. Checking environment configuration..."
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check if it contains placeholder values
    if grep -q "your-api-key\|your-project" .env; then
        echo -e "${RED}✗${NC} .env contains placeholder values - UPDATE REQUIRED"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓${NC} .env appears to have real values"
    fi
else
    echo -e "${RED}✗${NC} .env file not found - CREATE REQUIRED"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: .env not in git
echo ""
echo "2. Checking .gitignore..."
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✓${NC} .env is in .gitignore"
else
    echo -e "${RED}✗${NC} .env not in .gitignore - SECURITY RISK"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Firebase CLI installed
echo ""
echo "3. Checking Firebase CLI..."
if command -v firebase &> /dev/null; then
    echo -e "${GREEN}✓${NC} Firebase CLI is installed"
    
    # Check if logged in
    if firebase projects:list &> /dev/null; then
        echo -e "${GREEN}✓${NC} Logged in to Firebase"
    else
        echo -e "${YELLOW}⚠${NC} Not logged in to Firebase - run 'firebase login'"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} Firebase CLI not installed - install with: npm install -g firebase-tools"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 4: Dependencies up to date
echo ""
echo "4. Checking dependencies..."
if [ -f "pnpm-lock.yaml" ]; then
    echo -e "${GREEN}✓${NC} Lock file exists"
else
    echo -e "${YELLOW}⚠${NC} No lock file - run 'pnpm install'"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 5: Build test
echo ""
echo "5. Testing production build..."
if pnpm build &> /dev/null; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗${NC} Build failed - fix errors before deploying"
    ERRORS=$((ERRORS + 1))
fi

# Check 6: Security files exist
echo ""
echo "6. Checking security configuration files..."
if [ -f "firestore.rules" ]; then
    echo -e "${GREEN}✓${NC} Firestore rules exist"
else
    echo -e "${RED}✗${NC} firestore.rules missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "storage.rules" ]; then
    echo -e "${GREEN}✓${NC} Storage rules exist"
else
    echo -e "${RED}✗${NC} storage.rules missing"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "======================================================"
echo "Summary:"
echo -e "Errors: ${RED}${ERRORS}${NC}"
echo -e "Warnings: ${YELLOW}${WARNINGS}${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Deploy Firebase rules: firebase deploy --only firestore:rules,storage"
    echo "2. Deploy application: pnpm build && [your deployment command]"
    echo "3. Review SECURITY_AUDIT.md for post-deployment steps"
    exit 0
else
    echo -e "${RED}✗ Please fix errors before deploying${NC}"
    echo "See SECURITY_AUDIT.md for details"
    exit 1
fi
