#!/bin/sh
set -e

JAVA_OPTS="-XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -XX:InitialRAMPercentage=50.0 \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UseStringDeduplication \
  -XX:+ParallelRefProcEnabled \
  -XX:MaxDirectMemorySize=64m \
  -XX:ReservedCodeCacheSize=80m \
  -XX:+OptimizeStringConcat \
  -Xss256k \
  -XX:MaxMetaspaceSize=150m \
  -XX:+ExitOnOutOfMemoryError \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/tmp/heapdump.hprof \
  -XX:G1PeriodicGCInterval=120000 \
  -XX:G1PeriodicGCSystemLoadThreshold=0.0 \
  -XX:NativeMemoryTracking=summary \
  -XX:+TieredCompilation \
  -Xlog:gc*:file=/tmp/gc.log:time,level,tags:filecount=3,filesize=5m \
  -Djava.security.egd=file:/dev/./urandom"

# Append any extra opts passed via EXTRA_JAVA_OPTS env var
if [ -n "$EXTRA_JAVA_OPTS" ]; then
  JAVA_OPTS="$JAVA_OPTS $EXTRA_JAVA_OPTS"
fi

# Datadog APM agent (auto-instruments traces, profiling, logs correlation)
DD_AGENT_OPTS=""
if [ -f "/app/dd-java-agent.jar" ] && [ "${DD_AGENT_ENABLED:-true}" = "true" ]; then
  DD_AGENT_OPTS="-javaagent:/app/dd-java-agent.jar \
    -Ddd.service=${DD_SERVICE:-blinx-chat-service} \
    -Ddd.env=${DD_ENV:-prod} \
    -Ddd.version=${DD_VERSION:-0.0.1} \
    -Ddd.logs.injection=true \
    -Ddd.trace.analytics.enabled=true \
    -Ddd.profiling.enabled=true \
    -Ddd.jmxfetch.enabled=true \
    -Ddd.trace.db.client.split-by-instance=true \
    -Ddd.trace.http.client.split-by-domain=true \
    -Ddd.trace.sample.rate=1.0"
  echo "Datadog APM agent enabled"
else
  echo "Datadog APM agent disabled"
fi

SPRING_PROFILE="${SPRING_PROFILES_ACTIVE:-prod}"
APP_PORT="${PORT:-8080}"

echo "Starting with JAVA_OPTS: $JAVA_OPTS"
echo "Profile: $SPRING_PROFILE | Port: $APP_PORT"

exec java $DD_AGENT_OPTS $JAVA_OPTS \
  -Dspring.profiles.active="$SPRING_PROFILE" \
  -Dserver.port="$APP_PORT" \
  -jar app.jar
