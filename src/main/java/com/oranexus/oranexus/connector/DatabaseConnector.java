package com.oranexus.oranexus.connector;

import java.util.List;

public interface DatabaseConnector<T,V> {
    void connect();

    V query(String sql, Object... params);
    V query(String sql, List<Object> params);

    T fetchOne(String sql, Object... params);
    T fetchOne(String sql, List<Object> params);

    int execute(String sql, Object... params);
    int execute(String sql, List<Object> params);

    void disconnect();
}