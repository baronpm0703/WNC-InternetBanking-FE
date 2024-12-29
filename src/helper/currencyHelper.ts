const convertToCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const currencyHelper = { convertToCurrency }
export default currencyHelper;