export type product_details = {
    product_name: string,
    product_price: number,
    product_fees: number,
    interest_rate: number
}
export type Location = "" | "Ajah - Lagos" | "Agege - Lagos" | "Ibadan"
export interface AvailableProductsForLocation {
    "Ajah - Lagos": product_details[],
    "Agege - Lagos": product_details[],
    "Ibadan": product_details[],
}
export type InstallmentPayment = {
    daily_installment: string,
    total_daily_payment_over_tenure: string,
    weekly_installment: string,
    total_weekly_payment_over_tenure: string,
}