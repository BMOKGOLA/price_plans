
function pricePlanApp() {
    return {
        newPlan: { plan_name: '', call_price: 0, sms_price: 0 },
        updatePlan: { plan_name: '', call_price: 0, sms_price: 0 },
        deletePlan: { id: null },
        billCalculation: { plan_name: '', call_minutes: 0, sms_count: 0 },
        pricePlans: [],
        total: 0,
        callCost: 0,
        smsCost: 0,

        init() {
            this.fetchPricePlans();
        },

        async fetchPricePlans() {
            try {
                const response = await fetch('/api/price_plans');
                this.pricePlans = await response.json();
            } catch (error) {
                console.error('Error fetching price plans:', error);
            }
        },

        async createPricePlan() {
            try {
                const response = await fetch('/api/price_plan/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.newPlan),
                });

                if (response.ok) {
                    this.fetchPricePlans();
                    this.newPlan = { plan_name: '', call_price: 0, sms_price: 0 };
                } else {
                    console.error('Error creating price plan');
                }
            } catch (error) {
                console.error('Error creating price plan:', error);
            }
        },

        async updatePricePlan() {
            try {
                const response = await fetch('/api/price_plan/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.updatePlan),
                });

                if (response.ok) {
                    this.fetchPricePlans();
                    this.updatePlan = { plan_name: '', call_price: 0, sms_price: 0 };
                } else {
                    console.error('Error updating price plan');
                }
            } catch (error) {
                console.error('Error updating price plan:', error);
            }
        },

        async deletePricePlan() {
            try {
                const response = await fetch('/api/price_plan/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.deletePlan),
                });

                if (response.ok) {
                    this.fetchPricePlans();
                    this.deletePlan = { id: null };
                } else {
                    console.error('Error deleting price plan');
                }
            } catch (error) {
                console.error('Error deleting price plan:', error);
            }
        },

        async calculatePhoneBill() {
            try {
                const response = await fetch('/api/phonebill', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        price_plan: this.billCalculation.plan_name,
                        actions: `call:${this.billCalculation.call_minutes},sms:${this.billCalculation.sms_count}`,
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    this.total = result.total;

                    // Fetch the selected price plan to calculate individual costs
                    const selectedPlan = this.pricePlans.find(plan => plan.plan_name === this.billCalculation.plan_name);
                    if (selectedPlan) {
                        this.callCost = this.billCalculation.call_minutes * selectedPlan.call_price;
                        this.smsCost = this.billCalculation.sms_count * selectedPlan.sms_price;
                    }
                }
            } catch (error) {
                console.error('Error calculating phone bill:', error);
            }
        },
    };
}
