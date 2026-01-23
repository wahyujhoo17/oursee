import { UTApi } from "uploadthing/server";
import { NextRequest, NextResponse } from "next/server";

const utapi = new UTApi();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileKeys } = body;

    if (!fileKeys || !Array.isArray(fileKeys) || fileKeys.length === 0) {
      return NextResponse.json(
        { error: "File keys are required" },
        { status: 400 },
      );
    }

    // Delete files from UploadThing
    await utapi.deleteFiles(fileKeys);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${fileKeys.length} file(s)`,
      deletedKeys: fileKeys,
    });
  } catch (error) {
    console.error("Error deleting files from UploadThing:", error);
    return NextResponse.json(
      { error: "Failed to delete files" },
      { status: 500 },
    );
  }
}
