CREATE TABLE RESULT_STATUS
(
    id                 TINYINT PRIMARY KEY,
    result_status_name VARCHAR(10) NOT NULL
);
INSERT INTO RESULT_STATUS (id, result_status_name)
VALUES (0, 'PROCESSING'),
       (1, 'PROCESSED'),
       (2, 'PENDING'),
       (3, 'ERROR');
CREATE TABLE PROCESSING_STATUS
(
    id                     TINYINT PRIMARY KEY,
    processing_status_name VARCHAR(10) NOT NULL
);
INSERT INTO PROCESSING_STATUS (id, processing_status_name)
VALUES (0, 'PROCESSING'),
       (1, 'ACCEPTED'),
       (2, 'FAILED');

CREATE TABLE INTERFACE_TYPE
(
    id                  TINYINT PRIMARY KEY,
    interface_type_name VARCHAR(6)
);
INSERT INTO INTERFACE_TYPE(id, interface_type_name)
VALUES (0, 'TARS'),
       (1, 'NOTIFY'),
       (2, 'RSIS');

CREATE TABLE TEST_RESULT
(
    application_reference   bigint      not null,
    staff_number            varchar(10) not null,
    test_result             json        not null,
    test_date               date        not null,
    tc_id                   bigint      not null,
    tc_cc                   varchar(6)  not null,
    driver_number           varchar(24) not null,
    driver_surname          varchar(50) not null,
    result_status           tinyint     not null,
    autosave                bit         not null,
    activity_code           varchar(2) null,
    category                varchar(10) null,
    pass_certificate_number varchar(8) null,
    version                 varchar(20) null,
    app_version             varchar(10) null,
    primary key (application_reference, staff_number),
    constraint TEST_RESULT_ibfk_1
        foreign key (result_status) references RESULT_STATUS (id)
);

create index activity_code
    on TEST_RESULT (activity_code);

create index app_version
    on TEST_RESULT (app_version);

create index category
    on TEST_RESULT (category);

create index driver_number
    on TEST_RESULT (driver_number);

create index pass_certificate_number
    on TEST_RESULT (pass_certificate_number);

create index result_status
    on TEST_RESULT (result_status);

create index staff_number
    on TEST_RESULT (staff_number);

create index tc_cc
    on TEST_RESULT (tc_cc);

create index test_date
    on TEST_RESULT (test_date);

create index version
    on TEST_RESULT (version);

CREATE TABLE UPLOAD_QUEUE
(
    application_reference BIGINT      NOT NULL,
    staff_number          VARCHAR(10) NOT NULL,
    timestamp             DATETIME    NOT NULL,
    interface             TINYINT     NOT NULL,
    upload_status         TINYINT     NOT NULL,
    retry_count           INT         NOT NULL,
    error_message         VARCHAR(1000),
    PRIMARY KEY (application_reference, staff_number, interface),
    FOREIGN KEY (interface) REFERENCES INTERFACE_TYPE (id),
    FOREIGN KEY (upload_status) REFERENCES PROCESSING_STATUS (id)
);

CREATE TABLE AUDIT_EMAIL_REGEN
(
    application_reference BIGINT       NOT NULL,
    regenerated_date      TIMESTAMP    NOT NULL,
    previous_email        VARCHAR(200) NULL,
    new_email             VARCHAR(200) NOT NULL,
    previous_language     VARCHAR(10) NULL,
    new_language          VARCHAR(10)  NOT NULL,
    user_name             VARCHAR(200) NOT NULL,
    ticket_ref            VARCHAR(32)  NOT NULL
);

CREATE TABLE DUPLICATE_CERTIFICATES
(
    pass_certificate_number varchar(8) NOT NULL,
    times_cert_used         BIGINT     NOT NULL,
    test_details            json       NOT NULL,
    PRIMARY KEY (pass_certificate_number)
);

CREATE TABLE SPOILED_CERTIFICATES_STATUS
(
    id                  TINYINT PRIMARY KEY,
    spoiled_status_name VARCHAR(7)
);

INSERT INTO SPOILED_CERTIFICATES_STATUS(id, spoiled_status_name)
VALUES (0, 'MISSING'),
       (1, 'SPOILED'),
       (2, 'OTHER');

CREATE TABLE SPOILED_CERTIFICATES
(
    pass_certificate_number varchar(8)  NOT NULL,
    staff_number            varchar(10) NOT NULL,
    spoiled_date            date        NOT NULL,
    tc_id                   bigint      NOT NULL,
    status                  tinyint     NOT NULL,
    reason                  VARCHAR(1000) NULL,
    PRIMARY KEY (pass_certificate_number),
    constraint SPOILED_CERTIFICATES_ibfk_1
        foreign key (status) references SPOILED_CERTIFICATES_STATUS (id)
);
