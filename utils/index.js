exports.removeEmpty = (arr) => {
    return arr.filter(function (ele) {
        return ele != '';
    });
}

