package com.oranexus.oranexus.model;

import java.util.List;

public record DashboardOverview(
        Server server,
        String databaseStatus,
        String instanceStatus,
        String databaseName,
        Boolean containerDatabase,
        Integer pluggableDatabases,
        Integer activeSessions,
        Double tablespaceAllocatedMb,
        Double tablespaceUsedMb,
        Double cpuPercent,
        Double sgaAllocatedMb,
        List<TablespaceUsage> tablespaces,
        List<CpuSample> cpuSamples,
        List<MetricError> metricErrors
) {
    public record TablespaceUsage(
            String name,
            Double allocatedMb,
            Double usedMb,
            Double usagePercent
    ) {
    }

    public record CpuSample(String capturedAt, Double cpuPercent) {
    }

    public record MetricError(String metric, String message) {
    }
}
