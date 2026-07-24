import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    let privateKey = process.env.IMAGEKIT_PRIVATE_KEY!;
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

    // Strip "private_" prefix if it exists
    if (privateKey.startsWith("private_")) {
      privateKey = privateKey.substring(8); // Remove "private_"
    }

    // Generate authentication parameters for client-side upload
    const token = crypto.randomBytes(10).toString("hex");
    const expire = Math.floor(Date.now() / 1000) + 15 * 60; // Valid for 15 minutes

    // Create signature
    const auth = `${token}${expire}${privateKey}`;
    const signature = crypto.createHash("sha1").update(auth).digest("hex");

    return NextResponse.json({
      token,
      expire,
      signature,
      publicKey,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
