CREATE OR REPLACE FUNCTION batch_upsert_grades(payload JSONB)
RETURNS JSONB AS $$
DECLARE
    item JSONB;
    success_count INT := 0;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(payload)
    LOOP
        -- Coba Update dulu
        UPDATE sim.grades
        SET score = (item->>'score')::numeric
        WHERE academic_year_id = (item->>'academicYearId')::uuid
          AND subject_id = (item->>'subjectId')::uuid
          AND type = (item->>'type')::sim."GradeType"
          AND label = item->>'label'
          AND enrollment_id = (item->>'enrollmentId')::uuid;

        -- Jika tidak ada yang diupdate (berarti belum ada), lakukan Insert
        IF NOT FOUND THEN
            INSERT INTO sim.grades (
                id, enrollment_id, subject_id, teacher_id, academic_year_id, type, label, score, created_at
            ) VALUES (
                gen_random_uuid(),
                (item->>'enrollmentId')::uuid,
                (item->>'subjectId')::uuid,
                (item->>'teacherId')::uuid,
                (item->>'academicYearId')::uuid,
                (item->>'type')::sim."GradeType",
                item->>'label',
                (item->>'score')::numeric,
                NOW()
            );
        END IF;

        success_count := success_count + 1;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'count', success_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
