package com.oranexus.oranexus.model;

/**
 * Connection state of a Server, resolved by Testing ConnectivityService during
 * each GraphQL query.
 */
public enum ServerStatus {
    CONNECTED,
    NOT_CONNECTED
}
