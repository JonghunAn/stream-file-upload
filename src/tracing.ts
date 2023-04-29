import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/tracing/node_modules/@opentelemetry/resources/build/src';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions/build/src/resource';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

export const initTelemetry = (config: { appName: string; telemetryUrl: string }): void => {
  const resource = Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.appName,
      application: config.appName,
    })
  );

  const provider = new NodeTracerProvider({ resource });

  provider.addSpanProcessor(
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: config.telemetryUrl,
      })
    )
  );

  registerInstrumentations({
    instrumentations: [
      getNodeAutoInstrumentations({ '@opentelemetry/instrumentation-express': { enabled: false } }),

      new HttpInstrumentation({
        ignoreIncomingRequestHook(request) {
          return request.url === '/' && request.method === 'GET';
        },
      }),
      new NestInstrumentation(),
    ],
  });

  provider.register({
    propagator: new W3CTraceContextPropagator(),
  });
};
