package com.oranexus.oranexus.connector;

import java.util.List;

public interface DatabaseConnector<T> {
    void connect();

    List<T> query(String sql, Object... params);
    List<T> query(String sql, List<Object> params);

    T fetchOne(String sql, Object... params);
    T fetchOne(String sql, List<Object> params);

    int execute(String sql, Object... params);
    int execute(String sql, List<Object> params);

    void disconnect();
}