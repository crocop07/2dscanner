Feature: 2D Barcode payload parsing and validation
As a Royal mail sorter on shift I want to scan  2D Data Matrix barcodes
so I can verify the raw payload length and extract the MCSL or DOSL code accurately.

Scenario:Extract MCSL from a valid 220 character payload
    Given a raw barcode payload with a string length of 220
    When the payload is parsed by the app
    Then 'isValid220' should be true
    And the extracted MSCL code should be "MCSL000001000"

Scenario Outline: Validate payload length handling
    Given a raw barcode payload string with length <payload_length>
    When the payload is parsed by the app
    Then "isValid220" should be <is-valid>

    Examples
    | payload_length | is_valid |
    | 220            | true     |
    | 180            | false    |
    | 219            | false    |

    Scenario: Fallback MCSL extraction on truncated payloads
        Given a short barcode string "UPU1234MCSL000001248TRUNCATED"
        When the payload is parsed by the app
        Then "isValid220" should be falseAnd the extracted MCSL code should be "MCSL000001248"