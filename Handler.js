// دالة مركزية لتنسيق الأخطاء
function createErrorResponse(errorMsg, errorCode = 1) {
    return {
        status: false,
        error_msg: errorMsg || "Unknown error",
        error_code: errorCode,
        data: null
    };
}

// دالة مركزية لإنشاء استجابة ناجحة
function createSuccessResponse(data = {}) {
    return {
        status: true,
        error_msg: ":)",
        error_code: 0,
        data: data
    };
}

// تصدير الدوال
module.exports = {
    createErrorResponse,
    createSuccessResponse
};
