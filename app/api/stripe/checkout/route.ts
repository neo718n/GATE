import { NextResponse } from "next/server";

// Deprecated: payment is now initiated via the initiatePayment server action.
export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use the enrollment page to initiate payment." },
    { status: 410 }
  );
}
