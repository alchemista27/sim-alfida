CREATE OR REPLACE FUNCTION batch_upsert_attendance(payload JSONB)
RETURNS JSONB AS $$
DECLARE
    item JSONB;
    success_count INT := 0;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(payload)
    LOOP
        INSERT INTO sim.attendances (
            id, enrollment_id, subject_id, teacher_id, date, status, notes, created_at
        ) VALUES (
            gen_random_uuid(),
            (item->>'enrollmentId')::uuid,
            (item->>'subjectId')::uuid,
            (item->>'teacherId')::uuid,
            (item->>'date')::date,
            (item->>'status')::sim."AttendanceStatus",
            item->>'notes',
            NOW()
        )
        ON CONFLICT (enrollment_id, subject_id, date)
        DO UPDATE SET
            status = EXCLUDED.status,
            notes = EXCLUDED.notes;

        success_count := success_count + 1;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'count', success_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
