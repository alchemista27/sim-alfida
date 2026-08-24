CREATE OR REPLACE FUNCTION calculate_lhbs_grades(
    p_enrollment_id UUID,
    p_semester TEXT -- 'mid' atau 'final'
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    WITH raw_grades AS (
        SELECT 
            subject_id,
            type,
            score
        FROM sim.academic_grades
        WHERE enrollment_id = p_enrollment_id
          AND type IN (
              'daily', 
              'exam', 
              CASE WHEN p_semester = 'mid' THEN 'ats' ELSE 'aas' END
          )
    ),
    aggregated_grades AS (
        SELECT 
            subject_id,
            AVG(CASE WHEN type = 'daily' THEN score END) as avg_daily,
            AVG(CASE WHEN type = 'exam' THEN score END) as avg_exam,
            AVG(CASE WHEN type IN ('ats', 'aas') THEN score END) as avg_summative
        FROM raw_grades
        GROUP BY subject_id
    ),
    calculated_scores AS (
        SELECT 
            a.subject_id,
            s.code as subject_code,
            s.name as subject_name,
            COALESCE(a.avg_daily, 0) as avg_daily,
            COALESCE(a.avg_exam, 0) as avg_exam,
            COALESCE(a.avg_summative, 0) as avg_summative,
            CASE 
                WHEN a.avg_summative IS NOT NULL THEN (COALESCE(a.avg_daily, 0) * 0.4) + (COALESCE(a.avg_exam, 0) * 0.3) + (a.avg_summative * 0.3)
                WHEN a.avg_exam IS NOT NULL THEN (COALESCE(a.avg_daily, 0) * 0.5) + (a.avg_exam * 0.5)
                ELSE COALESCE(a.avg_daily, 0)
            END as final_score
        FROM aggregated_grades a
        JOIN sim.academic_subjects s ON a.subject_id = s.id
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'subjectId', subject_id,
            'subjectCode', subject_code,
            'subjectName', subject_name,
            'finalScore', ROUND(final_score::numeric, 2),
            'predicate', CASE 
                WHEN final_score >= 90 THEN 'A'
                WHEN final_score >= 80 THEN 'B'
                WHEN final_score >= 70 THEN 'C'
                ELSE 'D'
            END
        )
    ) INTO result
    FROM calculated_scores;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
