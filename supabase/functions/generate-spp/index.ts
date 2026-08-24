import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the payload
    const body = await req.json()
    const { unitId, academicYearId, month, year, amount, generatedBy } = body

    if (!unitId || !academicYearId || !month || !year || !amount) {
      throw new Error("Missing required fields")
    }

    // 1. Get all active enrollments for this unit and academic year
    const { data: enrollments, error: enrollmentsError } = await supabaseClient
      .from('student_enrollments')
      .select('id, sim_classes!inner(unit_id)')
      .eq('academic_year_id', academicYearId)
      .eq('status', 'active')
      .eq('sim_classes.unit_id', unitId)

    if (enrollmentsError) throw enrollmentsError
    if (!enrollments || enrollments.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0, message: "No active students found" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const enrollmentIds = enrollments.map((e: any) => e.id)

    // 2. Check for existing invoices
    const { data: existingInvoices, error: existingError } = await supabaseClient
      .from('spp_invoices')
      .select('enrollment_id')
      .eq('month', month)
      .eq('year', year)
      .in('enrollment_id', enrollmentIds)

    if (existingError) throw existingError

    const existingIds = new Set(existingInvoices?.map(i => i.enrollment_id) || [])
    const newEnrollments = enrollmentIds.filter(id => !existingIds.has(id))

    if (newEnrollments.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0, message: "All invoices already generated" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Prepare inserts
    const inserts = newEnrollments.map(enrollmentId => ({
      enrollment_id: enrollmentId,
      month,
      year,
      amount,
      status: 'unpaid',
      generated_by: generatedBy,
      created_at: new Date().toISOString()
    }))

    // 4. Bulk insert
    const { error: insertError } = await supabaseClient
      .from('spp_invoices')
      .insert(inserts)

    if (insertError) throw insertError

    return new Response(JSON.stringify({ 
      success: true, 
      count: inserts.length, 
      message: `Successfully generated ${inserts.length} invoices` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
