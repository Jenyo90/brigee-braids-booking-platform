import Stripe from "stripe";

let _instance: Stripe | undefined;

function getInstance(): Stripe {
  return (_instance ??= new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  }));
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop: string | symbol) {
    const instance = getInstance();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
