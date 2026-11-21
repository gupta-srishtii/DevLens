import { NextResponse } from "next/server";
import { filePathSchema, repositorySchema } from "@/lib/repository";
import { repositoryContents } from "@/lib/github/files";
import { apiError, guardRequest } from "@/lib/api";

export async function GET(request: Request) {
  try {
    guardRequest(request);
    const params = new URL(request.url).searchParams;
    const ref = repositorySchema.parse(params.get("repo"));
    const path = filePathSchema.parse(params.get("path") ?? "");
    return NextResponse.json(await repositoryContents(ref, path), { headers: { "Cache-Control": "private, max-age=60" } });
  } catch (error) { return apiError(error); }
}
