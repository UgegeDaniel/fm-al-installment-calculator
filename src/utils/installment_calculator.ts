function pmt(rate: number, nper: number, pv: number) {
  if (rate === 0) return -(pv / nper);
  return (rate * pv) / (1 - Math.pow(1 + rate, -nper));
}

export default pmt;