#!/bin/bash

cleanup() {
  echo ""
  echo "Stopping server"
  if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null
    wait $SERVER_PID 2>/dev/null
  fi
  
  echo "Stopping database"
  docker compose down
}

trap cleanup EXIT

echo "Starting main test"
echo ""

echo "Starting PostgreSQL database..."
docker compose up -d postgres

if [ $? -ne 0 ]; then
  echo "Failed to start database"
  exit 1
fi

echo "Waiting for database to be healthy..."
MAX_WAIT=30
WAIT_COUNT=0

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
  if docker compose ps postgres | grep -q "healthy"; then
    echo "Database is ready"
    break
  fi
  sleep 1
  WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
  echo "Database failed to become healthy"
  exit 1
fi

echo ""
echo "Starting server in background..."
npm run start > /dev/null 2>&1 &
SERVER_PID=$!

sleep 3

if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "Failed to start server"
  exit 1
fi

echo "Server ready"
echo ""

echo "Running API tests"
node src/server.test.js
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo ""
  echo "All tests passed!"
  exit 0
else
  echo ""
  echo "Tests failed"
  exit $TEST_EXIT_CODE
fi
