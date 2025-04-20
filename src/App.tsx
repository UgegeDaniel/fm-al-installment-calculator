import React, { useEffect, useState } from "react";
import pmt from "./utils/installment_calculator";
import { InstallmentPayment, Location, product_details } from "./types";
import availableProductsForLocation from "./data";
import { AVAILABLE_TENURES_IN_MONTHS } from "./utils/constants";
import formatMoney from "./utils/money_formatter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import Logo from "./assets/img/fm_logo.png"
import { TypographyTable } from "./Table";

const App: React.FC = () => {
  const [location, setLocation] = useState<Location>("");
  const [product, setProduct] = useState<product_details | null>(null);
  const [tenure, setTenure] = useState<number>();
  const [downPayment, setDownPayment] = useState<number | null>(product ? (0.1 * product.product_price) : null);
  const [installmentPayment, setInstallmentPayment] = useState<InstallmentPayment | null>(null)

  const availableLocations = Object.keys(availableProductsForLocation);

  useEffect(() => { 
    if(product)
    setDownPayment(0.1 * product?.product_price)
  }, [product])

  useEffect(() => {
    if (product && tenure) {
      const down_payment = downPayment ? downPayment : (0.1 * product?.product_price);
      const loanAmount = product?.product_price + product?.product_fees - down_payment;

      //Daily Repayment Calculation
      const number_of_daily_installments = (tenure / 12) * 52 * 6;
      const dailyRate = (tenure * (product.interest_rate / 100)) / number_of_daily_installments
      const dailyPayment = pmt(dailyRate, number_of_daily_installments, loanAmount);

      //Weekly Repayment Calculation 
      const number_of_weekly_installments = (tenure / 12) * 52;
      const weeklyRate = (tenure * (product.interest_rate / 100)) / number_of_weekly_installments
      const weekly_payment = pmt(weeklyRate, number_of_weekly_installments, loanAmount);

      setInstallmentPayment({
        ...installmentPayment,
        daily_installment: formatMoney(parseInt(Math.abs(dailyPayment).toFixed(2))),
        total_daily_payment_over_tenure: formatMoney(dailyPayment * number_of_daily_installments + down_payment),
        weekly_installment: formatMoney(parseInt(Math.abs(weekly_payment).toFixed(2))),
        total_weekly_payment_over_tenure: formatMoney(weekly_payment * number_of_weekly_installments + down_payment),
      })
    }
    console.log(installmentPayment, { location, tenure, product })
  }, [location, tenure, product, downPayment])
  return (
    <div className="mr-3 ml-3 flex justify-center align-center mt-3">
      <Card className="w-[550px] space-y-4 shadow-2xl">
        <CardHeader className="flex justify-between align-center">
          <div>
            <CardTitle style={{ color: "#37a477" }}>Fairmoney Microfinance Bank <span style={{ color: "#000435" }}>Asset Lending</span> </CardTitle>
            <CardDescription style={{ color: "#000435", fontWeight: "bold" }}>Loan Payment Installment Calculator</CardDescription>
          </div>
          <Avatar>
            <AvatarImage src={Logo}/>
            <AvatarFallback>FMB</AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4 ">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex flex-1 flex-col space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={location}
                    onValueChange={(value) => {
                      setLocation(value as Location);
                      setProduct(null);
                      setTenure(undefined);
                    }}>
                    <SelectTrigger id="location" className="min-w-[100%]">
                      <SelectValue placeholder="Available Locations" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {availableLocations.map((location) => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-1 flex-col space-y-1.5">
                  <Label htmlFor="location">Available Products</Label>
                  <Select
                    value={product?.product_name || ""}
                    onValueChange={(value) => {
                      const selectedProduct =
                        availableProductsForLocation[location as keyof typeof availableProductsForLocation]?.find(
                          (p) => p.product_name === value
                        ) || null;
                      setProduct(selectedProduct);
                      setTenure(undefined);
                    }}
                    disabled={!location}
                  >
                    <SelectTrigger id="product" className="min-w-[100%]">
                      <SelectValue placeholder={`Products at ${location}`} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {location && availableProductsForLocation[location]?.map((product) => (
                        <SelectItem key={product.product_name} value={product.product_name}>{product.product_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {product && (
                    <p className="mt-3 border-l-2 pl-3 pr-3 text-xl text-muted-foreground text-xs" style={{ color: "#37a477" }}>
                      This product costs {formatMoney(product.product_price)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex  flex-1 flex-col space-y-1.5">
                  <Label htmlFor="location">Tenure</Label>
                  <Select
                    value={tenure?.toString() || ""}
                    onValueChange={(value) => setTenure(parseInt(value))}
                    disabled={!product}
                  >
                    <SelectTrigger id="location" className="min-w-[100%]">
                      <SelectValue placeholder="Pick your preferred tenure" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {product &&
                        AVAILABLE_TENURES_IN_MONTHS.map((t) => (
                          <SelectItem key={t} value={t.toString()}>{t} Months</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-1 flex-col space-y-1.5">
                  <Label htmlFor="downPayment">Initial deposit</Label>
                  <Input
                    id="downPayment"
                    placeholder="Enter your initial deposit - minimum of 10% of Asset cost"
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
          {!location && (
            <p className="mt-3 border-l-2 border-r-2 pl-3 pr-3 text-xl text-muted-foreground text-xs" style={{ color: "#37a477" }}>
              Kindly select your desired location
            </p>
          )}
          {location && !product && (
            <p className="mt-3 border-l-2 border-r-2 pl-3 pr-3 text-xl text-muted-foreground text-xs" style={{ color: "#37a477" }}>
              Kindly select your product
            </p>
          )}
          {location && product && !tenure &&(
            <p className="mt-3 border-l-2 border-r-2 pl-3 pr-3 text-xl text-muted-foreground text-xs" style={{ color: "#37a477" }}>
              Kindly select your payment tenure
            </p>
          )}
          {location && product && tenure && (downPayment! < (0.1 * product.product_price)) && (
            <p className="mt-3 border-l-2 border-r-2 pl-3 pr-3 text-xl text-muted-foreground text-xs" style={{ color: "#37a477" }}>
              You have to make at least 10% minimum down Payment
            </p>
          )}
          {location && product && tenure && (downPayment! >= product.product_price) && (
            <p className="mt-3 border-l-2 border-r-2 pl-3 pr-3 text-xl text-muted-foreground text-xs" style={{ color: "#37a477" }}>
              You cannot pay more than the asset cost
            </p>
          )}
          {product && location && tenure && (downPayment! >= (0.1 * product.product_price)) && (downPayment! < product.product_price) &&(
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
