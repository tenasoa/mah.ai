import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function getFileExtension(file: File): string {
  if (file.name.includes(".")) {
    return file.name.split(".").pop()!.toLowerCase();
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier image reçu" },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez JPG, PNG, WEBP ou GIF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image trop lourde (max 8 Mo)." },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Configuration serveur incomplète pour l'upload." },
        { status: 500 },
      );
    }

    const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    const extension = getFileExtension(file);
    const filePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await adminClient.storage
      .from("images")
      .upload(filePath, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Subject image upload error:", uploadError);
      return NextResponse.json(
        { error: "Échec de l'upload de l'image." },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = adminClient.storage.from("images").getPublicUrl(filePath);

    return NextResponse.json({
      publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error("Unexpected image upload error:", error);
    return NextResponse.json(
      { error: "Erreur inattendue pendant l'upload." },
      { status: 500 },
    );
  }
}
