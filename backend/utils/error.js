class ErrorUtils {
    static throwErrorIfValueIsEmpty(value, valueName) {
        if (!value) {
            throw new Error(`${valueName} must be filled`);
        }
    }
}

module.exports = ErrorUtils;