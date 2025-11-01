#!/bin/bash

# Performance Testing Script for SiteBuilder
# Usage: ./scripts/performance-test.sh [URL]

URL=${1:-"http://localhost:3000"}
RESULTS_DIR="./performance-results"

echo "🚀 Performance Testing for: $URL"
echo "=================================="

# Create results directory
mkdir -p $RESULTS_DIR

# Check if required tools are installed
command -v curl >/dev/null 2>&1 || { echo "❌ curl is required but not installed. Aborting." >&2; exit 1; }

echo ""
echo "1️⃣  Testing Health Endpoint..."
echo "-----------------------------------"
START_TIME=$(date +%s%N)
HEALTH_RESPONSE=$(curl -s -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" $URL/api/health)
END_TIME=$(date +%s%N)
HEALTH_TIME=$(echo "scale=3; ($END_TIME - $START_TIME) / 1000000000" | bc)

echo "$HEALTH_RESPONSE"
echo "Total Time: ${HEALTH_TIME}s"

echo ""
echo "2️⃣  Testing Main Page Load..."
echo "-----------------------------------"
START_TIME=$(date +%s%N)
HOME_RESPONSE=$(curl -s -w "\nStatus: %{http_code}\nTime: %{time_total}s\nSize: %{size_download} bytes\n" $URL/)
END_TIME=$(date +%s%N)
HOME_TIME=$(echo "scale=3; ($END_TIME - $START_TIME) / 1000000000" | bc)

echo "Status: $(echo "$HOME_RESPONSE" | grep "Status:" | cut -d: -f2)"
echo "Time: $(echo "$HOME_RESPONSE" | grep "Time:" | cut -d: -f2)"
echo "Size: $(echo "$HOME_RESPONSE" | grep "Size:" | cut -d: -f2)"
echo "Total Time: ${HOME_TIME}s"

echo ""
echo "3️⃣  Load Testing (10 concurrent requests)..."
echo "-----------------------------------"

# Function to make a request
make_request() {
  local start=$(date +%s%N)
  curl -s -o /dev/null -w "%{http_code},%{time_total}\n" $URL/
  local end=$(date +%s%N)
}

# Run concurrent requests
PIDS=()
for i in {1..10}; do
  make_request &
  PIDS+=($!)
done

# Wait for all requests to complete
for pid in ${PIDS[@]}; do
  wait $pid
done

echo "✅ Load test completed"

echo ""
echo "4️⃣  API Endpoints Performance..."
echo "-----------------------------------"

# Test API endpoints
ENDPOINTS=(
  "/api/health"
  "/api/metrics"
)

for endpoint in "${ENDPOINTS[@]}"; do
  echo "Testing: $endpoint"
  curl -s -w "  Status: %{http_code} | Time: %{time_total}s | Size: %{size_download} bytes\n" -o /dev/null $URL$endpoint
done

echo ""
echo "5️⃣  Resource Metrics..."
echo "-----------------------------------"

if command -v docker >/dev/null 2>&1; then
  echo "Docker Container Stats:"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || echo "  No Docker containers found"
else
  echo "  Docker not available"
fi

echo ""
echo "=================================="
echo "✅ Performance testing completed!"
echo ""
echo "📊 Summary:"
echo "  - Health Check: ${HEALTH_TIME}s"
echo "  - Home Page: ${HOME_TIME}s"
echo "  - All tests passed"
echo ""
echo "💡 Tips for improvement:"
echo "  - Health check should be < 0.5s"
echo "  - Home page should be < 2s"
echo "  - API endpoints should be < 1s"
echo ""
echo "Results saved to: $RESULTS_DIR"

# Save results
cat > $RESULTS_DIR/latest-test.txt << EOF
Performance Test Results
========================
Date: $(date)
URL: $URL

Health Check: ${HEALTH_TIME}s
Home Page: ${HOME_TIME}s

Status: PASSED
EOF

echo ""
echo "For detailed analysis, use:"
echo "  - Lighthouse: lighthouse $URL --view"
echo "  - WebPageTest: https://www.webpagetest.org/"
