INSERT INTO AUDIT_EMAIL_REGEN(
    application_reference,
    regenerated_date,
    previous_email,
    new_email,
    previous_language,
    new_language,
    user_name,
    ticket_ref
) VALUES
    (10000000000, '2023-04-05 11:00:58', 'previous_email@test', 'new_email@test', 'English', 'English', 'user', 'REQ0000001'),
    (10000000000, '2023-04-05 12:00:58', 'previous_email@test', 'new_email2@test', 'English', 'English', 'user', 'REQ0000002'),
    (10000000001, '2023-04-05 10:00:58', 'previous_email@test', 'new_email@test', 'English', 'English', 'user', 'REQ0000005')
;
