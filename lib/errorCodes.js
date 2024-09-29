const ERROR_CODES = {
    TOKEN_RENEWAL_FAILED: {
        code: 1001,
        message: "Failed to renew the token."
    },
    ACCOUNT_CREATION_FAILED: {
        code: 1002,
        message: "Failed to create an account."
    },
    LOGIN_FAILED: {
        code: 1003,
        message: "Failed to log in."
    },
    GENERAL_ERROR: {
        code: 1004,
        message: "An unknown error occurred."
    },
    USERNAME_ALREADY_EXISTS: {
        code: 1005,
        message: "The username already exists."
    },
    INVALID_LOGIN_CREDENTIALS: {
        code: 1006,
        message: "Invalid login credentials."
    },
    REFRESH_TOKEN_MISSING: {
        code: 1007,
        message: "Refresh token is missing in the request."
    },
    TOKEN_NOT_FOUND_IN_DB: {
        code: 1008,
        message: "The token does not exist in the database."
    },
    INVALID_TOKEN: {
        code: 1009,
        message: "The token is invalid."
    },
    SESSION_EXPIRED: {
        code: 1010,
        message: "The session has expired."
    },
    TOKEN_MISSING: {
        code: 1011,
        message: "The token is missing."
    },
    USERNAME_INVALID: {
        code: 1012,
        message: "The username does not meet the required criteria."
    },
    SIGNUP_PARAMETERS_MISSING: {
        code: 1013,
        message: "Please ensure to send the signup parameters in the request."
    },
    LOGIN_PARAMETERS_MISSING: {
        code: 1014,
        message: "Please ensure to send the login parameters in the request."
    },
    API_KEY_MISSING: {
        code: 1015,
        message: "No API key is provided in the request."
    },
    TOO_MANY_LOGIN_ATTEMPTS: {
        code: 1016,
        message: "Too many login attempts. Try again in 15 minutes."
    },
    GAMES_NOT_FOUND: {
        code: 1017,
        message: "Games not found."
    },
    INVALID_API_KEY: {
        code: 1018,
        message: "Invalid API key."
    },
    VALIDATION_ERROR: {
        code: 1019,
        message: "Validation failed for the provided data."
    },
};

module.exports = ERROR_CODES;
