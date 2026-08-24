import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { renderToStream } from "@react-pdf/renderer"
import React from "react"
import { AcceptanceLetterDocument } from "./templates/acceptance-letter.tsx"
import { ImcLetterDocument } from "./templates/imc-letter.tsx"
import { LessonPlanDocument } from "./templates/LessonPlanDocument.tsx"
import { LhbsDocument } from "./templates/LhbsDocument.tsx"
import { ClassScheduleDocument } from "./templates/ClassScheduleDocument.tsx"
import { ExtraScheduleDocument } from "./templates/ExtraScheduleDocument.tsx"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { type, props } = body

    if (!type || !props) {
      throw new Error("Tipe dokumen dan props wajib disertakan")
    }

    let DocumentComponent;

    switch (type) {
      case 'acceptance':
        DocumentComponent = React.createElement(AcceptanceLetterDocument, props);
        break;
      case 'imc':
        DocumentComponent = React.createElement(ImcLetterDocument, props);
        break;
      case 'lesson-plan':
        DocumentComponent = React.createElement(LessonPlanDocument, props);
        break;
      case 'lhbs':
        DocumentComponent = React.createElement(LhbsDocument, props);
        break;
      case 'class-schedule':
        DocumentComponent = React.createElement(ClassScheduleDocument, props);
        break;
      case 'extra-schedule':
        DocumentComponent = React.createElement(ExtraScheduleDocument, props);
        break;
      default:
        throw new Error(`Tipe dokumen ${type} tidak didukung`);
    }

    const stream = await renderToStream(DocumentComponent);
    
    // We need to return a Response with the stream. 
    // Deno's Response accepts standard ReadableStream, but renderToStream returns a Node stream.
    // However, @react-pdf/renderer in ESM provides a Web Stream or we can just convert it.
    // Actually, in the browser build (which esm.sh serves if we don't specify target=deno), it might return a Web Stream!
    // Or we can just use renderToBuffer to be safe.
    
    // Let's use renderToStream and pipe it properly, or just use renderToStream (which might just be a web stream in Deno)
    return new Response(stream as unknown as ReadableStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error: any) {
    console.error("PDF Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
