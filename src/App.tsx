import React, { useEffect, useState } from "react";
import pmt from "./utils/installment_calculator";
import { InstallmentPayment } from "./types";
import { AVAILABLE_TENURES_IN_MONTHS } from "./utils/constants";
import formatMoney from "./utils/money_formatter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import Logo from "./assets/img/fm_logo.png"
// import { TypographyTable } from "./Table";

const App: React.FC = () => {
  const [subsidy, setSubsidy] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [tenure, setTenure] = useState<number>();
  const [downPayment, setDownPayment] = useState<number | null>(price ? (0.1 * price) : null);
  const [installmentPayment, setInstallmentPayment] = useState<InstallmentPayment | null>(null)

  const COST_OF_TRACKER = 80000
  const INTEREST_RATE = 4.99

  useEffect(() => {
    if (price)
      setDownPayment(0.1 * price)
  }, [price])

  // useEffect(() => {
  //   if (price && subsidy) setPrice(price - subsidy)
  // }, [subsidy])

  const calculateLoanAmountAndDownPayment = (price: number) => {
    const processing_fee = price < 2000000 ? 40000 : 600000;
    const productFees = (0.05 * price) + processing_fee + COST_OF_TRACKER
    const down_payment = downPayment ? downPayment : (0.1 * price);
    const loanAmount = price + productFees - down_payment;
    return { loanAmount, down_payment }
  }

  function PMT(rate:number, nper: number, pv:number, fv = 0, type = 0) {
    if (rate === 0) {
      return -(pv + fv) / nper;
    }

    const pvif = Math.pow(1 + rate, nper);
    let pmt = rate / (pvif - 1) * -(pv * pvif + fv);

    if (type === 1) {
      pmt /= (1 + rate);
    }

    return pmt;
  }

  useEffect(() => {
    const loanAmountAndDownPayment = (price && subsidy) ? calculateLoanAmountAndDownPayment(price - subsidy) : calculateLoanAmountAndDownPayment(price!)
    if (price && tenure) {
      //Daily Repayment Calculation
      const number_of_daily_installments = (tenure / 12) * 52 * 6;
      const dailyRate = (tenure * (INTEREST_RATE / 100)) / number_of_daily_installments
      const dailyPayment = pmt(dailyRate, number_of_daily_installments, loanAmountAndDownPayment.loanAmount);

      //Weekly Repayment Calculation 
      const number_of_weekly_installments = (tenure / 12) * 52;
      const weeklyRate = (tenure * (INTEREST_RATE / 100)) / number_of_weekly_installments
      const weekly_payment = pmt(weeklyRate, number_of_weekly_installments, loanAmountAndDownPayment.loanAmount);

      setInstallmentPayment({
        ...installmentPayment,
        daily_installment: formatMoney(parseInt(Math.abs(dailyPayment).toFixed(2))),
        total_daily_payment_over_tenure: formatMoney(dailyPayment * number_of_daily_installments + loanAmountAndDownPayment.down_payment),
        weekly_installment: formatMoney(parseInt(Math.abs(weekly_payment).toFixed(2))),
        total_weekly_payment_over_tenure: formatMoney(weekly_payment * number_of_weekly_installments + loanAmountAndDownPayment.down_payment),
      })
    }
  }, [tenure, price, downPayment, subsidy])
  return (
    <div className="mr-3 ml-3 flex justify-center align-center mt-3">
      <Card className="w-[550px] space-y-4 shadow-2xl">
        <CardHeader className="flex justify-between align-center">
          <div>
            <CardTitle style={{ color: "#37a477" }}>Fairmoney Microfinance Bank <span style={{ color: "#000435" }}>Asset Lending</span> </CardTitle>
            <CardDescription style={{ color: "#000435", fontWeight: "bold" }}>Loan Payment Installment Calculator</CardDescription>
          </div>
          <Avatar>
            <AvatarImage src={Logo} />
            <AvatarFallback>FMB</AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4 ">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex flex-1 flex-col space-y-1.5">
                  <Label htmlFor="price">Asset Price</Label>
                  <Input
                    id="price"
                    placeholder="Enter the asset cost"
                    className="min-w-[100%]"
                    value={price as number}
                    type="number"
                    onChange={(e) => {
                      setPrice(Number(e.target.value));
                    }}
                  />
                  {price && subsidy && (<p className="mt-3 border-l-2 border-r-2 pl-3 pr-3 text-xl text-muted-foreground text-xs" style={{ color: "#37a477" }}>
                    New Asset Price is <span className="bold">{price && subsidy ? price - subsidy : ""}</span>
                  </p>)}
                </div>
                <div className="flex flex-1 flex-col space-y-1.5">
                  <Label htmlFor="subsidy">Subsidy</Label>
                  <Input
                    id="subsidy"
                    placeholder="Enter the subsidy amount"
                    className="min-w-[100%]"
                    value={subsidy as number}
                    type="number"
                    onChange={(e) => {
                      setSubsidy(Number(e.target.value));
                    }}
                  />
                </div>

              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex  flex-1 flex-col space-y-1.5">
                  <Label htmlFor="tenure">Tenure</Label>
                  <Select
                    value={tenure?.toString() || ""}
                    onValueChange={(value) => setTenure(parseInt(value))}
                    disabled={!price}
                  >
                    <SelectTrigger id="location" className="min-w-[100%]">
                      <SelectValue placeholder="Pick your preferred tenure" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {price &&
                        AVAILABLE_TENURES_IN_MONTHS.map((t) => (
                          <SelectItem key={t} value={t.toString()}>{t} Months</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-1 flex-col space-y-1.5">
                  <Label htmlFor="downPayment">Initial down payment</Label>
                  <Input
                    id="downPayment"
                    placeholder="Enter your initial down payment - minimum of 10% of Asset cost"
                    className="min-w-[100%]"
                    value={downPayment as number}
                    type="number"
                    onChange={(e) => {
                      setDownPayment(Number(e.target.value));
                    }}
                  />
                </div>
              </div>
            </div>
          </form>

          {!price && (
            <p className="mt-3 border-l-2 border-r-2 pl-3 pr-3 text-xl text-muted-foreground text-xs" style={{ color: "#37a477" }}>
              Kindly insert a price
            </p>
          )}
          {price && !tenure && (
            <p className="mt-3 border-l-2 border-r-2 pl-3 pr-3 text-xl text-muted-foreground text-xs" style={{ color: "#37a477" }}>
              Kindly select your payment tenure
            </p>
          )}
          {price && tenure && (downPayment! < (0.1 * price)) && (
            <p className="mt-3 border-l-2 border-r-2 pl-3 pr-3 text-xl text-muted-foreground text-xs" style={{ color: "#37a477" }}>
              You have to make at least 10% minimum down Payment
            </p>
          )}
          {price && tenure && (downPayment! >= price) && (
            <p className="mt-3 border-l-2 border-r-2 pl-3 pr-3 text-xl text-muted-foreground text-xs" style={{ color: "#37a477" }}>
              You cannot pay more than the asset cost
            </p>
          )}
          {price && tenure && (downPayment! >= (0.1 * price)) && (downPayment! < price) && (
            <blockquote className="mt-3 border-l-2 border-r-2 pl-3 pr-3 italic text-xs">
              After making a down payment of
              <strong style={{ color: "#37a477" }}> {formatMoney(downPayment as number)} </strong> <br />
              You will be required to pay
              <strong style={{ color: "#37a477" }}> {installmentPayment?.daily_installment} </strong>
              daily amounting to
              <strong style={{ color: "#37a477" }}> {installmentPayment?.total_daily_payment_over_tenure} </strong>
              over the course of {tenure} months. <br /><br />
              <strong style={{ color: "#37a477" }}>Or:</strong><br /><br />
              You can pay
              <strong style={{ color: "#37a477" }}> {installmentPayment?.weekly_installment} </strong>
              weekly amounting to
              <strong style={{ color: "#37a477" }}> {installmentPayment?.total_weekly_payment_over_tenure} </strong>
              over the course of {tenure} months.
            </blockquote>
          )}

          {/* <TypographyTable/> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
