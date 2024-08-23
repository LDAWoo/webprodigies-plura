import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export type Address = {
    city: string;
    state: string;
    country: string;
    postal_code: string;
    line1: string;
};

export type ShippingInfo = {
    name: string;
    address: Address;
};

export type StripeCustomerType = {
    email: string;
    name: string;
    shipping: ShippingInfo;
    address: Address;
};

export type PricesList = Stripe.ApiList<Stripe.Price>;

export async function POST(req: Request) {
    const { address, email, name, shipping }: StripeCustomerType = await req.json();

    if (!email || !address || !name || !shipping) {
        return new NextResponse("Missing data", { status: 400 });
    }

    try {
        const customer = await stripe.customers.create({
            email,
            name,
            shipping,
            address,
        });
        return Response.json({
            customerId: customer.id,
            message: "Customer created successfully",
        });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
