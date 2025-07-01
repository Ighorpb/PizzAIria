import { NextRequest } from "next/server";
import { messageController } from "@/app/controllers/message.controller";

export async function POST(req: NextRequest) {
  return messageController.handlePost(req);
}

export async function GET() {
  return messageController.handleGet();
}
