#!/bin/bash
# Reset password for tommymorgan1991@gmail.com using the Admin API
# This is the PROPER way to reset Supabase Auth passwords

curl -X POST https://portal.ontimely.co.uk/api/admin-reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tommymorgan1991@gmail.com",
    "password": "Octagon123"
  }'

echo ""
echo "✅ Password reset request sent!"
echo "📧 Email: tommymorgan1991@gmail.com"
echo "🔑 New password: Octagon123"

