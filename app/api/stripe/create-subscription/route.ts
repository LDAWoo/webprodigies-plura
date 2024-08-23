import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const { customerId, priceId } = await req.json();
    if (!customerId || !priceId) {
        return new NextResponse("Customer Id or price id is missing", {
            status: 400,
        });
    }

    const subscriptionExits = await db.agency.findFirst({
        where: {
            customerId,
        },
        include: {
            Subscription: true,
        },
    });

    try {
        if (subscriptionExits?.Subscription?.subscritiptionId && subscriptionExits?.Subscription?.active) {
            if (!subscriptionExits?.Subscription.subscritiptionId) {
                throw new Error("Could not find the subscription ID to update the subscription.");
            }
            console.log("Updating the subscription");

            const currentSubscriptionDetails = await stripe.subscriptions.retrieve(subscriptionExits.Subscription.subscritiptionId);

            const subscription = await stripe.subscriptions.update(subscriptionExits.Subscription.subscritiptionId, {
                items: [
                    {
                        id: currentSubscriptionDetails.items.data[0].id,
                        deleted: true,
                    },
                    {
                        price: priceId,
                    },
                ],

                expand: ["latest_invoice.payment_intent"],
            });

            const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
            const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;
            const clientSecret = paymentIntent.client_secret;

            return NextResponse.json({
                subscriptionId: subscription.id,
                clientSecret,
            });
        } else {
            console.log("Creating a new subscription");
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [
                    {
                        price: priceId,
                    },
                ],
                payment_behavior: "default_incomplete",
                payment_settings: {
                    save_default_payment_method: "on_subscription",
                },
                expand: ["latest_invoice.payment_intent"],
            });

            const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
            const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;
            const clientSecret = paymentIntent.client_secret;

            return NextResponse.json({
                subscriptionId: subscription.id,
                clientSecret,
            });
        }
    } catch (error) {}
}
