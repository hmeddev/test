// Handler.js

// دالة مركزية لتنسيق الأخطاء
function createErrorResponse(errorObj = {}, errorMsg = "Unknown error") {
    return {
        status: false,
        error_msg: errorObj.message || errorMsg,
        error_msg2:errorMsg,
        error_code: errorObj.code || 1,
        data: null
    };
}

// دالة مركزية لإنشاء استجابة ناجحة
function createSuccessResponse(data = {}, message = "Success") {
    return {
        status: true,
        error_msg: ":)",
        error_code: 0,
        data: { ...data, message }
    };
}

function main() {
    return {
        expiresIn: "1h",
        path:"GameBBSEmbassy"
    };
}

// تصدير الدوال
module.exports = {
    createErrorResponse,
    createSuccessResponse,
    main
};
