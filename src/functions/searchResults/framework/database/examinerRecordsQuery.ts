export const examinerRecordsQuery = 'SELECT\n' +
    '    application_reference as \'appRef\',\n' +
    '    category as \'testCategory\',\n' +
    '    JSON_OBJECT(\n' +
    '        \'centreId\', tc_id,\n' +
    '        \'costCode\', tc_cc,\n' +
    '        \'centreName\', JSON_UNQUOTE(JSON_EXTRACT(test_result, \'$.journalData.testCentre.centreName\'))\n' +
    '    ) AS testCentre,\n' +
    '    test_date as \'startDate\',\n' +
    '    JSON_UNQUOTE(JSON_EXTRACT(test_result, \'$.testSummary.routeNumber\')) AS \'routeNumber\',\n' +
    '    JSON_UNQUOTE(JSON_EXTRACT(test_result, \'$.testData.controlledStop.selected\')) AS \'controlledStop\',\n' +
    '    JSON_UNQUOTE(JSON_EXTRACT(test_result, \'$.testSummary.independentDriving\')) AS \'independentDriving\',\n' +
    '    JSON_UNQUOTE(JSON_EXTRACT(test_result, \'$.testSummary.circuit\')) AS \'circuit\',\n' +
    '    JSON_EXTRACT(test_result, \'$.testData.safetyAndBalanceQuestions.safetyQuestions\')' +
    ' AS \'safetyQuestions\',\n' +
    '    JSON_EXTRACT(test_result, \'$.testData.safetyAndBalanceQuestions.balanceQuestions\')' +
    ' AS \'balanceQuestions\',\n' +
    '    JSON_UNQUOTE(JSON_EXTRACT(test_result, \'$.testData.manoeuvres\')) AS \'manoeuvres\',\n' +
    '    CASE\n' +
    '        WHEN JSON_CONTAINS_PATH(test_result, \'one\', \'$.testData.manoeuvres\') THEN\n' +
    '            CASE\n' +
    '                WHEN JSON_UNQUOTE(JSON_EXTRACT(test_result, \'$.testData.manoeuvres\')) = \'{}\' THEN NULL\n' +
    '                ELSE JSON_ARRAY(JSON_EXTRACT(test_result, \'$.testData.manoeuvres\'))\n' +
    '            END\n' +
    '    END AS manoeuvres,\n' +
    '    CASE\n' +
    '        WHEN JSON_CONTAINS_PATH(test_result, \'one\', \'$.testData.vehicleChecks.showMeQuestion\') THEN\n' +
    '            CASE\n' +
    '                WHEN JSON_UNQUOTE(JSON_EXTRACT(test_result, \'$.testData.vehicleChecks.showMeQuestion\'))' +
    ' = \'{}\' THEN NULL\n' +
    '                ELSE JSON_ARRAY(JSON_EXTRACT(test_result, \'$.testData.vehicleChecks.showMeQuestion\'))\n' +
    '            END\n' +
    '        WHEN JSON_CONTAINS_PATH(test_result, \'one\', \'$.testData.vehicleChecks.showMeQuestions\')\n' +
    '        THEN JSON_EXTRACT(test_result, \'$.testData.vehicleChecks.showMeQuestions\')\n' +
    '    END AS showMeQuestions,\n' +
    '    CASE\n' +
    '        WHEN JSON_CONTAINS_PATH(test_result, \'one\', \'$.testData.vehicleChecks.tellMeQuestion\') THEN\n' +
    '            CASE\n' +
    '                WHEN JSON_UNQUOTE(JSON_EXTRACT(test_result, \'$.testData.vehicleChecks.tellMeQuestion\'))' +
    ' = \'{}\' THEN NULL\n' +
    '                ELSE JSON_ARRAY(JSON_EXTRACT(test_result, \'$.testData.vehicleChecks.tellMeQuestion\'))\n' +
    '            END\n' +
    '        WHEN JSON_CONTAINS_PATH(test_result, \'one\', \'$.testData.vehicleChecks.tellMeQuestions\')\n' +
    '        THEN JSON_EXTRACT(test_result, \'$.testData.vehicleChecks.tellMeQuestions\')\n' +
    '    END AS tellMeQuestions\n' +
    'FROM TEST_RESULT WHERE ';
