function PhoneBill(phoneString, callCost, smsCost) {
    let total = 0;
    const actions = phoneString.split(',');

    actions.forEach(action => {
        action = action.trim();
        if (action === 'call') {
            total += callCost;
        } else if (action === 'sms') {
            total += smsCost;
        }
    });

    return total;
}
export default PhoneBill;


