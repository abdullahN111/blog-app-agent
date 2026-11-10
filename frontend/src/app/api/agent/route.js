import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    const geminiKeyHeader = request.headers.get("x-gemini-key");

    const headers = {
      "Content-Type": "application/json",
    };
    if (authHeader) headers.Authorization = authHeader;
    if (geminiKeyHeader) headers["X-Gemini-Key"] = geminiKeyHeader;

    const endpoint = body._endpoint === "assist" ? "/agent/assist" : "/agent";
    const payload = { ...body };
    delete payload._endpoint;

    const backendRes = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const text = await backendRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text || `Backend returned status ${backendRes.status}` };
    }

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          detail:
            data?.detail ||
            `Backend error (${backendRes.status}). Check your GEMINI_API_KEY or quota on FastAPI Cloud.`,
        },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error?.message ||
          "Could not reach the FastAPI backend server. Make sure it is running and awake.",
      },
      { status: 502 }
    );
  }
}

