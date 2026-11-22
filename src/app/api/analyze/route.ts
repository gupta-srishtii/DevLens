import { NextResponse } from "next/server";
import { repositorySchema } from "@/lib/repository";
import { analyzeRepository } from "@/lib/github/analyze";
import { apiError, guardRequest } from "@/lib/api";

export const maxDuration = 60;
export async function GET(request: Request) {
  try {
    guardRequest(request);
    const ref = repositorySchema.parse(new URL(request.url).searchParams.get("repo"));
    return NextResponse.json(await analyzeRepository(ref), {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch (error) {
    return apiError(error);
  }
}
