exports.endDate = (numOfDays) => {
    // use the following to calculate expiry date
    let someDate = new Date();
    let numberOfDaysToAdd = numOfDays;
    let result = someDate.setDate(someDate.getDate() + numberOfDaysToAdd);

    return [result, new Date(result)]

}
