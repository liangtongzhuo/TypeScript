"use strict";
module.exports = (controller) => {
    return {
        'get /': controller.user.user,
    };
};
