import Prometheus from "prom-client";
import { OperationNames, Status } from "./constants";

const resolverRequestDuration = new Prometheus.Histogram({
    name: "resolver_request_duration_seconds",
    help: "Duration of each resolver request",
    labelNames: ["operation", "fieldName", "status"],
});

const measureResolverDuration = async (operation: string, fieldName: string, error: Error | null) => {
    const status = error ? Status.ERROR : Status.SUCCESS;
    const end = resolverRequestDuration.startTimer();
    end({ operation, fieldName, status });
};

export const resolverMetricsPlugin = () => ({
    requestDidStart(requestContext) {
        if (requestContext.request.operationName === OperationNames.INTROSPECTION_QUERY) return;
        const operation = requestContext.request.operationName || OperationNames.UNKNOWN;
        return {
            executionDidStart() {
                return {
                    willResolveField({ info }) {
                        if (info?.path?.prev) return;
                        const fieldName = info?.fieldName;
                        return async (error: Error | null) => {
                            await measureResolverDuration(operation, fieldName, error);
                        };
                    },
                };
            },
        };
    },
});
