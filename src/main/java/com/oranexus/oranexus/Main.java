package com.oranexus.oranexus;
import com.oranexus.oranexus.connector.DatabaseConnector;
import com.oranexus.oranexus.connector.PostgresDatabaseManager;
import com.oranexus.oranexus.connector.QueryResult;
import com.oranexus.oranexus.connector.QueryResults;

import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        DatabaseConnector<QueryResult,QueryResults> postgresConnector = new PostgresDatabaseManager();
        postgresConnector.connect();


    }
}
